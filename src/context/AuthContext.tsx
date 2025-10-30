import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import api from '../api';
import { AdminProfile } from '../../types';

interface AuthState {
  user: (AdminProfile & { _id: string; token: string }) | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (profileData: AdminProfile) => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthState['user']>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for user in localStorage on initial load
    const storedUser = localStorage.getItem('sda-sports-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('sda-sports-user', JSON.stringify(data));
    setUser(data);
  };

  const logout = () => {
    localStorage.removeItem('sda-sports-user');
    setUser(null);
  };

  const updateProfile = async (profileData: AdminProfile) => {
     const { data } = await api.put('/auth/profile', profileData);
     localStorage.setItem('sda-sports-user', JSON.stringify(data));
     setUser(data);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};