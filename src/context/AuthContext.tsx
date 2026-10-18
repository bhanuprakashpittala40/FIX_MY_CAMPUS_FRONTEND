import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { api, getToken, setToken, removeToken } from '../lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  unreadCount: number;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  switchDemoRole: (role: Role) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const fetchCurrentUser = async () => {
    try {
      if (!getToken()) {
        setIsLoading(false);
        return;
      }
      const data = await api.auth.me();
      setUser(data.user);
      setUnreadCount(data.unreadNotifications);
    } catch (err) {
      console.warn('Session expired or invalid, clearing credentials.');
      removeToken();
      setTokenState(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, [token]);

  const login = async (credentials: { email: string; password: string }) => {
    const data = await api.auth.login(credentials);
    setToken(data.token);
    setTokenState(data.token);
    setUser(data.user);
    await refreshNotifications();
  };

  const register = async (userData: any) => {
    const data = await api.auth.register(userData);
    setToken(data.token);
    setTokenState(data.token);
    setUser(data.user);
    await refreshNotifications();
  };

  const logout = () => {
    removeToken();
    setTokenState(null);
    setUser(null);
    setUnreadCount(0);
  };

  const switchDemoRole = async (role: Role) => {
    setIsLoading(true);
    try {
      const data = await api.auth.demoLogin(role);
      setToken(data.token);
      setTokenState(data.token);
      setUser(data.user);
      await refreshNotifications();
    } catch (error) {
      console.error('Demo login switch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshNotifications = async () => {
    if (!getToken()) return;
    try {
      const data = await api.notifications.list();
      setUnreadCount(data.unreadCount);
    } catch (e) {
      // ignore background poll errors
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        unreadCount,
        login,
        register,
        logout,
        switchDemoRole,
        refreshNotifications,
      }}
    >
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
