// referloom_fixed/src/services/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// React Native handles localhost differently for Emulators
// Use your computer's local IP address (e.g., 'http://192.168.1.X:5000/api') if testing on a real physical device!
const BASE_URL = Platform.OS === 'android' ? 'https://referloom-api.onrender.com/api' : 'http://localhost:5001/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 seconds timeout
});

// Request Interceptor: Automatically inject the JWT token into every request
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
