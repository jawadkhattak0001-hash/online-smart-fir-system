import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Shield, ArrowLeft } from 'lucide-react-native';

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

export function OTPVerificationScreen({ route, navigation }) {
  const { phone, fromRegister, fromForgotPassword } = route.params || {};

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef([]);

  // Countdown timer
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, []);

  const handleOtpChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      // TODO: Call backend OTP verify API
      // For now simulate verification
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock: accept any 6-digit code
      if (fromForgotPassword) {
        navigation.navigate('ForgotPassword', {
          phone,
          otpVerified: true,
        });
      } else {
        // Registration flow — go to main app
        Alert.alert('Success', 'Account verified successfully!', [
          { text: 'OK', onPress: () => navigation.navigate('Main') },
        ]);
      }
    } catch (error) {
      Alert.alert('Invalid OTP', 'The OTP you entered is incorrect.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setTimer(60);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
    // TODO: Call resend OTP API
    Alert.alert('OTP Sent', `A new OTP has been sent to ${phone}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <ArrowLeft size={24} color={colors.textPrimary} />
      </TouchableOpacity>

      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Shield size={48} color={colors.primary} />
        </View>

        <Text style={styles.title}>Verify Your Number</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit OTP sent to{'\n'}
          <Text style={styles.phone}>{phone}</Text>
        </Text>

        {/* OTP Inputs */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[
                styles.otpInput,
                digit ? styles.otpInputFilled : null,
              ]}
              value={digit}
              onChangeText={(v) => handleOtpChange(v, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="numeric"
              maxLength={1}
              textAlign="center"
              autoFocus={index === 0}
            />
          ))}
        </View>

        {/* Timer */}
        <View style={styles.timerContainer}>
          {canResend ? (
            <TouchableOpacity onPress={handleResend}>
              <Text style={styles.resendText}>Resend OTP</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.timerText}>
              Resend OTP in{' '}
              <Text style={styles.timerCount}>
                00:{String(timer).padStart(2, '0')}
              </Text>
            </Text>
          )}
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          style={[
            styles.verifyBtn,
            (loading || otp.join('').length < 6) && styles.verifyBtnDisabled,
          ]}
          onPress={handleVerify}
          disabled={loading || otp.join('').length < 6}
          activeOpacity={0.8}
        >
          <Text style={styles.verifyBtnText}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </Text>
        </TouchableOpacity>

        {/* Change Number */}
        <TouchableOpacity
          style={styles.changeNumber}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.changeNumberText}>Change Phone Number</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  backBtn: { padding: 16 },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  phone: {
    color: colors.primary,
    fontWeight: '700',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 32,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  otpInputFilled: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}08`,
  },
  timerContainer: { marginBottom: 32 },
  timerText: { fontSize: 14, color: colors.textSecondary },
  timerCount: { color: colors.primary, fontWeight: '700' },
  resendText: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: '700',
  },
  verifyBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 48,
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
    elevation: 3,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  verifyBtnDisabled: { backgroundColor: '#93C5FD' },
  verifyBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  changeNumber: { paddingVertical: 8 },
  changeNumberText: {
    fontSize: 14,
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },
});