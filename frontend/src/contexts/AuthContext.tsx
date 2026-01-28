import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{
    accessToken: string;
    user: {
      id: number;
      username: string;
      role: string;
    };
 }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /**
   * 初期化：
   * accessToken があれば「ログイン中」とみなす
   */
  useEffect(() => {
    const access = localStorage.getItem('accessToken');
    if (access) {
      setIsAuthenticated(true);
    }
  }, []);

  /**
   * tokenの変更を監視（他タブでのログイン・ログアウト対応）
   */
  useEffect(() => {
    const handler = () => {
      const access = localStorage.getItem('accessToken');
      setIsAuthenticated(!!access);
    };

    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const login = async (username: string, password: string) => {
    const res = await authService.login(username, password);
    setIsAuthenticated(true);
    return res;
  };

  const logout = async () => {
    let res;
    try {
      res = await authService.logout();
      console.log('logout response:', res);

    } catch (e) {
      console.warn('logout failed, force clear');
    } finally {
      localStorage.removeItem('accessToken');
      setIsAuthenticated(false);
    }
    return res;
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};