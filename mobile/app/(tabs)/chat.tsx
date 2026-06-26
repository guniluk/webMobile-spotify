import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Image } from "expo-image";
import { useUser } from "@clerk/clerk-expo";
import { useChatStore, User } from "@/store/useChatStore";
import {
  Users,
  Music,
  Check,
  MessageSquare,
  LogIn,
  Send,
} from "lucide-react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChatListScreen() {
  const router = useRouter();
  const { isSignedIn, user } = useUser();

  const {
    users,
    fetchUsers,
    isLoading,
    onlineUsers,
    userActivities,
    unreadUsers,
    setSelectedUser,
  } = useChatStore();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    if (!isSignedIn) return;
    setRefreshing(true);
    try {
      await fetchUsers();
    } catch (error) {
      console.error("Chat refresh failed:", error);
    } finally {
      setRefreshing(false);
    }
  }, [isSignedIn, fetchUsers]);

  // 화면이 활성화(Focus)될 때마다 최신 유저 정보 및 대화 기록 목록 조회
  useFocusEffect(
    React.useCallback(() => {
      if (isSignedIn) {
        fetchUsers();
      }
    }, [isSignedIn, fetchUsers]),
  );

  // 본인 제외 및 가장 최근에 메시지를 나눈 유저 순서대로 항상 먼저 보여주도록 정렬
  const filteredUsers = users
    .filter((u) => u.clerkId !== user?.id)
    .sort((a, b) => {
      const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return timeB - timeA;
    });

  const handleFriendClick = (friend: User) => {
    setSelectedUser(friend);
    router.push(`/chat/${friend._id}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#121212]">
      {/* Header */}
      <View className="flex-row items-center gap-2 px-4 py-3.5 border-b border-zinc-900/50 bg-[#121212]">
        <Users size={20} className="text-zinc-400" />
        <Text className="text-base font-black tracking-tight text-white">
          User activity and chat
        </Text>
      </View>

      {!isSignedIn ? (
        // 비인증 플레이스홀더 뷰
        <View className="items-center justify-center flex-1 p-6 text-center">
          <View className="items-center justify-center w-16 h-16 mb-5 border rounded-full bg-zinc-800/50 border-zinc-800">
            <Users size={28} color="#FBBF24" />
          </View>
          <Text className="text-white font-bold text-base mb-1.5">
            Find friends and listen to music together
          </Text>
          <Text className="text-zinc-400 text-xs text-center max-w-[240px] leading-relaxed mb-6">
            Log in to check your friends&apos; real-time music listening
            activity and exchange 1:1 messages.
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/auth/login")}
            className="flex-row items-center gap-2 px-6 py-3 rounded-full shadow-lg bg-emerald-500 active:scale-95"
          >
            <LogIn size={16} color="black" />
            <Text className="text-sm font-bold text-black">Login</Text>
          </TouchableOpacity>
        </View>
      ) : (
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
          {isLoading && users.length === 0 ? (
            <View className="items-center justify-center py-12">
              <ActivityIndicator size="small" color="#10B981" />
            </View>
          ) : filteredUsers.length === 0 ? (
            <View className="items-center py-16">
              <Text className="text-xs text-zinc-500">
                No friends are currently active.
              </Text>
            </View>
          ) : (
            <View className="divide-y divide-zinc-900/30">
              {filteredUsers.map((friend) => {
                const activityInfo = userActivities[friend.clerkId];
                const isOnline = onlineUsers.includes(friend.clerkId);
                const isListening =
                  isOnline && activityInfo?.status === "Listening";
                const statusText = isOnline ? "Online" : "Offline";
                const currentSong = isListening ? activityInfo.activity : null;
                const isUnread = unreadUsers.includes(friend._id); // 읽지 않은 메시지 뱃지 여부

                return (
                  <TouchableOpacity
                    key={friend._id}
                    onPress={() => handleFriendClick(friend)}
                    className="flex-row items-center justify-between p-4 active:bg-zinc-900/40"
                  >
                    <View className="flex-row items-center flex-1 mr-4">
                      {/* Avatar Image with Status Dot */}
                      <View className="relative w-12 h-12 mr-3.5">
                        <Image
                          source={
                            friend.imageUrl
                              ? { uri: friend.imageUrl }
                              : undefined
                          }
                          style={{ width: 48, height: 48, borderRadius: 24 }}
                          className="bg-zinc-800"
                          contentFit="cover"
                        />
                        {/* 안 읽은 새 메시지 노티 알림 체크 마크 */}
                        {isUnread && (
                          <View className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border border-[#121212] items-center justify-center shadow-lg">
                            <Check size={11} color="black" strokeWidth={3.5} />
                          </View>
                        )}
                        {/* 온라인 상태 램프 */}
                        <View
                          className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#121212] ${
                            isOnline ? "bg-emerald-500" : "bg-zinc-500"
                          }`}
                        />
                      </View>

                      {/* Info & Status text */}
                      <View className="flex-1">
                        <View className="flex-row items-center gap-1.5">
                          <Text
                            numberOfLines={1}
                            className={`text-sm ${
                              isUnread
                                ? "text-emerald-400 font-bold"
                                : "text-white font-semibold"
                            }`}
                          >
                            {friend.fullName}
                          </Text>
                          {isListening && (
                            <Music
                              size={12}
                              className="text-emerald-500 animate-pulse"
                            />
                          )}
                        </View>

                        {isListening ? (
                          <Text
                            numberOfLines={1}
                            className="text-emerald-400 text-xs mt-0.5 font-medium"
                          >
                            {currentSong}
                          </Text>
                        ) : (
                          <Text
                            numberOfLines={1}
                            className="text-zinc-500 text-xs mt-0.5"
                          >
                            {statusText}
                          </Text>
                        )}
                      </View>
                    </View>

                    {/* Chat Action Icon */}
                    <View className="p-1">
                      {isUnread ? (
                        <Send
                          size={18}
                          color="white"
                          className="animate-pulse"
                        />
                      ) : (
                        <MessageSquare size={18} color="#4B5563" />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
