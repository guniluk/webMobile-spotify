import { create } from "zustand";
import { axiosInstance, getErrorMessage } from "@/lib/axios";

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

export interface Stats {
  totalSongs: number;
  totalAlbums: number;
  totalUsers: number;
  uniqueArtists: number;
}

interface MusicStore {
  songs: Song[];
  albums: Album[];
  featuredSongs: Song[];
  madeForYouSongs: Song[];
  trendingSongs: Song[];
  currentAlbum: Album | null;
  stats: Stats | null;
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
  fetchStats: () => Promise<void>;
  createSong: (formData: FormData) => Promise<void>;
  createAlbum: (formData: FormData) => Promise<void>;
}

export const useMusicStore = create<MusicStore>((set) => ({
  songs: [],
  albums: [],
  featuredSongs: [],
  madeForYouSongs: [],
  trendingSongs: [],
  currentAlbum: null,
  stats: null,
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
      await axiosInstance.delete(`/admin/album/${id}`);
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

  fetchStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get("/stats");
      set({ stats: response.data });
    } catch (error) {
      set({ error: getErrorMessage(error, "Failed to fetch stats") });
    } finally {
      set({ isLoading: false });
    }
  },

  createSong: async (formData: FormData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post("/admin/songs", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      set((state) => ({
        songs: [...state.songs, response.data],
      }));
    } catch (error) {
      set({ error: getErrorMessage(error, "Failed to create song") });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  createAlbum: async (formData: FormData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post("/admin/album", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      set((state) => ({
        albums: [...state.albums, response.data],
      }));
    } catch (error) {
      set({ error: getErrorMessage(error, "Failed to create album") });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
