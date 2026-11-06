// src/hooks/useAuth.js - ENHANCED VERSION
import { useContext, useCallback } from 'react';
import { Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const { 
    user, 
    loading, 
    error, 
    login, 
    logout, 
    register,
    updateProfile, 
    changePassword,
    clearError,
    demoLogin,
    isAuthenticated,
    userRole,
    hasPermission 
  } = context;

  // Enhanced login with validation
  const enhancedLogin = useCallback(async (cnic, phone) => {
    if (!cnic || !phone) {
      Alert.alert('Error', 'Please enter both CNIC and Phone number');
      return null;
    }

    try {
      const result = await login(cnic, phone);
      Alert.alert('Success', 'Logged in successfully!');
      return result;
    } catch (err) {
      // Error is already handled in AuthContext
      return null;
    }
  }, [login]);

  // Enhanced logout with confirmation
  const enhancedLogout = useCallback(() => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: logout
        }
      ]
    );
  }, [logout]);

  // Check if user has specific role
  const hasRole = useCallback((role) => {
    return userRole === role;
  }, [userRole]);

  // Get user's display name
  const getDisplayName = useCallback(() => {
    if (!user) return '';
    
    // Try to get name in order of preference
    return user.name || 
           user.email?.split('@')[0] || 
           `User-${user.id?.slice(-4)}` ||
           'User';
  }, [user]);

  // Get user initials for avatar
  const getUserInitials = useCallback(() => {
    if (!user) return 'U';
    
    if (user.name) {
      const names = user.name.split(' ');
      if (names.length >= 2) {
        return (names[0][0] + names[1][0]).toUpperCase();
      }
      return names[0][0].toUpperCase();
    }
    
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    
    return 'U';
  }, [user]);

  // Quick demo login
  const quickDemoLogin = useCallback(async () => {
    const demoCredentials = {
      cnic: '37405-1234567-1',
      phone: '0300-1234567'
    };
    
    try {
      const result = await demoLogin();
      Alert.alert('Demo Login', 'Logged in with demo credentials');
      return result;
    } catch (err) {
      return null;
    }
  }, [demoLogin]);

  // Get user profile data safely
  const getProfileData = useCallback(() => {
    if (!user) return {};
    
    return {
      name: user.name || 'Not set',
      email: user.email || 'Not set',
      phone: user.phone || 'Not set',
      cnic: user.cnic || 'Not set',
      address: user.address || 'Not set',
      dob: user.dob || 'Not set',
      gender: user.gender || 'Not set',
      emergencyContact: user.emergencyContact || 'Not set',
      occupation: user.occupation || 'Not set'
    };
  }, [user]);

  // Check if profile is complete
  const isProfileComplete = useCallback(() => {
    if (!user) return false;
    
    const requiredFields = ['name', 'phone', 'cnic'];
    return requiredFields.every(field => user[field]);
  }, [user]);

  // Format phone number
  const formatPhoneNumber = useCallback((phone) => {
    if (!phone) return '';
    return phone.replace(/(\d{4})(\d{3})(\d{4})/, '$1-$2-$3');
  }, []);

  // Get masked CNIC for display
  const getMaskedCnic = useCallback(() => {
    if (!user?.cnic) return '';
    const parts = user.cnic.split('-');
    if (parts.length === 3) {
      return `${parts[0]}-${'*'.repeat(7)}-${parts[2]}`;
    }
    return user.cnic;
  }, [user]);

  return {
    // Original context values
    user,
    loading,
    error,
    login: enhancedLogin,
    logout: enhancedLogout,
    register,
    updateProfile,
    changePassword,
    clearError,
    demoLogin,
    isAuthenticated,
    userRole,
    hasPermission,
    
    // Enhanced values
    enhancedLogin,
    enhancedLogout,
    hasRole,
    getDisplayName,
    getUserInitials,
    quickDemoLogin,
    getProfileData,
    isProfileComplete,
    formatPhoneNumber,
    getMaskedCnic,
    
    // Convenience getters
    userName: getDisplayName(),
    userInitials: getUserInitials(),
    isCitizen: hasRole('citizen'),
    isPolice: hasRole('police'),
    isAdmin: hasRole('admin'),
    profileComplete: isProfileComplete(),
    maskedCnic: getMaskedCnic()
  };
}

// Helper hook for specific use cases

// Hook for checking if user can perform an action
export function useAuthPermission(requiredPermission) {
  const { hasPermission, isAuthenticated } = useAuth();
  
  return {
    canAccess: isAuthenticated && hasPermission(requiredPermission),
    isAuthenticated
  };
}

// Hook for checking if user has a specific role
export function useAuthRole(requiredRole) {
  const { userRole, isAuthenticated } = useAuth();
  
  return {
    hasRole: userRole === requiredRole,
    isAuthenticated
  };
}

// Hook for profile-related operations
export function useProfile() {
  const { 
    user, 
    updateProfile, 
    getProfileData, 
    isProfileComplete,
    formatPhoneNumber,
    getMaskedCnic 
  } = useAuth();
  
  const updateProfileField = useCallback(async (field, value) => {
    return updateProfile({ [field]: value });
  }, [updateProfile]);
  
  return {
    profile: user,
    profileData: getProfileData(),
    isComplete: isProfileComplete(),
    updateProfile,
    updateProfileField,
    formatPhoneNumber,
    maskedCnic: getMaskedCnic()
  };
}

// Hook for quick auth checks
export function useAuthStatus() {
  const { isAuthenticated, loading } = useAuth();
  
  return {
    isLoggedIn: isAuthenticated,
    isLoading: loading,
    isReady: !loading
  };
}