import { User } from '../models/user.model.js';
import { Message } from '../models/message.model.js';
import { getReceiverSocketId, io } from '../lib/socket.js';

export const getAllUsers = async (req, res, next) => {
  try {
    const myId = req.currentUser._id; // protectRoute 미들웨어에서 바인딩해 준 Mongoose ObjectId 사용

    // 내 자신을 제외한 가입자 목록 조회
    const users = await User.find({ _id: { $ne: myId } });

    // 각 사용자별로 내가 읽지 않은 메시지 존재 여부 및 마지막 대화 시간 주입
    const usersWithUnreadStatus = await Promise.all(
      users.map(async (user) => {
        const hasUnread = await Message.exists({
          senderId: user._id,
          receiverId: myId,
          isRead: false,
        });

        // 마지막 대화 메시지 조회
        const lastMessage = await Message.findOne({
          $or: [
            { senderId: myId, receiverId: user._id },
            { senderId: user._id, receiverId: myId },
          ],
        })
          .sort({ createdAt: -1 })
          .select('createdAt');

        const userObj = user.toObject();
        userObj.hasUnread = !!hasUnread;
        userObj.lastMessageAt = lastMessage
          ? lastMessage.createdAt
          : new Date(0);
        return userObj;
      }),
    );

    // 최근 메시지가 오간 순서대로 정렬
    usersWithUnreadStatus.sort(
      (a, b) =>
        new Date(b.lastMessageAt).getTime() -
        new Date(a.lastMessageAt).getTime(),
    );

    res.status(200).json(usersWithUnreadStatus);
  } catch (error) {
    console.log('get all users error', error);
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const myId = req.currentUser._id; // protectRoute 미들웨어에서 바인딩해 준 Mongoose ObjectId 사용
    const { userId } = req.params; // 상대방의 MongoDB _id

    // 1. 먼저 메시지 목록을 조회 (isRead가 기존 상태 그대로 보존되도록)
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userId },
        { senderId: userId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    // 2. 그 다음 상대방이 나에게 보낸 메시지들을 일괄 읽음(isRead: true) 처리
    await Message.updateMany(
      { senderId: userId, receiverId: myId, isRead: false },
      { isRead: true },
    );

    res.status(200).json(messages);
  } catch (error) {
    console.log('Error in getMessages: ', error);
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const myId = req.currentUser._id; // protectRoute 미들웨어에서 바인딩해 준 Mongoose ObjectId 사용
    const { receiverId } = req.params; // 상대방의 MongoDB _id
    const { content } = req.body;

    const newMessage = new Message({
      senderId: myId,
      receiverId,
      content,
      isRead: false, // 신규 메시지는 기본 안 읽음
    });

    await newMessage.save();

    // 상대방이 온라인 상태인 경우 실시간 소켓 발송
    const receiver = await User.findById(receiverId);
    if (receiver) {
      const receiverSocketId = getReceiverSocketId(receiver.clerkId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('newMessage', newMessage);
      }
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log('Error in sendMessage: ', error);
    next(error);
  }
};

export const clearMessages = async (req, res, next) => {
  try {
    const myId = req.currentUser._id;
    const { userId } = req.params; // 상대방의 MongoDB _id

    const receiver = await User.findById(userId);
    if (!receiver) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 나와 상대방 사이의 모든 메시지 삭제
    await Message.deleteMany({
      $or: [
        { senderId: myId, receiverId: userId },
        { senderId: userId, receiverId: myId },
      ],
    });

    // 상대방 소켓으로 실시간 삭제 알림 발송
    const receiverSocketId = getReceiverSocketId(receiver.clerkId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('messagesCleared', { clearedWith: myId });
    }

    res
      .status(200)
      .json({ success: true, message: 'Chat messages erased successfully' });
  } catch (error) {
    console.log('Error in clearMessages: ', error);
    next(error);
  }
};
