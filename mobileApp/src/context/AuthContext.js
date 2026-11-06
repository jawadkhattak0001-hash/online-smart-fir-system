// src/context/AuthContext.js - REAL BACKEND ONLY
import React, { createContext, useState, useCallback, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// BASE_URL added directly to target Backend running on Port 5000
const BASE_URL = 'http://localhost:5000/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check stored user on mount
  useEffect(() => {
    const checkUser = async () => {
      try {
        const token = await AsyncStorage.getItem('@smartfir_token');
        const userData = await AsyncStorage.getItem('@smartfir_user');
        if (token && userData) {
          setUser(JSON.parse(userData));
        }
      } catch (err) {
        console.log('No saved session');
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const login = useCallback(async (phone, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();
      if (data.success) {
        await AsyncStorage.setItem('@smartfir_token', data.token);
        await AsyncStorage.setItem('@smartfir_user', JSON.stringify(data.user));
        setUser(data.user);
        return data.user;
      }
      throw new Error(data.message || 'Login failed');
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        await AsyncStorage.setItem('@smartfir_token', data.token);
        await AsyncStorage.setItem('@smartfir_user', JSON.stringify(data.user));
        setUser(data.user);
        return data.user;
      }
      throw new Error(data.message || 'Registration failed');
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem('@smartfir_token');
    await AsyncStorage.removeItem('@smartfir_user');
    setUser(null);
    setError(null);
  }, []);

  const updateProfile = useCallback(async (profileData) => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('@smartfir_token');
      const res = await fetch(`${BASE_URL}/auth/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });
      const data = await res.json();
      if (data.success) {
        await AsyncStorage.setItem('@smartfir_user', JSON.stringify(data.user));
        setUser(data.user);
        return data.user;
      }
      throw new Error(data.message || 'Update failed');
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('@smartfir_token');
      const res = await fetch(`${BASE_URL}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed');
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    clearError,
    isAuthenticated: !!user,
    userRole: user?.role || null,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}