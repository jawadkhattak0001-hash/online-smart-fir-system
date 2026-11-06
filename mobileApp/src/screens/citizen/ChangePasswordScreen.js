// src/screens/citizen/ChangePasswordScreen.js
// SmartFIR - Change Password Screen
// Connected to Backend API | Form Validation | Animations

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Dimensions,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  Animated,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  Shield,
  ChevronLeft,
  Key,
  Check,
  X,
  Info,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── API Configuration ────────────────────────────────────
// ✅ Backend Ready: Connected to http://YOUR_IP:5001/api/auth/change-password
const BASE_URL = 'http://http://localhost:5000/api/api'; // ← Update with your IP

const changePasswordAPI = async (currentPassword, newPassword) => {
  const token = await AsyncStorage.getItem('@smartfir_token');
  
  if (!token) {
    throw new Error('You are not logged in. Please login first.');
  }

  const response = await fetch(`${BASE_URL}/auth/change-password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to change password');
  }

  return data;
};

// ─── Constants ────────────────────────────────────────────
const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 375;

const COLORS = {
  primary: '#636d79',
  primaryLight: '#7b8590',
  primaryDark: '#4b545e',
  background: '#FFFFFF',
  surface: '#F8F9FA',
  surfaceDark: '#E9ECEF',
  textPrimary: '#212529',
  textSecondary: '#636d79',
  textLight: '#ADB5BD',
  border: '#DEE2E6',
  success: '#2F9E44',
  successLight: '#D3F9D8',
  error: '#E03131',
  errorLight: '#FFE3E3',
  warning: '#E8590C',
  warningLight: '#FFE8CC',
};

// ─── Password Requirements ────────────────────────────────
const PASSWORD_REQUIREMENTS = [
  { id: 'length', label: 'At least 8 characters', test: (pass) => pass.length >= 8 },
  { id: 'uppercase', label: 'One uppercase letter', test: (pass) => /[A-Z]/.test(pass) },
  { id: 'lowercase', label: 'One lowercase letter', test: (pass) => /[a-z]/.test(pass) },
  { id: 'number', label: 'One number', test: (pass) => /[0-9]/.test(pass) },
  { id: 'special', label: 'One special character (!@#$%)', test: (pass) => /[!@#$%^&*]/.test(pass) },
];

// ─── Component ────────────────────────────────────────────
export function ChangePasswordScreen({ navigation }) {
  // State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const successAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const strengthBarAnim = useRef(new Animated.Value(0)).current;

  // Refs
  const currentPasswordRef = useRef(null);
  const newPasswordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  // ─── Lifecycle ─────────────────────────────────────────
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // ─── Calculate Password Strength ──────────────────────
  useEffect(() => {
    if (!newPassword) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    if (newPassword.length >= 8) strength += 20;
    if (newPassword.length >= 12) strength += 10;
    if (/[A-Z]/.test(newPassword)) strength += 20;
    if (/[a-z]/.test(newPassword)) strength += 15;
    if (/[0-9]/.test(newPassword)) strength += 20;
    if (/[!@#$%^&*]/.test(newPassword)) strength += 15;

    setPasswordStrength(Math.min(100, strength));

    Animated.timing(strengthBarAnim, {
      toValue: Math.min(100, strength),
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [newPassword]);

  // ─── Get Strength Color ──────────────────────────────
  const getStrengthColor = () => {
    if (passwordStrength >= 80) return COLORS.success;
    if (passwordStrength >= 50) return COLORS.warning;
    return COLORS.error;
  };

  const getStrengthLabel = () => {
    if (passwordStrength >= 80) return 'Strong';
    if (passwordStrength >= 50) return 'Medium';
    if (passwordStrength > 0) return 'Weak';
    return '';
  };

  // ─── Shake Animation for Errors ─────────────────────
  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  // ─── Validation ──────────────────────────────────────
  const validate = () => {
    const newErrors = {};

    if (!currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    } else if (newPassword === currentPassword) {
      newErrors.newPassword = 'New password must be different from current';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      triggerShake();
      return false;
    }

    return true;
  };

  // ─── Handle Submit ──────────────────────────────────
  const handleChangePassword = async () => {
    Keyboard.dismiss();

    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const data = await changePasswordAPI(currentPassword, newPassword);

      // Success animation
      setSuccess(true);
      Animated.spring(successAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }).start();

      Alert.alert(
        'Success',
        data.message || 'Your password has been changed successfully.',
        [
          {
            text: 'OK',
            onPress: () => {
              setCurrentPassword('');
              setNewPassword('');
              setConfirmPassword('');
              setSuccess(false);
              successAnim.setValue(0);
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      triggerShake();
      Alert.alert(
        'Error',
        error.message || 'Failed to change password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ─── Clear Error on Change ──────────────────────────
  const clearError = (field) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // ─── Success Overlay ────────────────────────────────
  if (success) {
    return (
      <SafeAreaView style={styles.container}>
        <Animated.View
          style={[
            styles.successContainer,
            {
              opacity: successAnim,
              transform: [{ scale: successAnim }],
            },
          ]}
        >
          <View style={styles.successIconContainer}>
            <CheckCircle size={80} color={COLORS.success} />
          </View>
          <Text style={styles.successTitle}>Password Changed!</Text>
          <Text style={styles.successSubtitle}>
            Your password has been updated successfully.
          </Text>
          <TouchableOpacity
            style={styles.backToProfileButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backToProfileText}>Back to Profile</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    );
  }

  // ─── Main Render ─────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />


      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={{
              transform: [{ translateX: shakeAnim }],
            }}
          >
            {/* ── Security Info Card ────────────────── */}
            <View style={styles.infoCard}>
              <View style={styles.infoIconContainer}>
                <Info size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.infoText}>
                Choose a strong password that you haven't used before. Your password must be at least 6 characters long.
              </Text>
            </View>

            {/* ── Current Password ──────────────────── */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Current Password</Text>
              <View
                style={[
                  styles.inputWrapper,
                  errors.currentPassword && styles.inputWrapperError,
                ]}
              >
                <Lock size={18} color={COLORS.textLight} style={styles.inputIcon} />
                <TextInput
                  ref={currentPasswordRef}
                  style={styles.input}
                  placeholder="Enter current password"
                  placeholderTextColor={COLORS.textLight}
                  secureTextEntry={!showCurrentPassword}
                  value={currentPassword}
                  onChangeText={(text) => {
                    setCurrentPassword(text);
                    clearError('currentPassword');
                  }}
                  returnKeyType="next"
                  onSubmitEditing={() => newPasswordRef.current?.focus()}
                />
                <TouchableOpacity
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={styles.eyeButton}
                >
                  {showCurrentPassword ? (
                    <EyeOff size={18} color={COLORS.textLight} />
                  ) : (
                    <Eye size={18} color={COLORS.textLight} />
                  )}
                </TouchableOpacity>
              </View>
              {errors.currentPassword && (
                <Text style={styles.errorText}>{errors.currentPassword}</Text>
              )}
            </View>

            {/* ── New Password ──────────────────────── */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>New Password</Text>
              <View
                style={[
                  styles.inputWrapper,
                  errors.newPassword && styles.inputWrapperError,
                ]}
              >
                <Key size={18} color={COLORS.textLight} style={styles.inputIcon} />
                <TextInput
                  ref={newPasswordRef}
                  style={styles.input}
                  placeholder="Enter new password"
                  placeholderTextColor={COLORS.textLight}
                  secureTextEntry={!showNewPassword}
                  value={newPassword}
                  onChangeText={(text) => {
                    setNewPassword(text);
                    clearError('newPassword');
                  }}
                  returnKeyType="next"
                  onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                />
                <TouchableOpacity
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  style={styles.eyeButton}
                >
                  {showNewPassword ? (
                    <EyeOff size={18} color={COLORS.textLight} />
                  ) : (
                    <Eye size={18} color={COLORS.textLight} />
                  )}
                </TouchableOpacity>
              </View>
              {errors.newPassword && (
                <Text style={styles.errorText}>{errors.newPassword}</Text>
              )}

              {/* ── Password Strength Bar ──────────── */}
              {newPassword.length > 0 && (
                <View style={styles.strengthContainer}>
                  <View style={styles.strengthHeader}>
                    <Text style={styles.strengthLabel}>Password Strength:</Text>
                    <Text style={[styles.strengthValue, { color: getStrengthColor() }]}>
                      {getStrengthLabel()}
                    </Text>
                  </View>
                  <View style={styles.strengthBar}>
                    <Animated.View
                      style={[
                        styles.strengthFill,
                        {
                          width: strengthBarAnim.interpolate({
                            inputRange: [0, 100],
                            outputRange: ['0%', '100%'],
                          }),
                          backgroundColor: getStrengthColor(),
                        },
                      ]}
                    />
                  </View>
                </View>
              )}
            </View>

            {/* ── Confirm Password ──────────────────── */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm New Password</Text>
              <View
                style={[
                  styles.inputWrapper,
                  errors.confirmPassword && styles.inputWrapperError,
                ]}
              >
                <Key size={18} color={COLORS.textLight} style={styles.inputIcon} />
                <TextInput
                  ref={confirmPasswordRef}
                  style={styles.input}
                  placeholder="Re-enter new password"
                  placeholderTextColor={COLORS.textLight}
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    clearError('confirmPassword');
                  }}
                  returnKeyType="done"
                  onSubmitEditing={handleChangePassword}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeButton}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} color={COLORS.textLight} />
                  ) : (
                    <Eye size={18} color={COLORS.textLight} />
                  )}
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}

              {/* ── Match Indicator ────────────────── */}
              {confirmPassword.length > 0 && (
                <View style={styles.matchContainer}>
                  {newPassword === confirmPassword ? (
                    <View style={styles.matchRow}>
                      <Check size={14} color={COLORS.success} />
                      <Text style={[styles.matchText, { color: COLORS.success }]}>
                        Passwords match
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.matchRow}>
                      <X size={14} color={COLORS.error} />
                      <Text style={[styles.matchText, { color: COLORS.error }]}>
                        Passwords do not match
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* ── Password Requirements ─────────────── */}
            {newPassword.length > 0 && (
              <View style={styles.requirementsCard}>
                <Text style={styles.requirementsTitle}>Password Requirements</Text>
                {PASSWORD_REQUIREMENTS.map((req) => {
                  const isMet = req.test(newPassword);
                  return (
                    <View key={req.id} style={styles.requirementRow}>
                      {isMet ? (
                        <Check size={14} color={COLORS.success} />
                      ) : (
                        <View style={styles.requirementDot} />
                      )}
                      <Text
                        style={[
                          styles.requirementText,
                          isMet && styles.requirementMet,
                        ]}
                      >
                        {req.label}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}

            {/* ── Submit Button ─────────────────────── */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                (loading || !currentPassword || !newPassword || !confirmPassword) &&
                  styles.submitButtonDisabled,
              ]}
              onPress={handleChangePassword}
              disabled={loading || !currentPassword || !newPassword || !confirmPassword}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Lock size={18} color="white" />
                  <Text style={styles.submitButtonText}>
                    Change Password
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* ── Security Note ─────────────────────── */}
            <View style={styles.securityNote}>
              <Shield size={14} color={COLORS.success} />
              <Text style={styles.securityNoteText}>
                Your password is encrypted and stored securely. Never share your password with anyone.
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // ── Header ──────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 8 : 20,
    paddingBottom: 16,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: isSmallScreen ? 18 : 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerSpacer: {
    width: 40,
  },

  // ── ScrollView ──────────────────────────────────────
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  // ── Info Card ───────────────────────────────────────
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
    gap: 12,
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },

  // ── Input Group ─────────────────────────────────────
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    height: 50,
  },
  inputWrapperError: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.errorLight,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  eyeButton: {
    padding: 6,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 6,
    marginLeft: 4,
  },

  // ── Password Strength ───────────────────────────────
  strengthContainer: {
    marginTop: 10,
  },
  strengthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  strengthLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  strengthValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  strengthBar: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },

  // ── Match Indicator ─────────────────────────────────
  matchContainer: {
    marginTop: 8,
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  matchText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // ── Requirements Card ───────────────────────────────
  requirementsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },
  requirementsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  requirementDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: COLORS.textLight,
  },
  requirementText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  requirementMet: {
    color: COLORS.success,
  },

  // ── Submit Button ───────────────────────────────────
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    gap: 10,
    marginBottom: 20,
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.textLight,
    elevation: 0,
    shadowOpacity: 0,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },

  // ── Security Note ───────────────────────────────────
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successLight,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: `${COLORS.success}30`,
    gap: 8,
  },
  securityNoteText: {
    flex: 1,
    fontSize: 11,
    color: COLORS.success,
    lineHeight: 16,
  },

  // ── Success Overlay ─────────────────────────────────
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  successIconContainer: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  backToProfileButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  backToProfileText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});