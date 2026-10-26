import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('dlm_token');
    const savedUser = localStorage.getItem('dlm_user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('dlm_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (usernameOrEmail, password) => {
    const res = await api.post('/auth/login', { usernameOrEmail, password });
    if (res.data.success && res.data.data) {
      const authData = res.data.data;
      setToken(authData.accessToken);
      const userData = {
        id: authData.id,
        username: authData.username,
        email: authData.email,
        fullName: authData.fullName,
        role: authData.role,
      };
      setUser(userData);
      localStorage.setItem('dlm_token', authData.accessToken);
      localStorage.setItem('dlm_user', JSON.stringify(userData));
      return { success: true };
    }
    return { success: false, message: res.data.message || 'Login failed' };
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.success && res.data.data) {
      const authData = res.data.data;
      setToken(authData.accessToken);
      const userObj = {
        id: authData.id,
        username: authData.username,
        email: authData.email,
        fullName: authData.fullName,
        role: authData.role,
      };
      setUser(userObj);
      localStorage.setItem('dlm_token', authData.accessToken);
      localStorage.setItem('dlm_user', JSON.stringify(userObj));
      return { success: true };
    }
    return { success: false, message: res.data.message || 'Registration failed' };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('dlm_token');
    localStorage.removeItem('dlm_user');
  };

  const updateLocalProfile = (updatedProfile) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedProfile };
      localStorage.setItem('dlm_user', JSON.stringify(merged));
      return merged;
    });
  };

  const isAdmin = user?.role === 'ROLE_ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        isAdmin,
        login,
        register,
        logout,
        updateLocalProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
