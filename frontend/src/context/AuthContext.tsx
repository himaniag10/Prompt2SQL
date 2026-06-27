import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<string>;
  verifyEmail: (data: any) => Promise<void>;
  resendOtp: (data: any) => Promise<void>;
  forgotPassword: (data: any) => Promise<void>;
  resetPassword: (data: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setLoading(false);
          return;
        }
        
        const res = await api.get('/auth/me');
        setUser(res.data.user);
      } catch (error) {
        // Token might be invalid or expired, clear it
        localStorage.removeItem('accessToken');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = async (data: any) => {
    const res = await api.post('/auth/login', data);
    localStorage.setItem('accessToken', res.data.accessToken);
    setUser(res.data.user);
  };

  const register = async (data: any) => {
    await api.post('/auth/register', data);
    return data.email; // Return email to transition to OTP screen
  };

  const verifyEmail = async (data: any) => {
    const res = await api.post('/auth/verify-email', data);
    localStorage.setItem('accessToken', res.data.accessToken);
    setUser(res.data.user);
  };

  const resendOtp = async (data: any) => {
    await api.post('/auth/resend-otp', data);
  };

  const forgotPassword = async (data: any) => {
    await api.post('/auth/forgot-password', data);
  };

  const resetPassword = async (data: any) => {
    await api.post('/auth/reset-password', data);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      localStorage.removeItem('accessToken');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, verifyEmail, resendOtp, forgotPassword, resetPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
