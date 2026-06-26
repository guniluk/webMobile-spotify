import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { useMusicStore, Song, Album } from "@/store/useMusicStore";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Music, Play, LogIn } from "lucide-react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const { signOut } = useAuth();
  const { isAdmin } = useAuthStore();

  const {
    albums,
    featuredSongs,
    madeForYouSongs,
    trendingSongs,
    fetchAlbums,
    fetchFeaturedSongs,
    fetchMadeForYouSongs,
    fetchTrendingSongs,
    isLoading,
  } = useMusicStore();

  const { playSong, initializeQueue } = usePlayerStore();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchAlbums(),
        fetchFeaturedSongs(),
        fetchMadeForYouSongs(),
        fetchTrendingSongs(),
      ]);
    } catch (error) {
      console.error("Home refresh failed:", error);
    } finally {
      setRefreshing(false);
    }
  }, [
    fetchAlbums,
    fetchFeaturedSongs,
    fetchMadeForYouSongs,
    fetchTrendingSongs,
  ]);

  useEffect(() => {
    fetchAlbums();
    fetchFeaturedSongs();
    fetchMadeForYouSongs();
    fetchTrendingSongs();
  }, [
    fetchAlbums,
    fetchFeaturedSongs,
    fetchMadeForYouSongs,
    fetchTrendingSongs,
  ]);

  const handlePlaySong = (song: Song, queue: Song[]) => {
    initializeQueue(queue);
    playSong(song);
  };

  const handleAlbumPress = (albumId: string) => {
    router.push(`/album/${albumId}`);
  };

  const handleAuthPress = async () => {
    if (isSignedIn) {
      await signOut();
    } else {
      router.push("/auth/login");
    }
  };

  const handleLogoutPress = () => {
    Alert.alert("로그아웃", "로그아웃하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  if (isLoading && albums.length === 0) {
    return (
      <View className="flex-1 bg-[#121212] items-center justify-center">
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#121212]">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 130 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#10B981"
            colors={["#10B981"]}
          />
        }
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-zinc-900/50 bg-[#121212]/80">
          <View className="flex-row items-center gap-2">
            <Music size={24} color="#FBBF24" />
            <Text className="text-2xl font-black tracking-tight text-yellow-300">
              Music & Chat
            </Text>
            {isSignedIn && isAdmin && (
              <TouchableOpacity
                onPress={() => router.push("/admin")}
                className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full active:scale-95"
              >
                <Text className="text-[10px] text-emerald-400 font-bold">
                  ADMIN
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View className="flex-row items-center gap-3">
            {isSignedIn ? (
              <View className="flex-row items-center gap-2">
                <TouchableOpacity
                  onPress={handleLogoutPress}
                  className="active:scale-95"
                >
                  <Image
                    source={user?.imageUrl ? { uri: user.imageUrl } : undefined}
                    style={{ width: 32, height: 32, borderRadius: 16 }}
                    className="border border-zinc-800 bg-zinc-800"
                    contentFit="cover"
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={handleAuthPress}
                className="flex-row items-center gap-1.5 px-3 py-1.5 bg-emerald-500 rounded-full"
              >
                <LogIn size={14} color="black" />
                <Text className="text-xs font-bold text-black">Login</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 1. Featured Grid (추천 음악) */}
        <View className="px-4 mt-6">
          <Text className="mb-3 text-xl font-black text-white">
            Have a nice day!
          </Text>
          <View className="flex-row flex-wrap justify-between gap-y-3">
            {featuredSongs.slice(0, 4).map((song) => (
              <TouchableOpacity
                key={song._id}
                onPress={() => handlePlaySong(song, featuredSongs)}
                className="w-[48%] bg-zinc-900/55 border border-zinc-850 rounded-lg p-2.5 flex-row items-center justify-between group active:bg-zinc-800/80"
              >
                <View className="flex-row items-center flex-1 mr-2">
                  <Image
                    source={song.imageUrl ? { uri: song.imageUrl } : undefined}
                    className="rounded bg-zinc-800"
                    style={{ width: 44, height: 44 }}
                  />
                  <View className="ml-2.5 flex-1">
                    <Text
                      numberOfLines={1}
                      className="text-xs font-bold text-white"
                    >
                      {song.title}
                    </Text>
                    <Text
                      numberOfLines={1}
                      className="text-zinc-400 text-[10px] mt-0.5"
                    >
                      {song.artist}
                    </Text>
                  </View>
                </View>
                <View className="items-center justify-center rounded-full w-7 h-7 bg-emerald-500/30">
                  <Play
                    size={12}
                    fill="black"
                    color="black"
                    className="ml-0.5 opacity-75"
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 2. Albums List Carousel (앨범 컬렉션) */}
        <View className="mt-8">
          <Text className="px-4 mb-3 text-xl font-black text-white">
            Album recommendations
          </Text>
          <FlatList
            data={albums}
            keyExtractor={(item) => item._id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            renderItem={({ item }: { item: Album }) => (
              <TouchableOpacity
                onPress={() => handleAlbumPress(item._id)}
                className="p-3 mr-4 border w-36 bg-zinc-900/30 rounded-xl border-zinc-900 active:bg-zinc-900/60"
              >
                <Image
                  source={item.imageUrl ? { uri: item.imageUrl } : undefined}
                  className="rounded-lg shadow-md bg-zinc-800"
                  style={{ width: "100%", height: 120 }}
                />
                <Text
                  numberOfLines={1}
                  className="mt-3 text-sm font-bold text-white"
                >
                  {item.title}
                </Text>
                <Text
                  numberOfLines={1}
                  className="text-zinc-400 text-xs mt-0.5"
                >
                  {item.artist}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* 3. Made For You Carousel */}
        <View className="mt-8">
          <Text className="px-4 mb-3 text-xl font-black text-white">
            The best music for you
          </Text>
          <FlatList
            data={madeForYouSongs}
            keyExtractor={(item) => item._id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handlePlaySong(item, madeForYouSongs)}
                className="w-32 mr-4 group"
              >
                <View className="relative">
                  <Image
                    source={item.imageUrl ? { uri: item.imageUrl } : undefined}
                    className="rounded-xl bg-zinc-800"
                    style={{ width: "100%", height: 110 }}
                  />
                  <View className="absolute items-center justify-center w-8 h-8 rounded-full shadow-lg bottom-2 right-2 bg-emerald-500/30">
                    <Play
                      size={14}
                      fill="black"
                      color="black"
                      className="ml-0.5 opacity-75"
                    />
                  </View>
                </View>
                <Text
                  numberOfLines={1}
                  className="mt-2 text-xs font-bold text-white"
                >
                  {item.title}
                </Text>
                <Text
                  numberOfLines={1}
                  className="text-zinc-400 text-[10px] mt-0.5"
                >
                  {item.artist}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* 4. Trending Carousel */}
        <View className="mt-8">
          <Text className="px-4 mb-3 text-xl font-black text-white">
            The trending music
          </Text>
          <FlatList
            data={trendingSongs}
            keyExtractor={(item) => item._id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handlePlaySong(item, trendingSongs)}
                className="w-32 mr-4"
              >
                <View className="relative">
                  <Image
                    source={item.imageUrl ? { uri: item.imageUrl } : undefined}
                    className="rounded-xl bg-zinc-800"
                    style={{ width: "100%", height: 110 }}
                  />
                  <View className="absolute items-center justify-center w-8 h-8 rounded-full shadow-lg bottom-2 right-2 bg-emerald-500/30">
                    <Play
                      size={14}
                      fill="black"
                      color="black"
                      className="ml-0.5 opacity-75"
                    />
                  </View>
                </View>
                <Text
                  numberOfLines={1}
                  className="mt-2 text-xs font-bold text-white"
                >
                  {item.title}
                </Text>
                <Text
                  numberOfLines={1}
                  className="text-zinc-400 text-[10px] mt-0.5"
                >
                  {item.artist}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
