import { createContext, useState, useEffect, useCallback } from 'react';
import AuthUtils from '../utils/auth';
import UserService from '../services/UserService';
import ProfileService from '../services/ProfileService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const storedUser = AuthUtils.getCurrentUser() || {};
      const [userRes, profileRes] = await Promise.allSettled([
        UserService.getCurrentUser(),
        ProfileService.getCurrentProfile(),
      ]);

      const userDataFromApi = userRes.status === 'fulfilled' ? userRes.value.data : {};
      const profileDataFromApi = profileRes.status === 'fulfilled' ? profileRes.value.data : {};

      let profileImage = '';
      if (typeof profileDataFromApi?.profileImage === 'string') {
        profileImage = profileDataFromApi.profileImage;
      } else if (typeof userDataFromApi?.profileImage === 'string') {
        profileImage = userDataFromApi.profileImage;
      } else if (typeof storedUser?.profileImage === 'string') {
        profileImage = storedUser.profileImage;
      }

      const name =
        profileDataFromApi?.fullName ||
        userDataFromApi?.name ||
        userDataFromApi?.fullName ||
        storedUser?.name ||
        '';

      const userData = {
        ...storedUser,
        email: userDataFromApi.email || profileDataFromApi.email || storedUser.email,
        role: userDataFromApi.role || profileDataFromApi.role || storedUser.role,
        name,
        profileImage,
        profileCompleted: userDataFromApi.profileCompleted ?? profileDataFromApi.profileCompleted ?? storedUser.profileCompleted,
      };

      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setLoading(false);
      return userData;
    } catch (e) {
      console.warn('Error refreshing user profile in AuthContext:', e);
      setLoading(false);
      return null;
    }
  }, []);

  // Initialise from localStorage on mount & refresh from API
  useEffect(() => {
    const storedUser = AuthUtils.getCurrentUser();
    const token = AuthUtils.getToken();
    if (storedUser && token) {
      setUser(storedUser);
      refreshUser();
    } else {
      setLoading(false);
    }
  }, [refreshUser]);

  // Listen for profile update events across components/tabs
  useEffect(() => {
    const handleUpdate = () => {
      refreshUser();
    };
    window.addEventListener('profileUpdated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('profileUpdated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [refreshUser]);

  const login = useCallback((token, userData) => {
    AuthUtils.setAuth(token, userData);
    setUser(userData);
    refreshUser();
  }, [refreshUser]);

  const logout = useCallback(() => {
    AuthUtils.clearAuth();
    setUser(null);
  }, []);

  const isAuthenticated = !!user && AuthUtils.isAuthenticated();

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
