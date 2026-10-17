// referloom_frontend/app/index.js
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { COLORS } from '../src/theme/colors';

export default function Index() {
  const { user, isLoading } = useAuth();

  // 1. Show a loading spinner while AuthContext checks SecureStore
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // 2. If no user is found, send them to Login
  if (!user) {
    return <Redirect href="/(auth)/LoginScreen" />;
  }

  // 3. Role-Based Redirection 
  // (Fixed paths to use the correct `/(roles)/...` folder structure)
  switch (user.role) {
    case 'student':
      return <Redirect href="/(roles)/student" />;
    case 'alumni':
      return <Redirect href="/(roles)/alumni" />;
    case 'company':
      return <Redirect href="/(roles)/company" />;
    case 'admin':
      return <Redirect href="/(roles)/admin" />;
    default:
      // Fallback just in case
      return <Redirect href="/(auth)/LoginScreen" />;
  }
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});