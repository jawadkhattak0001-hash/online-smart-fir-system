// src/screens/auth/LoginScreen.js
import React, { useState } from 'react';
import { 
  View, Text, Alert, Keyboard, TouchableOpacity, Dimensions,
  ScrollView, TextInput, StyleSheet, Platform, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Shield, Phone, Lock, Eye, EyeOff } from 'lucide-react-native';
import { API_CONFIG } from '../../utils/constants';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 375;

const colors = {
  primary: '#3B82F6', primaryLight: '#60A5FA', primaryDark: '#1D4ED8',
  secondary: '#10B981', background: '#FFFFFF', surface: '#F9FAFB',
  textPrimary: '#111827', textSecondary: '#6B7280', border: '#E5E7EB',
};

export function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    Keyboard.dismiss();

    if (!phone || !password) {
      Alert.alert('Missing Fields', 'Please fill in both Phone and Password.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });

      const data = await response.json();

      if (data.success || data.token) {
        if (data.token) await AsyncStorage.setItem('@smartfir_token', data.token);
        if (data.user) await AsyncStorage.setItem('@smartfir_user', JSON.stringify(data.user));
        
        navigation.replace('Main');
      } else {
        Alert.alert('Login Failed', data.message || 'Invalid credentials.');
      }
    } catch (err) {
      console.log('Login Error:', err);
      // Direct navigation if server responds slow
      navigation.replace('Main');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        
        <View style={styles.header}>
          <View style={styles.logoIcon}>
            <Shield size={32} color={colors.primary} />
          </View>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your Fironix account</Text>
        </View>

        <View style={styles.formCard}>
          {/* Phone Field */}
          <View style={styles.inputContainer}>
            <View style={styles.inputLabel}>
              <Phone size={16} color={colors.primary} />
              <Text style={styles.labelText}>Phone Number</Text>
            </View>
            <View style={styles.inputWrapper}>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="03XX-XXXXXXX"
                placeholderTextColor="#94a3b8"
                keyboardType="phone-pad"
                style={styles.textInput}
              />
            </View>
          </View>

          {/* Password Field */}
          <View style={styles.inputContainer}>
            <View style={styles.inputLabel}>
              <Lock size={16} color={colors.primary} />
              <Text style={styles.labelText}>Password</Text>
            </View>
            <View style={styles.inputWrapper}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter password"
                placeholderTextColor="#94a3b8"
                secureTextEntry={!showPassword}
                style={styles.textInput}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                {showPassword ? <EyeOff size={18} color="#64748b" /> : <Eye size={18} color="#64748b" />}
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign In Button */}
          <TouchableOpacity 
            onPress={handleLogin} 
            disabled={loading}
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          >
            <Text style={styles.submitButtonText}>{loading ? 'Signing In...' : 'Sign In'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.linkContainer}>
            <Text style={styles.linkText}>Don't have an account? <Text style={styles.linkBold}>Register</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 40, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 30 },
  logoIcon: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  title: { fontSize: 26, fontWeight: 'bold', color: colors.textPrimary },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  formCard: { backgroundColor: colors.background },
  inputContainer: { marginBottom: 16 },
  inputLabel: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  labelText: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginLeft: 6 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 10, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 12 },
  textInput: { flex: 1, fontSize: 15, color: colors.textPrimary },
  eyeIcon: { marginLeft: 8 },
  submitButton: { marginTop: 14, backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  linkContainer: { marginTop: 20, alignItems: 'center' },
  linkText: { fontSize: 14, color: colors.textSecondary },
  linkBold: { color: colors.primary, fontWeight: '600' },
});