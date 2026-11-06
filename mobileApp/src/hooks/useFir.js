// src/hooks/useFir.js - ENHANCED VERSION
import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define FIR status constants
const FIR_STATUS = {
  DRAFT: 'DRAFT',
  PENDING: 'PENDING',
  UNDER_REVIEW: 'UNDER_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  INVESTIGATION_STARTED: 'INVESTIGATION_STARTED',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED'
};

// Mock API service
const MockApi = {
  getUserFirs: async () => ({
    success: true,
    data: [
      {
        id: 'FIR-2024-001',
        title: 'Mobile Phone Theft',
        status: FIR_STATUS.APPROVED,
        date: '2024-01-15',
        time: '10:30 AM',
        policeStation: 'Islamabad - Tarnol',
        incidentType: 'theft',
        location: 'Sector B17, Islamabad',
        description: 'Mobile phone stolen from market while shopping',
        involvedParties: 'Unknown male, 25-30 years',
        contactInfo: '0300-1234567',
        priority: 'High',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T14:30:00Z',
        assignedOfficer: 'ASI Muhammad Talha',
        officerContact: '051-1234567',
        firNumber: 'FIR-001/2024',
        category: 'Property Crime',
        stationCode: 'TNL-001',
        complainantName: 'Muhammad Ahmed',
        complainantCnic: '37405-1234567-1',
        trackingNumber: 'TRK-001-2024'
      },
      // ... other demo FIRs
    ]
  }),

  submitFir: async (firData) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      message: 'FIR submitted successfully',
      data: {
        ...firData,
        id: `FIR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: FIR_STATUS.PENDING,
        trackingNumber: `TRK-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}-${new Date().getFullYear()}`,
        firNumber: `FIR/${new Date().getDate()}/${new Date().getMonth() + 1}/${new Date().getFullYear()}`
      }
    };
  },

  getFirById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      data: {
        id,
        title: 'Sample FIR',
        status: FIR_STATUS.PENDING,
        // ... other fields
      }
    };
  },

  updateFir: async (id, updates) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      message: 'FIR updated successfully',
      data: { id, ...updates }
    };
  }
};

export const useFir = () => {
  const [firs, setFirs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFir, setSelectedFir] = useState(null);

  // Load FIRs from AsyncStorage on mount
  const loadFirsFromStorage = useCallback(async () => {
    try {
      const storedFirs = await AsyncStorage.getItem('user_firs');
      if (storedFirs) {
        const parsedFirs = JSON.parse(storedFirs);
        setFirs(parsedFirs);
      }
    } catch (err) {
      console.error('Error loading FIRs from storage:', err);
    }
  }, []);

  // Save FIRs to AsyncStorage
  const saveFirsToStorage = useCallback(async (updatedFirs) => {
    try {
      await AsyncStorage.setItem('user_firs', JSON.stringify(updatedFirs));
    } catch (err) {
      console.error('Error saving FIRs to storage:', err);
    }
  }, []);

  // Initialize with demo data if empty
  const initializeDemoData = useCallback(async () => {
    try {
      const storedFirs = await AsyncStorage.getItem('user_firs');
      if (!storedFirs) {
        const demoFirs = await MockApi.getUserFirs();
        if (demoFirs.success && demoFirs.data.length > 0) {
          await AsyncStorage.setItem('user_firs', JSON.stringify(demoFirs.data));
          setFirs(demoFirs.data);
        }
      }
    } catch (err) {
      console.error('Error initializing demo data:', err);
    }
  }, []);

  const fetchFirs = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      if (forceRefresh) {
        const response = await MockApi.getUserFirs();
        
        if (response.success) {
          setFirs(response.data);
          await saveFirsToStorage(response.data);
          return response.data;
        } else {
          throw new Error(response.message || 'Failed to fetch FIRs');
        }
      } else {
        // Load from storage first, then refresh from API
        await loadFirsFromStorage();
        const response = await MockApi.getUserFirs();
        
        if (response.success) {
          if (response.data.length > firs.length) {
            setFirs(response.data);
            await saveFirsToStorage(response.data);
          }
          return response.data;
        }
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch FIRs';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      console.error('Error fetching FIRs:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [firs, loadFirsFromStorage, saveFirsToStorage]);

  const submitFir = useCallback(async (firData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate FIR data
      const validationError = validateFirData(firData);
      if (validationError) {
        throw new Error(validationError);
      }
      
      const response = await MockApi.submitFir(firData);
      
      if (response.success) {
        const newFir = response.data;
        const updatedFirs = [newFir, ...firs];
        
        setFirs(updatedFirs);
        await saveFirsToStorage(updatedFirs);
        
        // Add notification
        showSuccessAlert('FIR Submitted', `Your FIR has been submitted successfully. Tracking Number: ${newFir.trackingNumber}`);
        
        return { 
          success: true, 
          data: newFir,
          message: 'FIR submitted successfully'
        };
      } else {
        throw new Error(response.message || 'Failed to submit FIR');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to submit FIR';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      
      return { 
        success: false, 
        error: errorMessage,
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, [firs, saveFirsToStorage]);

  const getFirById = useCallback(async (id, forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if we already have the FIR locally
      if (!forceRefresh && firs.length > 0) {
        const localFir = firs.find(fir => fir.id === id);
        if (localFir) {
          setSelectedFir(localFir);
          return { success: true, data: localFir };
        }
      }
      
      // Fetch from API
      const response = await MockApi.getFirById(id);
      
      if (response.success) {
        setSelectedFir(response.data);
        return response;
      } else {
        throw new Error(response.message || 'Failed to fetch FIR details');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch FIR details';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      
      return { 
        success: false, 
        error: errorMessage,
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, [firs]);

  const updateFirStatus = useCallback(async (id, status, reason = '') => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate status
      if (!Object.values(FIR_STATUS).includes(status)) {
        throw new Error('Invalid status value');
      }
      
      const response = await MockApi.updateFir(id, { status });
      
      if (response.success) {
        const updatedFirs = firs.map(fir => 
          fir.id === id 
            ? { 
                ...fir, 
                status, 
                updatedAt: new Date().toISOString(),
                statusReason: reason
              } 
            : fir
        );
        
        setFirs(updatedFirs);
        await saveFirsToStorage(updatedFirs);
        
        Alert.alert('Success', `FIR status updated to ${status}`);
        
        return { 
          success: true, 
          data: response.data,
          message: 'FIR status updated successfully'
        };
      } else {
        throw new Error(response.message || 'Failed to update FIR');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to update FIR';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      
      return { 
        success: false, 
        error: errorMessage,
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, [firs, saveFirsToStorage]);

  const deleteFir = useCallback(async (id) => {
    return new Promise((resolve) => {
      Alert.alert(
        'Delete FIR',
        'Are you sure you want to delete this FIR? This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => resolve({ success: false, cancelled: true }) },
          { 
            text: 'Delete', 
            style: 'destructive',
            onPress: async () => {
              try {
                setLoading(true);
                const updatedFirs = firs.filter(fir => fir.id !== id);
                
                setFirs(updatedFirs);
                await saveFirsToStorage(updatedFirs);
                
                Alert.alert('Success', 'FIR deleted successfully');
                resolve({ success: true, message: 'FIR deleted successfully' });
              } catch (err) {
                const errorMessage = 'Failed to delete FIR';
                setError(errorMessage);
                Alert.alert('Error', errorMessage);
                resolve({ success: false, error: errorMessage });
              } finally {
                setLoading(false);
              }
            }
          }
        ]
      );
    });
  }, [firs, saveFirsToStorage]);

  const searchFirs = useCallback((query, filters = {}) => {
    const searchTerm = query?.toLowerCase() || '';
    
    let results = firs;
    
    // Apply search term
    if (searchTerm) {
      results = results.filter(fir => 
        fir.title.toLowerCase().includes(searchTerm) ||
        fir.description.toLowerCase().includes(searchTerm) ||
        fir.id.toLowerCase().includes(searchTerm) ||
        fir.trackingNumber?.toLowerCase().includes(searchTerm) ||
        fir.firNumber?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply filters
    if (filters.status) {
      results = results.filter(fir => fir.status === filters.status);
    }
    
    if (filters.priority) {
      results = results.filter(fir => fir.priority === filters.priority);
    }
    
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      results = results.filter(fir => new Date(fir.createdAt) >= fromDate);
    }
    
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      results = results.filter(fir => new Date(fir.createdAt) <= toDate);
    }
    
    // Sort by date (newest first)
    results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return results;
  }, [firs]);

  const getFirsByStatus = useCallback((status) => {
    return firs.filter(fir => fir.status === status);
  }, [firs]);

  const getStats = useCallback(() => {
    const total = firs.length;
    const pending = firs.filter(f => f.status === FIR_STATUS.PENDING).length;
    const underReview = firs.filter(f => f.status === FIR_STATUS.UNDER_REVIEW).length;
    const investigation = firs.filter(f => f.status === FIR_STATUS.INVESTIGATION_STARTED).length;
    const resolved = firs.filter(f => f.status === FIR_STATUS.RESOLVED || f.status === FIR_STATUS.CLOSED).length;
    
    return {
      total,
      pending,
      underReview,
      investigation,
      resolved
    };
  }, [firs]);

  // Helper functions
  const validateFirData = (firData) => {
    const requiredFields = ['title', 'description', 'location', 'incidentType'];
    const missingFields = requiredFields.filter(field => !firData[field]);
    
    if (missingFields.length > 0) {
      return `Missing required fields: ${missingFields.join(', ')}`;
    }
    
    if (firData.title.length < 10) {
      return 'Title should be at least 10 characters';
    }
    
    if (firData.description.length < 30) {
      return 'Description should be at least 30 characters';
    }
    
    return null;
  };

  const showSuccessAlert = (title, message) => {
    Alert.alert(title, message, [{ text: 'OK' }]);
  };

  // Load initial data
  useEffect(() => {
    const initializeData = async () => {
      await loadFirsFromStorage();
      if (firs.length === 0) {
        await initializeDemoData();
      }
    };
    
    initializeData();
  }, [loadFirsFromStorage, initializeDemoData]);

  return {
    // State
    firs,
    loading,
    error,
    selectedFir,
    
    // Actions
    fetchFirs,
    submitFir,
    getFirById,
    updateFirStatus,
    deleteFir,
    searchFirs,
    getFirsByStatus,
    getStats,
    
    // Convenience methods
    refreshFirs: () => fetchFirs(true),
    clearError: () => setError(null),
    setSelectedFir,
    
    // Derived data
    totalFirs: firs.length,
    pendingFirs: getFirsByStatus(FIR_STATUS.PENDING).length,
    resolvedFirs: getFirsByStatus(FIR_STATUS.RESOLVED).length + getFirsByStatus(FIR_STATUS.CLOSED).length,
    stats: getStats(),
    
    // Status helpers
    FIR_STATUS,
    getStatusColor: (status) => {
      const statusColors = {
        [FIR_STATUS.DRAFT]: 'gray',
        [FIR_STATUS.PENDING]: 'yellow',
        [FIR_STATUS.UNDER_REVIEW]: 'blue',
        [FIR_STATUS.APPROVED]: 'green',
        [FIR_STATUS.REJECTED]: 'red',
        [FIR_STATUS.INVESTIGATION_STARTED]: 'purple',
        [FIR_STATUS.RESOLVED]: 'green',
        [FIR_STATUS.CLOSED]: 'gray'
      };
      return statusColors[status] || 'gray';
    },
    
    // Formatters
    formatDate: (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },
    
    formatDateTime: (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };
};

// Export for use in other components
export default useFir;

// Additional helper hook for FIR filtering
export const useFilteredFirs = (filters = {}) => {
  const { firs, searchFirs } = useFir();
  
  const filteredFirs = useCallback(() => {
    return searchFirs(filters.search || '', filters);
  }, [firs, filters, searchFirs]);
  
  return {
    filteredFirs: filteredFirs(),
    total: filteredFirs().length,
    isEmpty: filteredFirs().length === 0
  };
};