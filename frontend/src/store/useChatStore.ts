import { create } from 'zustand';
import { axiosInstance } from '@/lib/axios';
import axios from 'axios';

export interface User {
  _id: string;
  clerkId: string;
  fullName: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface ChatStore {
  users: User[];
  messages: Message[];
  selectedUser: User | null;
  isLoading: boolean;
  error: string | null;
  onlineUsers: string[]; // online user IDs

  fetchUsers: () => Promise<void>;
  fetchMessages: (userId: string) => Promise<void>;
  sendMessage: (receiverId: string, content: string) => Promise<void>;
  setSelectedUser: (user: User | null) => void;
  setOnlineUsers: (users: string[]) => void;
}

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
};

export const useChatStore = create<ChatStore>((set) => ({
  users: [],
  messages: [],
  selectedUser: null,
  isLoading: false,
  error: null,
  onlineUsers: [],

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get('/users');
      set({ users: response.data });
    } catch (error) {
      set({ error: getErrorMessage(error, 'Failed to fetch users') });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMessages: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get(`/users/messages/${userId}`);
      set({ messages: response.data });
    } catch (error) {
      set({ error: getErrorMessage(error, 'Failed to fetch messages') });
    } finally {
      set({ isLoading: false });
    }
  },

  sendMessage: async (receiverId: string, content: string) => {
    try {
      const response = await axiosInstance.post(`/users/messages/${receiverId}`, { content });
      set((state) => ({
        messages: [...state.messages, response.data],
      }));
    } catch (error) {
      set({ error: getErrorMessage(error, 'Failed to send message') });
    }
  },

  setSelectedUser: (user: User | null) => {
    set({ selectedUser: user });
  },

  setOnlineUsers: (users: string[]) => {
    set({ onlineUsers: users });
  },
}));
