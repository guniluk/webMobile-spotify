import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";
import axios from "axios";

export interface Song {
  _id: string;
  title: string;
  artist: string;
  imageUrl: string;
  audioUrl: string;
  duration: number;
  albumId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Album {
  _id: string;
  title: string;
  artist: string;
  imageUrl: string;
  releaseYear: number;
  songs: Song[];
  createdAt: Date;
  updatedAt: Date;
}

interface MusicStore {
  songs: Song[];
  albums: Album[];
  featuredSongs: Song[];
  madeForYouSongs: Song[];
  trendingSongs: Song[];
  currentAlbum: Album | null;
  isLoading: boolean;
  error: string | null;

  fetchSongs: () => Promise<void>;
  fetchAlbums: () => Promise<void>;
  fetchAlbumById: (id: string) => Promise<void>;
  fetchFeaturedSongs: () => Promise<void>;
  fetchMadeForYouSongs: () => Promise<void>;
  fetchTrendingSongs: () => Promise<void>;
  deleteSong: (id: string) => Promise<void>;
  deleteAlbum: (id: string) => Promise<void>;
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

export const useMusicStore = create<MusicStore>((set) => ({
  songs: [],
  albums: [],
  featuredSongs: [],
  madeForYouSongs: [],
  trendingSongs: [],
  currentAlbum: null,
  isLoading: false,
  error: null,

  fetchSongs: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get("/songs");
      set({ songs: response.data });
    } catch (error) {
      set({ error: getErrorMessage(error, "Failed to fetch songs") });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchAlbums: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get("/albums");
      set({ albums: response.data });
    } catch (error) {
      set({ error: getErrorMessage(error, "Failed to fetch albums") });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchAlbumById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get(`/albums/${id}`);
      set({ currentAlbum: response.data });
    } catch (error) {
      set({ error: getErrorMessage(error, "Failed to fetch album details") });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchFeaturedSongs: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get("/songs/featured");
      set({ featuredSongs: response.data });
    } catch (error) {
      set({ error: getErrorMessage(error, "Failed to fetch featured songs") });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMadeForYouSongs: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get("/songs/made-for-you");
      set({ madeForYouSongs: response.data });
    } catch (error) {
      set({
        error: getErrorMessage(error, "Failed to fetch made-for-you songs"),
      });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTrendingSongs: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get("/songs/trending");
      set({ trendingSongs: response.data });
    } catch (error) {
      set({ error: getErrorMessage(error, "Failed to fetch trending songs") });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteSong: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await axiosInstance.delete(`/admin/songs/${id}`);
      set((state) => ({
        songs: state.songs.filter((song) => song._id !== id),
      }));
    } catch (error) {
      set({ error: getErrorMessage(error, "Failed to delete song") });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteAlbum: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await axiosInstance.delete(`/admin/albums/${id}`);
      set((state) => ({
        albums: state.albums.filter((album) => album._id !== id),
        songs: state.songs.filter((song) => song.albumId !== id),
      }));
    } catch (error) {
      set({ error: getErrorMessage(error, "Failed to delete album") });
    } finally {
      set({ isLoading: false });
    }
  },
}));
