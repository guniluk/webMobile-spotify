import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
} from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useChatStore, Message } from "@/store/useChatStore";
import { ArrowLeft, Trash2, Send, Headphones, MessageSquare } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// 시간 포맷 헬퍼 함수 (오전/오후 HH:MM)
const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "오후" : "오전";
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${ampm} ${hours}:${minutes}`;
};

export default function ChatRoomScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  const {
    messages,
    selectedUser,
    fetchMessages,
    sendMessage,
    clearMessages,
    onlineUsers,
    userActivities,
    setIsChatActive,
  } = useChatStore();

  const [inputMessage, setInputMessage] = useState("");
  const [showUnreadDivider, setShowUnreadDivider] = useState(true);
  const [prevUserId, setPrevUserId] = useState<string | undefined>(userId);

  // 동기 리렌더 방지 및 유저 교체 시 안 읽은 구분선 리셋 패턴
  if (userId !== prevUserId) {
    setPrevUserId(userId);
    setShowUnreadDivider(true);
  }

  // 1. 컴포넌트 활성화 시 채팅창 활성화 마킹
  useEffect(() => {
    setIsChatActive(true);
    return () => {
      setIsChatActive(false);
    };
  }, [setIsChatActive]);

  // 2. 메시지 로드 및 10초 타이머 개시
  useEffect(() => {
    if (userId) {
      fetchMessages(userId);
      setShowUnreadDivider(true);
      const timer = setTimeout(() => {
        setShowUnreadDivider(false);
      }, 10000); // 10초

      return () => clearTimeout(timer);
    }
  }, [userId, fetchMessages]);

  // 3. 메시지 추가 시 스크롤을 맨 아래로 유도
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 200);
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputMessage.trim() || !userId) return;
    const content = inputMessage.trim();
    setInputMessage("");
    await sendMessage(userId, content);
  };

  const handleEraseMessages = () => {
    if (!selectedUser) return;
    
    // 모바일 특화 Alert 창 활용
    Alert.alert(
      "채팅방 비우기",
      `${selectedUser.fullName}님과의 모든 채팅 메시지를 삭제하시겠습니까?\n삭제된 대화는 복구할 수 없습니다.`,
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: async () => {
            await clearMessages(selectedUser._id);
            router.back(); // 지운 뒤 목록으로 복귀
          },
        },
      ]
    );
  };

  if (!selectedUser) {
    return (
      <View className="flex-1 bg-[#121212] items-center justify-center">
        <ActivityIndicator size="small" color="#10B981" />
      </View>
    );
  }

  const isOnline = onlineUsers.includes(selectedUser.clerkId);
  const userActivity = userActivities[selectedUser.clerkId];
  const isListening = isOnline && userActivity?.status === "Listening";
  
  let unreadDividerRendered = false;

  return (
    <SafeAreaView className="flex-1 bg-[#121212]" edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" />
      
      {/* 1. Header Bar */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-zinc-900/50 bg-[#121212]">
        <View className="flex-row items-center flex-1 mr-4">
          <TouchableOpacity onPress={() => router.back()} className="p-1 mr-2">
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          
          <Image
            source={selectedUser.imageUrl ? { uri: selectedUser.imageUrl } : undefined}
            style={{ width: 36, height: 36, borderRadius: 18 }}
            className="bg-zinc-800 border border-zinc-800"
            contentFit="cover"
          />
          
          <View className="ml-3 flex-1">
            <Text numberOfLines={1} className="text-white font-bold text-sm">
              {selectedUser.fullName}
            </Text>
            {isListening ? (
              <View className="flex-row items-center gap-1 mt-0.5">
                <Headphones size={10} color="#10B981" />
                <Text numberOfLines={1} className="text-emerald-400 text-[10px] font-semibold flex-1">
                  재생 중: {userActivity.activity}
                </Text>
              </View>
            ) : (
              <Text className="text-zinc-500 text-[10px] mt-0.5">
                {isOnline ? "온라인" : "오프라인"}
              </Text>
            )}
          </View>
        </View>

        {/* Erase Chat Button */}
        <TouchableOpacity
          onPress={handleEraseMessages}
          className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-full active:scale-90"
        >
          <Trash2 size={16} color="#F87171" />
        </TouchableOpacity>
      </View>

      {/* 2. Message List Board */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
          ListEmptyComponent={() => (
            <View className="py-24 items-center justify-center">
              <MessageSquare size={48} className="text-zinc-800 mb-3" />
              <Text className="text-zinc-500 text-xs">
                {selectedUser.fullName}님과의 첫 대화를 시작해보세요.
              </Text>
            </View>
          )}
          renderItem={({ item }: { item: Message }) => {
            const isMyMessage = item.senderId !== selectedUser._id;
            const isUnread = !isMyMessage && !item.isRead;
            const shouldHighlight = isUnread && showUnreadDivider;

            const renderDivider = shouldHighlight && !unreadDividerRendered;
            if (renderDivider) unreadDividerRendered = true;

            return (
              <View>
                {/* 안 읽은 신규 메시지 스플리터 구분선 */}
                {renderDivider && (
                  <View className="flex-row items-center my-4">
                    <View className="flex-1 h-[1px] bg-emerald-500/20" />
                    <View className="mx-3 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                      <Text className="text-emerald-400 text-[9px] font-black uppercase tracking-wider">
                        New Messages
                      </Text>
                    </View>
                    <View className="flex-1 h-[1px] bg-emerald-500/20" />
                  </View>
                )}

                {/* Message Bubble Container */}
                <View
                  className="flex-row mb-3"
                  style={{ justifyContent: isMyMessage ? "flex-end" : "flex-start" }}
                >
                  <View
                    className="max-w-[80%] px-4 py-3 rounded-2xl"
                    style={{
                      borderTopRightRadius: isMyMessage ? 0 : 16,
                      borderTopLeftRadius: isMyMessage ? 16 : 0,
                      backgroundColor: isMyMessage
                        ? "#059669" // bg-emerald-600
                        : shouldHighlight
                        ? "#18181B" // bg-zinc-900
                        : "#27272A", // bg-zinc-800
                      borderWidth: !isMyMessage && shouldHighlight ? 1 : 0,
                      borderColor: !isMyMessage && shouldHighlight ? "rgba(16, 185, 129, 0.4)" : "transparent",
                    }}
                  >
                    <Text className="text-white text-sm leading-relaxed">
                      {item.content}
                    </Text>
                    <View className="flex-row justify-end mt-1" style={{ opacity: 0.6 }}>
                      <Text className="text-zinc-300" style={{ fontSize: 8 }}>
                        {formatTime(item.createdAt)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          }}
        />

        {/* 3. Input Text Bar */}
        <View className="flex-row items-center p-3 border-t border-zinc-900/50 bg-[#121212]">
          <TextInput
            placeholder={`${selectedUser.fullName}님에게 메시지 전송...`}
            placeholderTextColor="#6B7280"
            value={inputMessage}
            onChangeText={setInputMessage}
            multiline
            className="flex-1 bg-zinc-900 text-white text-sm rounded-full py-2.5 px-4 max-h-20 border border-zinc-800"
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!inputMessage.trim()}
            className="ml-3 w-10 h-10 rounded-full items-center justify-center"
            style={{
              backgroundColor: inputMessage.trim() ? "#10B981" : "#27272A",
            }}
          >
            <Send size={16} color={inputMessage.trim() ? "black" : "#4B5563"} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
