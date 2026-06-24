import React, { useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StatusBar } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMusicStore } from "@/store/useMusicStore";
import { usePlayerStore } from "@/store/usePlayerStore";
import { ArrowLeft, Play, Pause, Clock } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MiniPlayer from "@/components/MiniPlayer";

// 재생시간 포맷 헬퍼 (MM:SS)
const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export default function AlbumDetailsScreen() {
  const { albumId } = useLocalSearchParams<{ albumId: string }>();
  const router = useRouter();
  
  const { currentAlbum, fetchAlbumById, isLoading } = useMusicStore();
  const { playSong, initializeQueue, currentSong, isPlaying } = usePlayerStore();

  useEffect(() => {
    if (albumId) {
      fetchAlbumById(albumId);
    }
  }, [albumId, fetchAlbumById]);

  const handlePlayAlbum = () => {
    if (currentAlbum && currentAlbum.songs.length > 0) {
      initializeQueue(currentAlbum.songs);
      playSong(currentAlbum.songs[0]);
    }
  };

  const handlePlaySong = (song: any) => {
    if (currentAlbum) {
      initializeQueue(currentAlbum.songs);
      playSong(song);
    }
  };

  if (isLoading || !currentAlbum) {
    return (
      <View className="flex-1 bg-[#121212] items-center justify-center">
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  const isCurrentAlbumPlaying = 
    isPlaying && 
    currentSong && 
    currentAlbum.songs.some((s) => s._id === currentSong._id);

  return (
    <SafeAreaView className="flex-1 bg-[#121212]" edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" />
      
      {/* Header Bar */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-zinc-900/50 bg-[#121212]">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <Text numberOfLines={1} className="text-white font-bold text-sm max-w-[200px]">
          {currentAlbum.title}
        </Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 140 }}>
        
        {/* Album Artwork & Details Header */}
        <View className="items-center p-6 bg-gradient-to-b from-zinc-800/30 to-[#121212]">
          <Image
            source={currentAlbum.imageUrl}
            className="w-52 h-52 rounded-xl shadow-2xl bg-zinc-800"
          />
          
          <Text className="text-white text-xl font-black mt-6 text-center tracking-tight">
            {currentAlbum.title}
          </Text>
          
          <Text className="text-zinc-400 text-sm font-semibold mt-1">
            {currentAlbum.artist} • {currentAlbum.releaseYear}년
          </Text>

          {/* Play/Pause Main Button */}
          {currentAlbum.songs.length > 0 && (
            <TouchableOpacity
              onPress={handlePlayAlbum}
              className="mt-6 flex-row items-center bg-emerald-500 py-3.5 px-8 rounded-full shadow-xl shadow-emerald-500/20 active:scale-95"
            >
              {isCurrentAlbumPlaying ? (
                <>
                  <Pause size={18} fill="black" color="black" />
                  <Text className="text-black font-bold text-sm ml-2">앨범 일시정지</Text>
                </>
              ) : (
                <>
                  <Play size={18} fill="black" color="black" className="ml-0.5" />
                  <Text className="text-black font-bold text-sm ml-2">재생</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Songs List */}
        <View className="mt-4">
          <View className="flex-row items-center justify-between px-4 py-2 border-b border-zinc-900/80">
            <Text className="text-zinc-400 text-xs font-bold">수록곡 목록</Text>
            <Clock size={14} color="#9CA3AF" />
          </View>

          {currentAlbum.songs.length === 0 ? (
            <View className="p-8 items-center">
              <Text className="text-zinc-500 text-xs">등록된 수록곡이 없습니다.</Text>
            </View>
          ) : (
            currentAlbum.songs.map((song, index) => {
              const isSelected = currentSong?._id === song._id;
              
              return (
                <TouchableOpacity
                  key={song._id}
                  onPress={() => handlePlaySong(song)}
                  className={`flex-row items-center justify-between p-4 border-b border-zinc-900/30 ${
                    isSelected ? "bg-zinc-900/60" : "active:bg-zinc-900/20"
                  }`}
                >
                  <View className="flex-row items-center flex-1 mr-4">
                    {/* Track Number / Playing indicator */}
                    <View className="w-6 items-center justify-center mr-2">
                      {isSelected && isPlaying ? (
                        <View className="w-1.5 h-3 bg-emerald-500 animate-pulse rounded-full" />
                      ) : (
                        <Text className="text-zinc-500 text-xs font-bold">{index + 1}</Text>
                      )}
                    </View>

                    {/* Song details */}
                    <View className="flex-1">
                      <Text
                        numberOfLines={1}
                        className={`text-sm font-medium ${
                          isSelected ? "text-emerald-400 font-bold" : "text-white"
                        }`}
                      >
                        {song.title}
                      </Text>
                      <Text numberOfLines={1} className="text-zinc-400 text-[10px] mt-0.5">
                        {song.artist}
                      </Text>
                    </View>
                  </View>

                  <Text className="text-zinc-400 text-xs font-medium">
                    {formatDuration(song.duration)}
                  </Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>

      </ScrollView>
      <MiniPlayer bottomOffset={16} />
    </SafeAreaView>
  );
}
