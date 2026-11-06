// src/screens/auth/RegisterScreen.js - FIXED KEYBOARD ISSUE
import React, { useState } from 'react';
import { 
  View, Text, Alert, Keyboard, TouchableOpacity, Dimensions,
  ScrollView, TextInput, StyleSheet, Platform, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  User, Phone, Shield, ArrowRight, Lock, Eye, EyeOff, MapPin
} from 'lucide-react-native';
import { API_CONFIG } from '../../utils/constants';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 375;

const colors = {
  primary: '#3B82F6', primaryLight: '#60A5FA', primaryDark: '#1D4ED8',
  secondary: '#10B981', background: '#FFFFFF', surface: '#F9FAFB',
  textPrimary: '#111827', textSecondary: '#6B7280', border: '#E5E7EB',
  danger: '#EF4444',
};

// Component outside main screen to prevent keyboard closing issue
const InputField = ({ label, value, onChangeText, placeholder, icon: Icon, secure = false, keyboardType = 'default', showToggle = false, isConfirm = false, showPassword, setShowPassword, showConfirmPassword, setShowConfirmPassword, activeField, setActiveField }) => (
  <View style={styles.inputContainer}>
    <View style={styles.inputLabel}>
      <Icon size={isSmallScreen ? 14 : 16} color={colors.primary} />
      <Text style={[styles.labelText, isSmallScreen && styles.labelTextSmall]}>{label}</Text>
    </View>
    <View style={[styles.inputWrapper, activeField === label && styles.inputFocused]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        secureTextEntry={secure && !(isConfirm ? showConfirmPassword : showPassword)}
        keyboardType={keyboardType}
        onFocus={() => setActiveField(label)}
        onBlur={() => setActiveField(null)}
        style={[styles.textInput, isSmallScreen && styles.textInputSmall]}
      />
      {showToggle && (
        <TouchableOpacity onPress={() => isConfirm ? setShowConfirmPassword(!showConfirmPassword) : setShowPassword(!showPassword)} style={styles.eyeIcon}>
          {(isConfirm ? showConfirmPassword : showPassword) ? <EyeOff size={18} color="#64748b" /> : <Eye size={18} color="#64748b" />}
        </TouchableOpacity>
      )}
    </View>
  </View>
);

export function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [cnic, setCnic] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [address, setAddress] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeField, setActiveField] = useState(null);

  const handleRegister = async () => {
    Keyboard.dismiss();

    if (!name || !cnic || !phone || !password || !address) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Password and Confirm Password do not match.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          name,
          fatherName,
          cnic,
          phone,
          password,
          address,
          role: 'citizen'
        }),
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (data.success) {
        Alert.alert('Account Created!', 'Your account has been registered successfully.', [
          {
            text: 'Login Now',
            onPress: () => {
              if (navigation && navigation.navigate) {
                navigation.navigate('Login');
              }
            }
          }
        ]);
      } else {
        Alert.alert('Registration Failed', data.message || 'Could not register user.');
      }
    } catch (err) {
      clearTimeout(timeoutId);
      console.log('Register error:', err);
      if (err.name === 'AbortError') {
        Alert.alert('Connection Timeout', 'Server took too long to respond.');
      } else {
        Alert.alert('Connection Error', `Cannot connect to server at ${API_CONFIG.BASE_URL}`);
      }
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
            <Shield size={28} color={colors.primary} />
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Register to file FIR and track your case</Text>
        </View>

        <View style={styles.formCard}>
          <InputField label="Full Name" value={name} onChangeText={setName} placeholder="Muhammad Ahmed" icon={User} activeField={activeField} setActiveField={setActiveField} />
          <InputField label="Father's Name" value={fatherName} onChangeText={setFatherName} placeholder="Muhammad Ali" icon={User} activeField={activeField} setActiveField={setActiveField} />
          <InputField label="CNIC" value={cnic} onChangeText={setCnic} placeholder="XXXXX-XXXXXXX-X" icon={Shield} keyboardType="numbers-and-punctuation" activeField={activeField} setActiveField={setActiveField} />
          <InputField label="Phone Number" value={phone} onChangeText={setPhone} placeholder="03XX-XXXXXXX" icon={Phone} keyboardType="phone-pad" activeField={activeField} setActiveField={setActiveField} />
          <InputField label="Password" value={password} onChangeText={setPassword} placeholder="Min 6 characters" icon={Lock} secure={true} showToggle={true} showPassword={showPassword} setShowPassword={setShowPassword} activeField={activeField} setActiveField={setActiveField} />
          <InputField label="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Min 6 characters" icon={Lock} secure={true} showToggle={true} isConfirm={true} showConfirmPassword={showConfirmPassword} setShowConfirmPassword={setShowConfirmPassword} activeField={activeField} setActiveField={setActiveField} />
          <InputField label="Address" value={address} onChangeText={setAddress} placeholder="Street, City" icon={MapPin} activeField={activeField} setActiveField={setActiveField} />

          <TouchableOpacity onPress={handleRegister} disabled={loading} activeOpacity={0.9} style={[styles.submitButton, loading && styles.submitButtonDisabled]}>
            <Text style={styles.submitButtonText}>{loading ? 'Creating...' : 'Create Account'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation && navigation.navigate ? navigation.navigate('Login') : null} style={styles.loginLinkContainer}>
            <Text style={styles.loginLinkText}>Already have an account? <Text style={styles.loginLinkBold}>Login</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 20 },
  logoIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.textPrimary },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  formCard: { backgroundColor: colors.background },
  inputContainer: { marginBottom: 14 },
  inputLabel: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  labelText: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, marginLeft: 6 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 10, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 12 },
  inputFocused: { borderColor: colors.primary, backgroundColor: colors.background },
  textInput: { flex: 1, fontSize: 15, color: colors.textPrimary },
  eyeIcon: { marginLeft: 8 },
  submitButton: { marginTop: 10, backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', elevation: 2 },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  loginLinkContainer: { marginTop: 16, alignItems: 'center' },
  loginLinkText: { fontSize: 14, color: colors.textSecondary },
  loginLinkBold: { color: colors.primary, fontWeight: '600' },
}); 