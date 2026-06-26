import { create } from "zustand";
import type { Song } from "./useMusicStore";
import { Audio } from "expo-av";

interface PlayerStore {
  currentSong: Song | null;
  isPlaying: boolean;
  queue: Song[];
  currentIndex: number;
  volume: number;
  isShuffle: boolean;
  isRepeat: boolean;
  progress: { position: number; duration: number };

  initializeQueue: (songs: Song[]) => void;
  playSong: (song: Song) => Promise<void>;
  togglePlay: () => Promise<void>;
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;
  setQueue: (songs: Song[]) => void;
  setCurrentSong: (song: Song | null) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
}

// 모바일용 expo-av Sound 싱글톤 참조 객체
let soundInstance: Audio.Sound | null = null;

export const usePlayerStore = create<PlayerStore>((set, get) => {
  return {
    currentSong: null,
    isPlaying: false,
    queue: [],
    currentIndex: -1,
    volume: 0.5,
    isShuffle: true,
    isRepeat: false,
    progress: { position: 0, duration: 0 },

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

    playSong: async (song: Song) => {
      try {
        const isSameSong = get().currentSong?._id === song._id;

        if (isSameSong && soundInstance) {
          await get().togglePlay();
          return;
        }

        if (soundInstance) {
          await soundInstance.unloadAsync();
          soundInstance = null;
        }

        // 모바일 오디오 모드 활성화 (스피커 출력 및 백그라운드 재생 지원 설정)
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          playThroughEarpieceAndroid: false,
        });

        const { sound } = await Audio.Sound.createAsync(
          { uri: song.audioUrl },
          { shouldPlay: true, volume: get().volume }
        );
        soundInstance = sound;

        // 음원 재생 진행 상태 리스너 부착
        soundInstance.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            if (status.didJustFinish && !status.isLooping) {
              set({ progress: { position: 0, duration: 0 } });
              get().playNext(); // 음원 종료 시 다음 곡 자동 재생
            } else {
              const pos = status.positionMillis || 0;
              const dur = status.durationMillis || 0;
              const currentProgress = get().progress;
              if (Math.abs(currentProgress.position - pos) > 500 || currentProgress.duration !== dur) {
                set({ progress: { position: pos, duration: dur } });
              }
            }
          }
        });

        const index = get().queue.findIndex((s) => s._id === song._id);
        set({
          currentSong: song,
          isPlaying: true,
          currentIndex: index,
        });
      } catch (error) {
        console.error("Playback error on mobile:", error);
        set({ isPlaying: false });
      }
    },

    togglePlay: async () => {
      if (!get().currentSong) return;

      try {
        if (!soundInstance) {
          // 사운드 인스턴스가 날아갔다면 다시 로드해서 재생
          const activeSong = get().currentSong;
          if (activeSong) await get().playSong(activeSong);
          return;
        }

        const status = await soundInstance.getStatusAsync();
        if (status.isLoaded) {
          if (status.isPlaying) {
            await soundInstance.pauseAsync();
            set({ isPlaying: false });
          } else {
            await soundInstance.playAsync();
            set({ isPlaying: true });
          }
        }
      } catch (error) {
        console.error("Play resumption error on mobile:", error);
      }
    },

    playNext: async () => {
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
          await get().playSong(nextSong);
        }
      } else {
        const nextIndex = (currentIndex + 1) % queue.length;
        const nextSong = queue[nextIndex];
        if (nextSong) {
          await get().playSong(nextSong);
        }
      }
    },

    playPrevious: async () => {
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
          await get().playSong(prevSong);
        }
      } else {
        const prevIndex =
          currentIndex - 1 < 0 ? queue.length - 1 : currentIndex - 1;
        const prevSong = queue[prevIndex];
        if (prevSong) {
          await get().playSong(prevSong);
        }
      }
    },

    setQueue: (songs: Song[]) => {
      set({ queue: songs });
    },

    setCurrentSong: async (song: Song | null) => {
      if (!song) {
        if (soundInstance) {
          await soundInstance.stopAsync();
          await soundInstance.unloadAsync();
          soundInstance = null;
        }
        set({ currentSong: null, isPlaying: false, currentIndex: -1, progress: { position: 0, duration: 0 } });
        return;
      }

      const index = get().queue.findIndex((s) => s._id === song._id);
      set({ currentSong: song, currentIndex: index });
    },

    setVolume: async (volume: number) => {
      const clampedVolume = Math.min(1, Math.max(0, volume));
      if (soundInstance) {
        await soundInstance.setVolumeAsync(clampedVolume);
      }
      set({ volume: clampedVolume });
    },
  };
});
