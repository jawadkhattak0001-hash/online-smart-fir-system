// src/hooks/useData.js - ENHANCED VERSION
import { useContext, useMemo, useCallback } from 'react';
import { Alert } from 'react-native';
import { DataContext } from '../context/DataContext';

export function useData() {
  const context = useContext(DataContext);
  
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }

  const { 
    user,
    firs,
    notifications,
    loading,
    setUser,
    addFir,
    updateFir,
    deleteFir,
    getFirById,
    getFirsByStatus,
    getRecentFirs,
    searchFirs,
    getStats,
    setFirs,
    addNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearAllNotifications,
    getUnreadNotificationsCount,
    refreshData 
  } = context;

  // Enhanced FIR operations
  const enhancedAddFir = useCallback(async (firData) => {
    try {
      const newFir = addFir(firData);
      
      Alert.alert(
        'Success',
        `FIR created successfully!\nTracking Number: ${newFir.trackingNumber}`,
        [{ text: 'OK' }]
      );
      
      return newFir;
    } catch (error) {
      Alert.alert('Error', 'Failed to create FIR');
      throw error;
    }
  }, [addFir]);

  const enhancedUpdateFir = useCallback(async (firId, updates) => {
    try {
      const updatedFir = updateFir(firId, updates);
      
      Alert.alert('Success', 'FIR updated successfully');
      return updatedFir;
    } catch (error) {
      Alert.alert('Error', 'Failed to update FIR');
      throw error;
    }
  }, [updateFir]);

  const enhancedDeleteFir = useCallback(async (firId) => {
    Alert.alert(
      'Delete FIR',
      'Are you sure you want to delete this FIR? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            deleteFir(firId);
            Alert.alert('Success', 'FIR deleted successfully');
          }
        }
      ]
    );
  }, [deleteFir]);

  // Enhanced notification operations
  const enhancedAddNotification = useCallback((title, message, type = 'info', firId = null) => {
    addNotification({
      title,
      message,
      type,
      firId,
      timestamp: new Date().toISOString()
    });
  }, [addNotification]);

  const enhancedMarkNotificationAsRead = useCallback((notificationId) => {
    markNotificationAsRead(notificationId);
    
    // Optional: Show toast/snackbar
    // Toast.show('Notification marked as read');
  }, [markNotificationAsRead]);

  // User operations
  const updateUserProfile = useCallback(async (profileUpdates) => {
    try {
      setUser(profileUpdates);
      Alert.alert('Success', 'Profile updated successfully');
      return true;
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
      throw error;
    }
  }, [setUser]);

  // Enhanced data queries
  const getFirStatusCounts = useCallback(() => {
    const stats = getStats();
    return [
      { label: 'Total', value: stats.total, color: 'blue' },
      { label: 'Pending', value: stats.pending, color: 'yellow' },
      { label: 'Under Review', value: stats.underReview, color: 'blue' },
      { label: 'Investigation', value: stats.investigation, color: 'purple' },
      { label: 'Resolved', value: stats.resolved, color: 'green' }
    ];
  }, [getStats]);

  const getPriorityFirs = useCallback((priority = 'High') => {
    return firs.filter(fir => fir.priority === priority);
  }, [firs]);

  const getFirsByPoliceStation = useCallback((stationName) => {
    return firs.filter(fir => fir.policeStation === stationName);
  }, [firs]);

  const getFirsByIncidentType = useCallback((type) => {
    return firs.filter(fir => fir.incidentType === type);
  }, [firs]);

  const getLatestNotifications = useCallback((count = 5) => {
    return [...notifications]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, count);
  }, [notifications]);

  const getUnreadNotifications = useCallback(() => {
    return notifications.filter(notif => !notif.read);
  }, [notifications]);

  // Formatters and helpers
  const formatFirDate = useCallback((dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }, []);

  const formatFirDateTime = useCallback((dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  const getFirStatusColor = useCallback((status) => {
    const statusColors = {
      'DRAFT': 'gray',
      'PENDING': 'yellow',
      'UNDER_REVIEW': 'blue',
      'APPROVED': 'green',
      'REJECTED': 'red',
      'INVESTIGATION_STARTED': 'purple',
      'RESOLVED': 'green',
      'CLOSED': 'gray'
    };
    return statusColors[status] || 'gray';
  }, []);

  const getFirPriorityColor = useCallback((priority) => {
    const priorityColors = {
      'High': 'red',
      'Medium': 'yellow',
      'Low': 'green'
    };
    return priorityColors[priority] || 'gray';
  }, []);

  // Memoized derived data
  const stats = useMemo(() => getStats(), [getStats]);
  const recentFirs = useMemo(() => getRecentFirs(5), [getRecentFirs]);
  const unreadNotifications = useMemo(() => getUnreadNotifications(), [getUnreadNotifications]);
  const unreadCount = useMemo(() => getUnreadNotificationsCount(), [getUnreadNotificationsCount]);

  return {
    // Original context values
    user,
    firs,
    notifications,
    loading,
    setUser,
    addFir,
    updateFir,
    deleteFir,
    getFirById,
    getFirsByStatus,
    getRecentFirs,
    searchFirs,
    getStats,
    setFirs,
    addNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearAllNotifications,
    getUnreadNotificationsCount,
    refreshData,
    
    // Enhanced operations
    createFir: enhancedAddFir,
    modifyFir: enhancedUpdateFir,
    removeFir: enhancedDeleteFir,
    createNotification: enhancedAddNotification,
    markNotificationRead: enhancedMarkNotificationAsRead,
    updateProfile: updateUserProfile,
    
    // Enhanced queries
    getFirStatusCounts,
    getPriorityFirs,
    getFirsByPoliceStation,
    getFirsByIncidentType,
    getLatestNotifications,
    getUnreadNotifications,
    
    // Formatters
    formatFirDate,
    formatFirDateTime,
    getFirStatusColor,
    getFirPriorityColor,
    
    // Memoized values for convenience
    stats,
    recentFirs,
    unreadNotifications,
    unreadCount,
    
    // Convenience getters
    totalFirs: stats.total,
    pendingFirs: stats.pending,
    resolvedFirs: stats.resolved,
    statusCounts: getFirStatusCounts(),
    
    // Checkers
    hasFirs: firs.length > 0,
    hasNotifications: notifications.length > 0,
    hasUnreadNotifications: unreadCount > 0
  };
}

// Specialized hooks for specific use cases

export function useFirOperations() {
  const { 
    createFir, 
    modifyFir, 
    removeFir, 
    getFirById,
    searchFirs 
  } = useData();
  
  return {
    createFir,
    modifyFir,
    removeFir,
    getFirById,
    searchFirs
  };
}

export function useFirList(filters = {}) {
  const { firs, getFirsByStatus } = useData();
  
  const filteredFirs = useMemo(() => {
    let filtered = [...firs];
    
    if (filters.status) {
      filtered = getFirsByStatus(filters.status);
    }
    
    if (filters.priority) {
      filtered = filtered.filter(fir => fir.priority === filters.priority);
    }
    
    if (filters.search) {
      filtered = filtered.filter(fir => 
        fir.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        fir.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return filtered;
  }, [firs, filters, getFirsByStatus]);
  
  return {
    firs: filteredFirs,
    totalCount: filteredFirs.length,
    isEmpty: filteredFirs.length === 0
  };
}

export function useNotifications() {
  const { 
    notifications,
    unreadCount,
    unreadNotifications,
    latestNotifications,
    markNotificationRead,
    markAllNotificationsAsRead,
    clearAllNotifications,
    createNotification 
  } = useData();
  
  const markAsRead = useCallback((id) => {
    markNotificationRead(id);
  }, [markNotificationRead]);
  
  return {
    notifications,
    unreadCount,
    unreadNotifications,
    latestNotifications: latestNotifications || notifications.slice(0, 5),
    markAsRead,
    markAllAsRead: markAllNotificationsAsRead,
    clearAll: clearAllNotifications,
    createNotification
  };
}

export function useUserProfile() {
  const { user, updateProfile, setUser } = useData();
  
  const updateUserField = useCallback(async (field, value) => {
    return updateProfile({ [field]: value });
  }, [updateProfile]);
  
  const completeProfile = useCallback(() => {
    const requiredFields = ['name', 'phone', 'cnic'];
    const missingFields = requiredFields.filter(field => !user?.[field]);
    
    if (missingFields.length > 0) {
      Alert.alert(
        'Profile Incomplete',
        `Please complete your profile. Missing: ${missingFields.join(', ')}`
      );
      return false;
    }
    
    return true;
  }, [user]);
  
  return {
    profile: user,
    isProfileComplete: completeProfile(),
    updateProfile,
    updateUserField,
    setUser
  };
}

export function useDataStats() {
  const { 
    stats, 
    getFirStatusCounts,
    formatFirDate,
    formatFirDateTime 
  } = useData();
  
  return {
    stats,
    statusCounts: getFirStatusCounts(),
    formatFirDate,
    formatFirDateTime
  };
}