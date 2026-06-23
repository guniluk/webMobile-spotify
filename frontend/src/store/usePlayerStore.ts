import { create } from "zustand";
import type { Song } from "./useMusicStore";

interface PlayerStore {
  currentSong: Song | null;
  isPlaying: boolean;
  queue: Song[];
  currentIndex: number;
  volume: number;
  isShuffle: boolean;
  isRepeat: boolean;

  initializeQueue: (songs: Song[]) => void;
  playSong: (song: Song) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrevious: () => void;
  setQueue: (songs: Song[]) => void;
  setCurrentSong: (song: Song | null) => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
}

// Singleton Audio Instance for browser
export const audio = typeof window !== "undefined" ? new Audio() : null;

export const usePlayerStore = create<PlayerStore>((set, get) => {
  // Listen for song ending to play the next one automatically
  if (audio) {
    audio.addEventListener("ended", () => {
      get().playNext();
    });
  }

  return {
    currentSong: null,
    isPlaying: false,
    queue: [],
    currentIndex: -1,
    volume: 0.5, // Default volume: 50%
    isShuffle: true, // Default: shuffle enabled
    isRepeat: false,

    toggleShuffle: () => {
      const { isShuffle } = get();
      set({
        isShuffle: !isShuffle,
        isRepeat: !isShuffle ? false : get().isRepeat,
      });
    },

    toggleRepeat: () => {
      const { isRepeat } = get();
      set({
        isRepeat: !isRepeat,
        isShuffle: !isRepeat ? false : get().isShuffle,
      });
    },

    initializeQueue: (songs: Song[]) => {
      set({
        queue: songs,
        currentIndex: get().currentIndex === -1 ? 0 : get().currentIndex,
        currentSong: get().currentSong || songs[0] || null,
      });
    },

    playSong: (song: Song) => {
      if (!audio) return;

      const isSameSong = get().currentSong?._id === song._id;

      if (isSameSong && audio.src) {
        get().togglePlay();
        return;
      }

      audio.src = song.audioUrl;
      audio.volume = get().volume;

      audio
        .play()
        .then(() => {
          const index = get().queue.findIndex((s) => s._id === song._id);
          set({
            currentSong: song,
            isPlaying: true,
            currentIndex: index,
          });
        })
        .catch((error) => {
          console.error("Playback error:", error);
          set({ isPlaying: false });
        });
    },

    togglePlay: () => {
      if (!audio || !get().currentSong) return;

      if (get().isPlaying) {
        audio.pause();
        set({ isPlaying: false });
      } else {
        audio
          .play()
          .then(() => {
            set({ isPlaying: true });
          })
          .catch((error) => {
            console.error("Play resumption error:", error);
          });
      }
    },

    playNext: () => {
      const { queue, currentIndex, isShuffle } = get();
      if (queue.length === 0) return;

      if (isShuffle && queue.length > 1) {
        let nextIndex = currentIndex;
        let attempts = 0;
        while (nextIndex === currentIndex && attempts < 10) {
          nextIndex = Math.floor(Math.random() * queue.length);
          attempts++;
        }
        const nextSong = queue[nextIndex];
        if (nextSong) {
          get().playSong(nextSong);
        }
      } else {
        const nextIndex = (currentIndex + 1) % queue.length;
        const nextSong = queue[nextIndex];
        if (nextSong) {
          get().playSong(nextSong);
        }
      }
    },

    playPrevious: () => {
      const { queue, currentIndex, isShuffle } = get();
      if (queue.length === 0) return;

      if (isShuffle && queue.length > 1) {
        let prevIndex = currentIndex;
        let attempts = 0;
        while (prevIndex === currentIndex && attempts < 10) {
          prevIndex = Math.floor(Math.random() * queue.length);
          attempts++;
        }
        const prevSong = queue[prevIndex];
        if (prevSong) {
          get().playSong(prevSong);
        }
      } else {
        const prevIndex =
          currentIndex - 1 < 0 ? queue.length - 1 : currentIndex - 1;
        const prevSong = queue[prevIndex];
        if (prevSong) {
          get().playSong(prevSong);
        }
      }
    },

    setQueue: (songs: Song[]) => {
      set({ queue: songs });
    },

    setCurrentSong: (song: Song | null) => {
      if (!audio) return;
      if (!song) {
        audio.pause();
        set({ currentSong: null, isPlaying: false, currentIndex: -1 });
        return;
      }

      const index = get().queue.findIndex((s) => s._id === song._id);
      set({ currentSong: song, currentIndex: index });
    },

    setVolume: (volume: number) => {
      const clampedVolume = Math.min(1, Math.max(0, volume));
      if (audio) {
        audio.volume = clampedVolume;
      }
      set({ volume: clampedVolume });
    },
  };
});
