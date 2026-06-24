import React from "react";
import { Tabs } from "expo-router";
import { Home, MessageSquare } from "lucide-react-native";
import { View, StyleSheet } from "react-native";
import MiniPlayer from "@/components/MiniPlayer";

export default function TabLayout() {
  return (
    <View style={styles.container}>
      {/* 탭 네비게이션 */}
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#10B981", // active text/icon color: emerald-500
          tabBarInactiveTintColor: "#9CA3AF", // inactive: gray-400
          tabBarStyle: {
            backgroundColor: "#18181B", // zinc-900
            borderTopWidth: 1,
            borderTopColor: "#27272A", // zinc-800
            paddingBottom: 5,
            paddingTop: 5,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "600",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "홈",
            tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: "채팅",
            tabBarIcon: ({ color, size }) => <MessageSquare color={color} size={size} />,
          }}
        />
      </Tabs>

      {/* 실시간 플로팅 미니 플레이어 바 (재생 중인 곡이 있을 때만 노출) */}
      <MiniPlayer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
});
