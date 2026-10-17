// referloom_fixed/src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import api from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Temporary storage for user details between the Register screen and the OTP screen
  const [pendingUser, setPendingUser] = useState(null); 
  
  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        const response = await api.get('/users/profile');
        setUser(response.data);
      }
    } catch (error) {
      console.log("Token expired or invalid", error);
      await AsyncStorage.removeItem('userToken');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;
      
      // FIX: Save both token and user object uniformly
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(userData)); 
      
      setUser(userData);
      routeUserByRole(userData.role);
    } catch (error) {
      throw error.response?.data?.message || "Login failed. Please check your network.";
    }
  };

  // --- NEW REGISTRATION & OTP METHODS ---

  const sendOtp = async (email) => {
    try {
      await api.post('/otp/send', { email });
    } catch (error) {
      throw error.response?.data?.message || "Failed to send OTP.";
    }
  };

  const verifyOtp = async (email, otp) => {
    try {
      await api.post('/otp/verify-otp', { email, otp });
    } catch (error) {
      throw error.response?.data?.message || "Invalid OTP.";
    }
  };

  const registerUser = async (userData) => {
    try {
      const payload = {
        ...userData,
        fullName: `${userData.firstName} ${userData.lastName}`
      };
      
      const response = await api.post('/auth/register', payload);
      const { token, user: newUser } = response.data;
      
      // FIX: Save both token and user object uniformly
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(newUser));
      
      setUser(newUser);
      setPendingUser(null);
      routeUserByRole(newUser.role);
    } catch (error) {
      throw error.response?.data?.message || "Registration failed.";
    }
  };

  const loadUser = async () => {
    try {
      // FIX: Use the exact same keys as the login function
      const storedToken = await AsyncStorage.getItem('userToken'); 
      const storedUser = await AsyncStorage.getItem('userData');
  
      if (storedToken && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
  
        try {
          const targetId = parsedUser._id || parsedUser.id;
          const freshResponse = await api.get(`/users/${targetId}`);
          const freshUser = freshResponse.data;
  
          setUser(freshUser);
          await AsyncStorage.setItem('userData', JSON.stringify(freshUser)); // FIX: updated key here too
        } catch (fetchErr) {
          console.log("Could not sync fresh user data from DB", fetchErr.message);
        }
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };
  // ---------------------------------------
  const refreshUser = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        // Fetch fresh data from your database
        const response = await api.get('/users/profile');
        const freshUser = response.data;
        
        // Update state and storage instantly
        setUser(freshUser);
        await AsyncStorage.setItem('userData', JSON.stringify(freshUser));
      }
    } catch (error) {
      console.log("Failed to refresh user data:", error);
    }
  };
  const logout = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
    setUser(null);
    router.replace('/(auth)/LoginScreen');
  };

  const routeUserByRole = (role) => {
    if (role === 'student') router.replace('/(roles)/student');
    else if (role === 'company') router.replace('/(roles)/company');
    else if (role === 'alumni') router.replace('/(roles)/alumni');
  };

  return (
    <AuthContext.Provider value={{ 
      user, isLoading, login, logout, setUser, routeUserByRole,
      pendingUser, setPendingUser, sendOtp, verifyOtp, registerUser ,refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};



export const useAuth = () => useContext(AuthContext);