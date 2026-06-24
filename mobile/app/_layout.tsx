import "../global.css";
import { configureReanimatedLogger, ReanimatedLogLevel } from "react-native-reanimated";

// Disable strict mode to suppress warnings about reading shared values during render
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ClerkProvider, ClerkLoaded, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@/lib/tokenCache";
import { setupAxiosInterceptors } from "@/lib/axios";
import { useAuthStore } from "@/store/useAuthStore";
import { useSocketSync } from "@/hooks/useSocketSync";
import { View, ActivityIndicator } from "react-native";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY environment variable.");
}

function InitialLayout() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { checkAdminStatus, reset } = useAuthStore();
  const [initFinished, setInitFinished] = useState(false);

  // 전역 실시간 소켓 및 활동(음악 정보) 동기화 훅 호출
  useSocketSync();

  useEffect(() => {
    const initializeAuth = async () => {
      if (isLoaded) {
        // Axios 인터셉터에 Clerk 토큰 주입 처리 등록
        setupAxiosInterceptors(getToken);

        if (isSignedIn) {
          try {
            await checkAdminStatus();
          } catch (error) {
            console.error("Admin status check failed on mobile:", error);
          }
        } else {
          reset();
        }
        setInitFinished(true);
      }
    };
    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn]);

  // 최초 로딩 시에만 스피너를 보여주고, 한 번 로드가 끝나면 네비게이션 트리를 해제하지 않고 계속 유지
  if (!initFinished) {
    return (
      <View className="flex-1 bg-[#121212] items-center justify-center">
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#121212" } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="album/[albumId]" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="chat/[userId]" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="auth/login" options={{ presentation: "modal" }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <ClerkLoaded>
        <InitialLayout />
      </ClerkLoaded>
    </ClerkProvider>
  );
}
