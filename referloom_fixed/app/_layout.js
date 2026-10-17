// referloom_fixed/app/_layout.js
import React from "react";
import { Stack } from "expo-router";
import { AuthProvider } from "../src/context/AuthContext";
import Toast from "react-native-toast-message";
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(roles)" />
          </Stack>
          <Toast />
        </>
      </AuthProvider>
    </SafeAreaProvider>
  );
}