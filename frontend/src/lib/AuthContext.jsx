import React, { createContext, useState, useContext, useEffect } from 'react';
import { apiService } from './api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    checkUserAuth();
  }, []);

  const login = async (username, password) => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      const data = await apiService.login(username, password);
      setUser(data.user);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      setAuthError({ type: 'auth_failed', message: error.message });
      return { success: false, error: error.message };
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const checkUserAuth = async () => {
    setIsLoadingAuth(true);
    const token = localStorage.getItem('edocpdf_token');
    if (!token) {
      setIsAuthenticated(false);
      setUser(null);
      setAuthChecked(true);
      setIsLoadingAuth(false);
      return;
    }
    try {
      const userData = await apiService.getCurrentUser();
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('edocpdf_token');
      apiService.clearToken();
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setAuthChecked(true);
      setIsLoadingAuth(false);
    }
  };

  const logout = () => {
    apiService.clearToken();
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = '/';
  };

  const navigateToLogin = () => window.location.href = '/login';
  const checkAppState = () => ({ isAuthenticated, user });

  const value = { user, isAuthenticated, isLoadingAuth, authError, authChecked, login, logout, navigateToLogin, checkUserAuth, checkAppState };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);