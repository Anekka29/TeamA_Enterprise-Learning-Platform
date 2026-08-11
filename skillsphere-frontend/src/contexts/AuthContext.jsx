import { createContext, useState, useEffect, useCallback } from 'react';
import AuthUtils from '../utils/auth';
import UserService from '../services/UserService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialise from localStorage on mount
  useEffect(() => {
    const storedUser = AuthUtils.getCurrentUser();
    const token = AuthUtils.getToken();
    if (storedUser && token) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = useCallback((token, userData) => {
    AuthUtils.setAuth(token, userData);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    AuthUtils.clearAuth();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await UserService.getCurrentUser();
      const userData = { email: response.data.email, role: response.data.role, name: response.data.name };
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return response.data;
    } catch {
      logout();
      return null;
    }
  }, [logout]);

  const isAuthenticated = !!user && AuthUtils.isAuthenticated();

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
