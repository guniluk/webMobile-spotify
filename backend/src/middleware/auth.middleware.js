import { clerkClient, getAuth } from '@clerk/express';

export const protectRoute = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
  } catch (error) {
    console.log(error);
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
