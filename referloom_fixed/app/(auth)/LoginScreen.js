import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import ScreenWrapper from '../../src/components/ui/ScreenWrapper';

import { useAuth } from '../../src/context/AuthContext'; 

// Import your UI components and theme
import { COLORS } from '../../src/theme/colors';
import PrimaryButton from '../../src/components/ui/PrimaryButton';
import CustomInput from '../../src/components/ui/CustomInput';

export default function LoginScreen() {
  const { login, isLoading } = useAuth();
  
  // You are using individual state variables here (which is perfectly fine!)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // ✅ FIXED: Checking the 'email' and 'password' variables directly
    if (!email || !password) {
      Alert.alert("Missing Fields", "Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      // ✅ FIXED: Passing the direct variables to the login function
      await login(email, password);
      // Note: Router pushing is handled inside AuthContext now, so we don't need router.replace('/') here!
    } catch (error) {
      console.error("🚨 FULL LOGIN ERROR:", error); 
      Alert.alert("Login Failed", typeof error === 'string' ? error : error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Login to continue to Referloom</Text>

        <CustomInput
          label="Email Address"
          icon="mail"
          placeholder="Enter your college or work email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <CustomInput
          label="Password"
          icon="lock"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          password={true} 
        />

        <PrimaryButton
          title="Log In"
          onPress={handleLogin}
          isLoading={loading || isLoading}
        />
        
        {/* Navigation to Sign up */}
        <TouchableOpacity 
          style={styles.linkContainer} 
          onPress={() => router.push('/(auth)/RoleSelectScreen')}
        >
          <Text style={styles.linkText}>Don't have an account? Sign up</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 24, 
    justifyContent: 'center', 
    backgroundColor: COLORS.background 
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: COLORS.text.primary, 
    marginBottom: 8 
  },
  subtitle: { 
    fontSize: 16, 
    color: COLORS.text.secondary, 
    marginBottom: 32 
  },
  linkContainer: {
    marginTop: 24,
    alignItems: 'center'
  },
  linkText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 14
  }
});