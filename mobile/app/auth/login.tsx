import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useOAuth } from "@clerk/clerk-expo";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { Music4 } from "lucide-react-native";
import { useRouter } from "expo-router";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const handleGoogleLogin = React.useCallback(async () => {
    try {
      const { createdSessionId, setActive } = await startOAuthFlow({
        redirectUrl: Linking.createURL("/sso-callback", { scheme: "mobile" }),
      });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        router.replace("/(tabs)");
      }
    } catch (err) {
      console.error("OAuth error on mobile:", err);
    }
  }, [startOAuthFlow, router]);

  return (
    <View className="flex-1 bg-[#121212] items-center justify-center p-6">
      {/* Spotify Metaphor Icon */}
      <View className="relative mb-8 items-center">
        <View className="absolute w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl" />
        <View className="w-20 h-20 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center shadow-lg">
          <Music4 size={40} className="text-emerald-500" />
        </View>
      </View>

      <Text className="text-white text-2xl font-black mb-2 tracking-tight text-center">
        Spotify Music Hub
      </Text>
      
      <Text className="text-zinc-400 text-sm text-center max-w-[280px] leading-relaxed mb-10">
        로그인하여 나만의 플레이리스트를 즐기고, 실시간으로 친구들과 연결해 보세요.
      </Text>

      {/* Google Login Button */}
      <TouchableOpacity
        onPress={handleGoogleLogin}
        className="w-full flex-row items-center justify-center bg-emerald-500 hover:bg-emerald-400 py-3.5 px-6 rounded-full shadow-lg active:scale-95 transition-all"
      >
        <Image
          source={{ uri: "https://cdn-icons-png.flaticon.com/512/2991/2991148.png" }}
          style={{ width: 18, height: 18, marginRight: 10, tintColor: "black" }}
        />
        <Text className="text-black font-bold text-base">Google 계정으로 계속하기</Text>
      </TouchableOpacity>

      {/* Guest bypass */}
      <TouchableOpacity
        onPress={() => router.replace("/(tabs)")}
        className="mt-6 py-2"
      >
        <Text className="text-zinc-500 hover:text-zinc-300 text-xs font-semibold underline">
          비회원으로 둘러보기
        </Text>
      </TouchableOpacity>
    </View>
  );
}
