// src/context/DataContext.js - REAL DATA ONLY (No Demo)
import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  USER: 'user_data',
  FIRS: 'user_firs',
  NOTIFICATIONS: 'user_notifications'
};

export const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [user, setUser] = useState(null);
  const [firs, setFirs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load data from storage
  const loadData = async () => {
    try {
      const [userData, firsData, notifData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.FIRS),
        AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)
      ]);
      if (userData) setUser(JSON.parse(userData));
      if (firsData) setFirs(JSON.parse(firsData));
      if (notifData) setNotifications(JSON.parse(notifData));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save data when it changes
  useEffect(() => {
    const save = async () => {
      try {
        if (user) await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        if (firs.length > 0) await AsyncStorage.setItem(STORAGE_KEYS.FIRS, JSON.stringify(firs));
        if (notifications.length > 0) await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
      } catch (e) { console.error('Save error:', e); }
    };
    if (!loading) save();
  }, [user, firs, notifications]);

  useEffect(() => { loadData(); }, []);

  const updateUser = (updates) => setUser(prev => ({ ...prev, ...updates }));

  const addFir = (fir) => {
    const newFir = {
      ...fir,
      id: fir.id || `FIR-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: fir.status || 'PENDING',
    };
    setFirs(prev => [newFir, ...prev]);
    return newFir;
  };

  const updateFir = (id, updates) => {
    setFirs(prev => prev.map(f => f.id === id ? { ...f, ...updates, updatedAt: new Date().toISOString() } : f));
  };

  const deleteFir = (id) => setFirs(prev => prev.filter(f => f.id !== id));

  const getFirById = (id) => firs.find(f => f.id === id);
  const getFirsByStatus = (status) => firs.filter(f => f.status === status);
  const getRecentFirs = (count = 5) => [...firs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, count);
  const searchFirs = (query) => {
    if (!query) return firs;
    const q = query.toLowerCase();
    return firs.filter(f => (f.title || '').toLowerCase().includes(q) || (f.description || '').toLowerCase().includes(q) || (f.id || '').toLowerCase().includes(q));
  };
  const getStats = () => ({
    total: firs.length,
    pending: firs.filter(f => f.status === 'PENDING').length,
    investigation: firs.filter(f => f.status === 'INVESTIGATION_STARTED').length,
    resolved: firs.filter(f => f.status === 'RESOLVED' || f.status === 'CLOSED').length,
  });

  const addNotification = (notif) => {
    const newNotif = { id: `notif_${Date.now()}`, timestamp: new Date().toISOString(), read: false, ...notif };
    setNotifications(prev => [newNotif, ...prev]);
  };
  const markNotificationAsRead = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllNotificationsAsRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const clearAllNotifications = () => setNotifications([]);
  const getUnreadNotificationsCount = () => notifications.filter(n => !n.read).length;

  return (
    <DataContext.Provider value={{
      user, firs, notifications, loading,
      setUser: updateUser, addFir, updateFir, deleteFir,
      getFirById, getFirsByStatus, getRecentFirs, searchFirs, getStats, setFirs,
      addNotification, markNotificationAsRead, markAllNotificationsAsRead,
      clearAllNotifications, getUnreadNotificationsCount, refreshData: loadData
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
}