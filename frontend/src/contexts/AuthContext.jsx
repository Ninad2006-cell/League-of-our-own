import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for existing session on mount
    const token = localStorage.getItem('cdms_auth_token');
    const userStr = localStorage.getItem('cdms_auth_user');
    
    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing user data:', error);
        // Clear invalid data
        localStorage.removeItem('cdms_auth_token');
        localStorage.removeItem('cdms_auth_user');
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await api.login(email, password);
    setUser(response.user);
    setIsAuthenticated(true);
    return response;
  };

  const register = async (name, email, password, role = 'user') => {
    const response = await api.register(name, email, password, role);
    setUser(response.user);
    setIsAuthenticated(true);
    return response;
  };

  const logout = () => {
    api.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    isAdmin: user?.role === 'admin',
    isScorer: user?.role === 'scorer',
    isUser: user?.role === 'user',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
