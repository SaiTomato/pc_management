import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';

interface AuthUser {
  id: number;
  username: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
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
  const [user, setUser] = useState<AuthUser | null>(null);

  /**
   * 初期化：
   * accessToken があれば「ログイン中」とみなす
   */
  useEffect(() => {
    const access = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');

    if (access && userStr) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userStr));
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
    localStorage.setItem('user', JSON.stringify(res.user));
    setIsAuthenticated(true);
    setUser(res.user);
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
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    }
    return res;
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};