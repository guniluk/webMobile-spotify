import React from "react";
import { AuthenticateWithRedirectCallback } from "@clerk/clerk-expo";

export default function SSOCallback() {
  return <AuthenticateWithRedirectCallback signInForceRedirectUrl="/(tabs)" signUpForceRedirectUrl="/(tabs)" />;
}
