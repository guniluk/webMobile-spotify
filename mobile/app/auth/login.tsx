import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useSSO } from "@clerk/clerk-expo";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { Music4 } from "lucide-react-native";
import { useRouter } from "expo-router";

// WebBrowser warm up hook for better performance and session control
function useWarmUpBrowser() {
  React.useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
}

export default function LoginScreen() {
  useWarmUpBrowser();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const { startSSOFlow } = useSSO();

  const handleGoogleLogin = React.useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      // AuthSession.makeRedirectUri를 사용하여 Expo Go와 빌드 환경 모두에 호환되는 올바른 리디렉트 URL을 얻습니다.
      const redirectUrl = AuthSession.makeRedirectUri({
        path: "sso-callback",
      });

      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
        redirectUrl,
      });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        router.replace("/(tabs)");
      }
    } catch (err: any) {
      console.error("OAuth error on mobile:", err);
      // 실물 기기에서 에러 원인을 추적할 수 있도록 Alert 팝업을 추가합니다.
      const errorMsg = err instanceof Error ? err.message : JSON.stringify(err);
      alert(`로그인 오류가 발생했습니다:\n${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  }, [startSSOFlow, router, isLoading]);

  return (
    <View className="flex-1 bg-[#121212] items-center justify-center p-6">
      {/* Spotify Metaphor Icon */}
      <View className="relative items-center mb-8">
        <View className="absolute w-24 h-24 rounded-full bg-yellow-500/30 blur-xl" />
        <View className="flex items-center justify-center w-20 h-20 border-2 rounded-full shadow-lg bg-zinc-900 border-yellow-500/40">
          <Music4 size={40} color="#FBBF24" />
        </View>
      </View>

      <Text className="mb-2 text-2xl font-black tracking-tight text-center text-white">
        Spotify Music Hub
      </Text>

      <Text className="text-zinc-400 text-sm text-center max-w-[280px] leading-relaxed mb-10">
        Enjoy Music & Chat! by logging in with your account.
      </Text>

      {/* Google Login Button */}
      <TouchableOpacity
        onPress={handleGoogleLogin}
        disabled={isLoading}
        className={`w-full flex-row items-center justify-center bg-emerald-500 hover:bg-emerald-400 py-3.5 px-6 rounded-full shadow-lg active:scale-95 transition-all ${
          isLoading ? "opacity-60" : ""
        }`}
      >
        <Image
          source={{
            uri: "https://cdn-icons-png.flaticon.com/512/2991/2991148.png",
          }}
          style={{ width: 18, height: 18, marginRight: 10, tintColor: "black" }}
        />
        <Text className="text-base font-bold text-black">
          {isLoading ? "Login..." : "Continue with Google"}
        </Text>
      </TouchableOpacity>

      {/* Guest bypass */}
      <TouchableOpacity
        onPress={() => router.replace("/(tabs)")}
        disabled={isLoading}
        className="py-2 mt-6"
      >
        <Text className="text-xs font-semibold underline text-zinc-500 hover:text-zinc-300">
          Browse as guest
        </Text>
      </TouchableOpacity>
    </View>
  );
}
