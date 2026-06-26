import React, { useEffect } from "react";
import { useClerk } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { View, ActivityIndicator } from "react-native";

export default function SSOCallback() {
  const { handleRedirectCallback } = useClerk();
  const router = useRouter();

  useEffect(() => {
    handleRedirectCallback({
      signInForceRedirectUrl: "/(tabs)",
      signUpForceRedirectUrl: "/(tabs)",
    })
      .then(() => {
        router.replace("/(tabs)");
      })
      .catch((err) => {
        console.error("SSO callback error:", err);
        router.replace("/");
      });
  }, [handleRedirectCallback, router]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
