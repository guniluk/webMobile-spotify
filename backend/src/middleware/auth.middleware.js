import { clerkClient, getAuth } from '@clerk/express';
import { User } from '../models/user.model.js';

export const protectRoute = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // 데이터베이스에서 해당 Clerk ID의 사용자 조회
    let user = await User.findOne({ clerkId: userId });

    // 만약 데이터베이스에 유저가 없다면 Clerk API를 통해 프로필을 실시간으로 가져와 동기화 (Auto-sync Fallback)
    if (!user) {
      try {
        const clerkUser = await clerkClient.users.getUser(userId);
        user = await User.create({
          clerkId: userId,
          fullName:
            `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() ||
            'Anonymous',
          imageUrl: clerkUser.imageUrl,
        });
        console.log(
          `User auto-synced to DB via protectRoute middleware: ${userId}`,
        );
      } catch (clerkError) {
        console.error(
          'Clerk user fetch failed during middleware auto-sync:',
          clerkError,
        );
        return res
          .status(404)
          .json({ message: 'User not found and sync failed' });
      }
    }

    // req.currentUser 객체에 조회/동기화된 Mongoose User 도큐먼트를 바인딩하여 컨트롤러에 제공
    req.currentUser = user;
    next();
  } catch (error) {
    console.log('Error in protectRoute middleware: ', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const requireAdmin = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const currentUser = await clerkClient.users.getUser(userId);
    const isAdmin =
      process.env.ADMIN_EMAIL === currentUser.primaryEmailAddress?.emailAddress;
    if (!isAdmin) {
      return res.status(403).json({ message: 'This user is not admin' });
    }
    next();
  } catch (error) {
    console.log(error);
    next(error);
  }
};
