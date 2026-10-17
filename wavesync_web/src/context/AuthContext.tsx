// wavesync_web/src/context/AuthContext.tsx
import React, { createContext, useContext, useState } from 'react';
import { User, api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string, role: string) => Promise<void>;
  sendOtp: (email: string) => Promise<{ message: string; devOtp?: string }>;
  verifyOtp: (email: string, otp: string) => Promise<{ message: string }>;
  logout: () => void;
  openAuthModal: (mode?: 'login' | 'register' | 'otp', emailPreset?: string) => void;
  closeAuthModal: () => void;
  authModalOpen: boolean;
  authModalMode: 'login' | 'register' | 'otp';
  initialEmail: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('wavesync_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('wavesync_token');
  });
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'otp'>('login');
  const [initialEmail, setInitialEmail] = useState('');

  const openAuthModal = (mode: 'login' | 'register' | 'otp' = 'login', emailPreset = '') => {
    setAuthModalMode(mode);
    setInitialEmail(emailPreset);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const login = async (email: string, pass: string) => {
    const res = await api.login(email, pass);
    setUser(res.user);
    setToken(res.token);
    localStorage.setItem('wavesync_token', res.token);
    localStorage.setItem('wavesync_user', JSON.stringify(res.user));
    closeAuthModal();
  };

  const register = async (name: string, email: string, pass: string, role: string) => {
    const res = await api.register(name, email, pass, role);
    setUser(res.user);
    setToken(res.token);
    localStorage.setItem('wavesync_token', res.token);
    localStorage.setItem('wavesync_user', JSON.stringify(res.user));
    closeAuthModal();
  };

  const sendOtp = async (email: string) => {
    return api.sendOtp(email);
  };

  const verifyOtp = async (email: string, otp: string) => {
    return api.verifyOtp(email, otp);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('wavesync_token');
    localStorage.removeItem('wavesync_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        login,
        register,
        sendOtp,
        verifyOtp,
        logout,
        openAuthModal,
        closeAuthModal,
        authModalOpen,
        authModalMode,
        initialEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
