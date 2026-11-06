import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { Phone, Lock, Eye, EyeOff, ArrowLeft, Shield } from 'lucide-react-native';

const colors = {
  primary: '#2563EB',
  background: '#FFFFFF',
  surface: '#F9FAFB',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  error: '#EF4444',
  success: '#10B981',
};

// Step 1: Enter phone → Step 2: Enter new password (after OTP)
export function ForgotPasswordScreen({ route, navigation }) {
  const { otpVerified, phone: verifiedPhone } = route.params || {};

  const [step, setStep] = useState(otpVerified ? 2 : 1);
  const [phone, setPhone] = useState(verifiedPhone || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleSendOTP = async () => {
    if (!phone.trim()) {
      setPhoneError('Phone number is required');
      return;
    }
    if (!/^03\d{2}-?\d{7}$/.test(phone)) {
      setPhoneError('Format: 03XX-XXXXXXX');
      return;
    }
    setPhoneError('');
    setLoading(true);

    try {
      // TODO: Call backend send OTP API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Navigate to OTP screen
      navigation.navigate('VerifyOTP', {
        phone,
        fromForgotPassword: true,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    setPasswordError('');
    setLoading(true);

    try {
      // TODO: Call backend reset password API
      await new Promise((resolve) => setTimeout(resolve, 1500));

      Alert.alert(
        'Password Reset Successful',
        'Your password has been updated. Please login with your new password.',
        [{ text: 'Login', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Back */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <ArrowLeft size={24} color={colors.textPrimary} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Shield size={48} color={colors.primary} />
        </View>

        <Text style={styles.title}>
          {step === 1 ? 'Forgot Password?' : 'Reset Password'}
        </Text>
        <Text style={styles.subtitle}>
          {step === 1
            ? 'Enter your registered phone number to receive an OTP'
            : 'Create your new password below'}
        </Text>

        {/* Step 1: Phone Input */}
        {step === 1 && (
          <View style={styles.formSection}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={[styles.inputWrapper, phoneError && styles.inputError]}>
              <Phone size={18} color={colors.textSecondary} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="03XX-XXXXXXX"
                placeholderTextColor={colors.textSecondary}
                value={phone}
                onChangeText={(v) => {
                  setPhone(v);
                  setPhoneError('');
                }}
                keyboardType="phone-pad"
                autoCapitalize="none"
              />
            </View>
            {phoneError ? (
              <Text style={styles.errorText}>{phoneError}</Text>
            ) : null}

            <TouchableOpacity
              style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
              onPress={handleSendOTP}
              disabled={loading}
            >
              <Text style={styles.primaryBtnText}>
                {loading ? 'Sending...' : 'Send OTP'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 2: New Password */}
        {step === 2 && (
          <View style={styles.formSection}>
            <Text style={styles.label}>New Password</Text>
            <View style={styles.inputWrapper}>
              <Lock size={18} color={colors.textSecondary} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Min 6 characters"
                placeholderTextColor={colors.textSecondary}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff size={18} color={colors.textSecondary} />
                ) : (
                  <Eye size={18} color={colors.textSecondary} />
                )}
              </TouchableOpacity>
            </View>

            <Text style={[styles.label, { marginTop: 16 }]}>Confirm Password</Text>
            <View
              style={[
                styles.inputWrapper,
                passwordError && styles.inputError,
              ]}
            >
              <Lock size={18} color={colors.textSecondary} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Re-enter password"
                placeholderTextColor={colors.textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
              />
            </View>
            {passwordError ? (
              <Text style={styles.errorText}>{passwordError}</Text>
            ) : null}

            <TouchableOpacity
              style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
              onPress={handleResetPassword}
              disabled={loading}
            >
              <Text style={styles.primaryBtnText}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Back to login */}
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.backToLogin}>Back to Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  backBtn: { padding: 16 },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 36,
    paddingHorizontal: 16,
  },
  formSection: { width: '100%' },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.surface,
    marginBottom: 4,
  },
  inputError: { borderColor: colors.error },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: colors.textPrimary },
  errorText: { fontSize: 12, color: colors.error, marginBottom: 8 },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    elevation: 3,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  primaryBtnDisabled: { backgroundColor: '#93C5FD' },
  primaryBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },
  backToLogin: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 24,
    textDecorationLine: 'underline',
  },
});