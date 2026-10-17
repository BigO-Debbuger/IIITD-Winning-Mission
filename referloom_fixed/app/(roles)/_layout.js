// referloom_fixed/app/(roles)/_layout.js
import React from "react";
import { Stack, Redirect } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useAuth } from "../../src/context/AuthContext";
import { COLORS } from "../../src/theme/colors";

export function ErrorBoundary({ error, retry }) {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Oops! Something went wrong.</Text>
      <Text style={styles.errorText}>{error.message}</Text>
      <TouchableOpacity style={styles.retryBtn} onPress={retry}>
        <Text style={styles.retryText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function RolesLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/LoginScreen" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

const styles = StyleSheet.create({
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: COLORS.background },
  errorTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.error, marginBottom: 10 },
  errorText: { color: COLORS.text.secondary, textAlign: 'center', marginBottom: 20 },
  retryBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  retryText: { color: COLORS.surface, fontWeight: 'bold' }
});