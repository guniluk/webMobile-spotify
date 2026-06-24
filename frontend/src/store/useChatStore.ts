import { create } from "zustand";
import { axiosInstance, getErrorMessage } from "@/lib/axios";
import { io, Socket } from "socket.io-client";

export interface User {
  _id: string;
  clerkId: string;
  fullName: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  hasUnread?: boolean;
  lastMessageAt?: string;
}

export interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ChatStore {
  users: User[];
  messages: Message[];
  selectedUser: User | null;
  isLoading: boolean;
  error: string | null;
  onlineUsers: string[]; // online clerkIds
  userActivities: Record<string, { status: string; activity: string | null }>;
  unreadUsers: string[]; // 읽지 않은 메시지가 있는 유저의 MongoDB _id 목록
  isChatActive: boolean; // 사용자가 현재 채팅 메뉴(/chat)를 활성으로 보고 있는지 여부
  socket: Socket | null;

  fetchUsers: () => Promise<void>;
  fetchMessages: (userId: string) => Promise<void>;
  sendMessage: (receiverId: string, content: string) => Promise<void>;
  clearMessages: (userId: string) => Promise<void>;
  setSelectedUser: (user: User | null) => void;
  setIsChatActive: (active: boolean) => void;
  connectSocket: (clerkId: string) => void;
  disconnectSocket: () => void;
  initiateActivityUpdate: (status: string, activity: string | null) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  users: [],
  messages: [],
  selectedUser: null,
  isLoading: false,
  error: null,
  onlineUsers: [],
  userActivities: {},
  unreadUsers: [],
  isChatActive: false,
  socket: null,

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get("/users");
      const fetchedUsers = response.data;
      set({ users: fetchedUsers });

      // 유저 목록 조회 시 안 읽은 메시지가 있는 사용자 ID 추출하여 세팅
      const initialUnread = fetchedUsers
        .filter((u: User) => u.hasUnread)
        .map((u: User) => u._id);
      set({ unreadUsers: initialUnread });
    } catch (error) {
      set({ error: getErrorMessage(error, "Failed to fetch users") });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMessages: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get(`/users/messages/${userId}`);
      set({ messages: response.data });

      // 대화창을 불러와 읽음 처리하였으므로 unread 목록에서 제거
      const { unreadUsers } = get();
      if (unreadUsers.includes(userId)) {
        set({
          unreadUsers: unreadUsers.filter((id) => id !== userId),
        });
      }
    } catch (error) {
      set({ error: getErrorMessage(error, "Failed to fetch messages") });
    } finally {
      set({ isLoading: false });
    }
  },

  sendMessage: async (receiverId: string, content: string) => {
    try {
      const response = await axiosInstance.post(
        `/users/messages/${receiverId}`,
        { content },
      );
      set((state) => ({
        messages: [...state.messages, response.data],
        users: state.users.map((u) =>
          u._id === receiverId ? { ...u, lastMessageAt: response.data.createdAt } : u
        ),
      }));
    } catch (error) {
      set({ error: getErrorMessage(error, "Failed to send message") });
    }
  },

  clearMessages: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      await axiosInstance.delete(`/users/messages/${userId}`);
      set((state) => ({
        messages: [],
        users: state.users.map((u) =>
          u._id === userId ? { ...u, lastMessageAt: new Date(0).toISOString() } : u
        ),
      }));
    } catch (error) {
      set({ error: getErrorMessage(error, "Failed to erase messages") });
    } finally {
      set({ isLoading: false });
    }
  },

  setSelectedUser: (user: User | null) => {
    set({ selectedUser: user });
    if (user) {
      // 대화방을 선택하는 즉시 unread 목록에서 제거
      const { unreadUsers } = get();
      if (unreadUsers.includes(user._id)) {
        set({
          unreadUsers: unreadUsers.filter((id) => id !== user._id),
        });
      }
    }
  },

  setIsChatActive: (active: boolean) => {
    set({ isChatActive: active });
  },

  connectSocket: (clerkId: string) => {
    const currentSocket = get().socket;
    
    if (currentSocket && currentSocket.connected) {
      return;
    }

    if (currentSocket && !currentSocket.connected) {
      currentSocket.connect();
      return;
    }

    const socket = io("http://localhost:3000", {
      query: { clerkId },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    set({ socket });

    socket.on("connect", () => {
      console.log("Socket connected successfully!");
    });

    socket.on("getOnlineUsers", (data: { onlineIds: string[]; activities: Record<string, { status: string; activity: string | null }> }) => {
      set({
        onlineUsers: data.onlineIds,
        userActivities: data.activities,
      });
    });

    socket.off("newMessage");
    socket.off("messagesCleared");
    socket.on("newMessage", (message: Message) => {
      const currentState = useChatStore.getState();
      const selectedUser = currentState.selectedUser;
      const messages = currentState.messages;
      const unreadUsers = currentState.unreadUsers;
      const isChatActive = currentState.isChatActive;

      // 1. 내가 채팅 메뉴(/chat)를 활성으로 보고 있고, 2. 보낸 사람이 현재 대화 상대로 선택된 경우에만 읽음 처리 후 꽂음
      if (isChatActive && selectedUser && message.senderId === selectedUser._id) {
        const readMessage = { ...message, isRead: true };
        useChatStore.setState({
          messages: [...messages, readMessage],
        });
      } else {
        // 채팅 페이지를 나갔거나, 혹은 채팅 페이지에 있어도 다른 상대방의 대화창을 띄워둔 경우 unread 추가 (실시간 체크 표시)
        if (!unreadUsers.includes(message.senderId)) {
          useChatStore.setState({
            unreadUsers: [...unreadUsers, message.senderId],
          });
        }
      }

      // 실시간 메시지 수신 시 보낸 유저의 lastMessageAt을 갱신
      const updatedUsers = currentState.users.map((u) =>
        u._id === message.senderId ? { ...u, lastMessageAt: message.createdAt } : u
      );
      useChatStore.setState({ users: updatedUsers });
    });

    socket.on("messagesCleared", (data: { clearedWith: string }) => {
      const currentState = useChatStore.getState();
      const selectedUser = currentState.selectedUser;
      
      // 만약 상대방이 메시지를 지웠고, 내가 현재 그 상대방과의 대화창을 보고 있다면 내 화면에서도 비움
      if (selectedUser && selectedUser._id === data.clearedWith) {
        useChatStore.setState({
          messages: [],
        });
      }

      // 상대방이 메시지를 지웠으므로 유저 목록 내 상대방의 lastMessageAt도 기원초로 리셋
      const updatedUsers = currentState.users.map((u) =>
        u._id === data.clearedWith ? { ...u, lastMessageAt: new Date(0).toISOString() } : u
      );
      useChatStore.setState({ users: updatedUsers });
    });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.off("newMessage");
      socket.off("messagesCleared");
      socket.disconnect();
      set({ socket: null });
    }
  },

  initiateActivityUpdate: (status: string, activity: string | null) => {
    const { socket } = get();
    if (socket && socket.connected) {
      socket.emit("update_activity", { status, activity });
    }
  },
}));
