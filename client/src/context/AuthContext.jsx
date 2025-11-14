// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verify token with backend before trusting localStorage
    const checkAuth = async () => {
      const token = authService.getToken();
      const savedUser = authService.getCurrentUser();
      
      if (token && savedUser) {
        try {
          // Verify token is still valid with backend
          const response = await authService.verify();
          if (response.valid) {
            setUser(savedUser);
          } else {
            // Token invalid, clear storage
            authService.logout();
            setUser(null);
          }
        } catch (error) {
          // If it's a network error or backend is down, keep user logged in
          // Only clear if it's a 401 (unauthorized) or 403 (forbidden) error
          console.log('Auth verification error:', error.response?.status, error.message);
          if (error.response?.status === 401 || error.response?.status === 403) {
            // Token invalid or expired
            console.log('Token invalid, logging out');
            authService.logout();
            setUser(null);
          } else {
            // Network error, backend down, or other error - keep user logged in from localStorage
            // This prevents logout on temporary network issues
            console.log('Network/backend error, keeping user logged in from localStorage');
            setUser(savedUser);
          }
        }
      } else {
        // No token or user, ensure clean state
        setUser(null);
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = async (email, pin) => {
    const data = await authService.login(email, pin);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
