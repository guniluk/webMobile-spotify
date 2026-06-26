import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { usePlayerStore } from "@/store/usePlayerStore";
import { Play, Pause, SkipForward, SkipBack } from "lucide-react-native";

interface MiniPlayerProps {
  bottomOffset?: number;
}

export default function MiniPlayer({ bottomOffset = 60 }: MiniPlayerProps) {
  const {
    currentSong,
    isPlaying,
    togglePlay,
    playNext,
    playPrevious,
    progress,
  } = usePlayerStore();

  if (!currentSong) return null;

  const progressRatio =
    progress.duration > 0 ? progress.position / progress.duration : 0;

  // 재생 경과 시간 포맷 (분:초)
  const formatTime = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <View
      className="absolute z-50 p-3 border shadow-2xl left-2 right-2 bg-zinc-700 border-zinc-800/80 rounded-xl flex-column shadow-black/80"
      style={{ bottom: bottomOffset }}
    >
      {/* Upper Layout: Details and Control buttons */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1 mr-4">
          {/* Album Artwork */}
          <Image
            source={
              currentSong.imageUrl ? { uri: currentSong.imageUrl } : undefined
            }
            className="rounded-md bg-zinc-800"
            style={{ width: 40, height: 40 }}
          />

          {/* Track details */}
          <View className="flex-1 ml-3">
            <Text numberOfLines={1} className="text-xs font-bold text-white">
              {currentSong.title}
            </Text>
            <Text
              numberOfLines={1}
              className="text-zinc-400 text-[10px] mt-0.5"
            >
              {currentSong.artist}
            </Text>
          </View>
        </View>

        {/* Media Buttons */}
        <View className="flex-row items-center gap-4">
          <TouchableOpacity
            onPress={() => playPrevious()}
            className="p-1 active:scale-90"
          >
            <SkipBack size={18} color="white" fill="white" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => togglePlay()}
            className="items-center justify-center bg-white rounded-full active:scale-90"
            style={{ width: 32, height: 32 }}
          >
            {isPlaying ? (
              <Pause size={14} fill="black" color="black" />
            ) : (
              <Play size={14} fill="black" color="black" className="ml-0.5" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => playNext()}
            className="p-1 active:scale-90"
          >
            <SkipForward size={18} color="white" fill="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Lower Layout: Progress Bar */}
      <View className="mt-2.5 flex-row items-center justify-between">
        <Text className="text-zinc-500 text-[8px] font-semibold">
          {formatTime(progress.position)}
        </Text>
        <View className="flex-1 h-[2.5px] bg-zinc-800 rounded-full mx-2 overflow-hidden">
          <View
            className="h-full bg-emerald-500"
            style={{ width: `${Math.min(100, progressRatio * 100)}%` }}
          />
        </View>
        <Text className="text-zinc-500 text-[8px] font-semibold">
          {formatTime(progress.duration)}
        </Text>
      </View>
    </View>
  );
}
