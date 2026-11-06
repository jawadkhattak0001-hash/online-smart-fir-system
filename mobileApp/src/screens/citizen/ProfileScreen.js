// src/screens/citizen/ProfileScreen.js – Fully Corrected
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, Alert, TextInput, Dimensions,
  StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, Platform,
  ActivityIndicator, RefreshControl, Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useAuth } from '../../hooks/useAuth';
import {
  User, Shield, Bell, Lock, HelpCircle, LogOut, Camera, Mail,
  Phone, MapPin, ChevronRight, Check, Edit, Info, FileText, Globe,
} from 'lucide-react-native';

const BASE_URL = 'http://http://localhost:5000/api/api';
const { width } = Dimensions.get('window');

const colors = {
  primary: '#636d79',
  primaryLight: '#7b8590',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  textPrimary: '#212529',
  textSecondary: '#636d79',
  textLight: '#ADB5BD',
  border: '#DEE2E6',
  success: '#2F9E44',
  warning: '#E8590C',
  error: '#E03131',
};

const apiFetch = async (endpoint, options = {}) => {
  const token = await AsyncStorage.getItem('@smartfir_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

export function ProfileScreen({ navigation }) {
  const { user: authUser, logout } = useAuth();

  const [profile, setProfile] = useState({
    name: '', phone: '', email: '', address: '',
    cnic: '', fatherName: '', role: '',
  });
  const [avatarUri, setAvatarUri] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [firStats, setFirStats] = useState({ total: 0, pending: 0, active: 0, resolved: 0 });

  const loadUserData = useCallback(async () => {
    try {
      const [profileRes, firsRes] = await Promise.all([
        apiFetch('/auth/me'),
        apiFetch('/firs/my-firs'),
      ]);
      if (profileRes.user) {
        const u = profileRes.user;
        setProfile({
          name: u.name || '',
          phone: u.phone || '',
          email: u.email || '',
          address: u.address || '',
          cnic: u.cnic || '',
          fatherName: u.fatherName || '',
          role: u.role || 'citizen',
        });
        const savedAvatar = await AsyncStorage.getItem('@profile_avatar');
        if (savedAvatar) setAvatarUri(savedAvatar);
      }
      if (firsRes.firs) {
        const firs = firsRes.firs;
        setFirStats({
          total: firs.length,
          pending: firs.filter(f => f.status === 'pending').length,
          active: firs.filter(f => ['approved', 'investigation_started'].includes(f.status)).length,
          resolved: firs.filter(f => ['resolved', 'closed'].includes(f.status)).length,
        });
      }
    } catch (err) {
      console.log('Load error:', err.message);
      if (authUser) {
        setProfile({
          name: authUser.name || '',
          phone: authUser.phone || '',
          cnic: authUser.cnic || '',
          role: authUser.role || '',
          email: '', address: '', fatherName: '',
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authUser]);

  useEffect(() => { loadUserData(); }, [loadUserData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadUserData();
  };

  // ─── Profile Picture ──────────────────────────────────
  const pickImage = async (source) => {
    const permission = source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert('Permission required', `Allow access to ${source} in Settings.`);
      return;
    }
    const method = source === 'camera'
      ? ImagePicker.launchCameraAsync
      : ImagePicker.launchImageLibraryAsync;
    const result = await method({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!result.canceled && result.assets[0]) {
      const optimized = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 400 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );
      setAvatarUri(optimized.uri);
      await AsyncStorage.setItem('@profile_avatar', optimized.uri);
      Alert.alert('Profile picture updated', 'Your new profile picture has been saved.');
    }
  };

  const removeAvatar = () => {
    Alert.alert('Remove photo', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
          setAvatarUri(null);
          await AsyncStorage.removeItem('@profile_avatar');
        }
      },
    ]);
  };

  const showImageOptions = () => {
    Alert.alert('Profile Picture', 'Choose source', [
      { text: 'Camera', onPress: () => pickImage('camera') },
      { text: 'Gallery', onPress: () => pickImage('gallery') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  // ─── Save Profile ──────────────────────────────────────
  const handleSaveProfile = async () => {
    if (!profile.name.trim()) {
      Alert.alert('Required', 'Name cannot be empty.');
      return;
    }
    setSaving(true);
    try {
      await apiFetch('/auth/update-profile', {
        method: 'PUT',
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          email: profile.email,
          address: profile.address,
        }),
      });
      Alert.alert('Success', 'Profile updated.');
      setEditMode(false);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  // ─── Logout ────────────────────────────────────────────
  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => {
          await logout();
          navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
        }
      },
    ]);
  };

  // ─── Navigation ────────────────────────────────────────
  const tabNav = navigation.getParent();
  const navigateTab = (tab, screen) => tabNav?.navigate(tab, { screen });
  const navigateStack = (screen) => navigation.navigate(screen);

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity onPress={() => setEditMode(!editMode)} style={styles.editBtn}>
          {editMode ? <Check size={18} color={colors.primary} /> : <Edit size={18} color={colors.primary} />}
          <Text style={styles.editBtnText}>{editMode ? 'Done' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      >
        <View style={styles.profileCard}>
          <TouchableOpacity onPress={avatarUri ? removeAvatar : showImageOptions} style={styles.avatarWrapper}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <User size={40} color={colors.textLight} />
              </View>
            )}
            <View style={styles.cameraIcon}>
              <Camera size={14} color="white" />
            </View>
          </TouchableOpacity>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile.name || 'Your Name'}</Text>
            <Text style={styles.profileCnic}>{profile.cnic || 'CNIC not set'}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <StatBox value={firStats.total} label="Total" color={colors.primary} />
          <StatBox value={firStats.pending} label="Pending" color={colors.warning} />
          <StatBox value={firStats.active} label="Active" color={colors.success} />
          <StatBox value={firStats.resolved} label="Resolved" color="#845EF7" />
        </View>

        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.infoCard}>
          {editMode ? (
            <>
              <Field editable label="Name" value={profile.name} onChangeText={(t) => setProfile(p => ({ ...p, name: t }))} icon={User} />
              <Field editable label="Phone" value={profile.phone} onChangeText={(t) => setProfile(p => ({ ...p, phone: t }))} icon={Phone} keyboardType="phone-pad" />
              <Field editable label="Email" value={profile.email} onChangeText={(t) => setProfile(p => ({ ...p, email: t }))} icon={Mail} keyboardType="email-address" />
              <Field editable label="Address" value={profile.address} onChangeText={(t) => setProfile(p => ({ ...p, address: t }))} icon={MapPin} multiline />
            </>
          ) : (
            <>
              <InfoRow icon={User} label="Full Name" value={profile.name} />
              <InfoRow icon={Phone} label="Phone" value={profile.phone} />
              <InfoRow icon={Mail} label="Email" value={profile.email || 'Not set'} />
              <InfoRow icon={MapPin} label="Address" value={profile.address || 'Not set'} />
              <InfoRow icon={Shield} label="CNIC" value={profile.cnic} />
            </>
          )}
          {editMode && (
            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile} disabled={saving}>
              {saving ? <ActivityIndicator color="white" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.sectionTitle}>Settings & Security</Text>
        <View style={styles.settingsList}>
          <SettingItem icon={Lock} label="Change Password" onPress={() => navigateStack('ChangePassword')} />
          <SettingItem icon={Bell} label="Notifications" onPress={() => navigateTab('Help', 'Notifications')} />
          <SettingItem icon={Globe} label="Language" value="English" onPress={() => Alert.alert('Language', 'Coming soon')} />
        </View>

        <Text style={styles.sectionTitle}>Help & Info</Text>
        <View style={styles.settingsList}>
          <SettingItem icon={HelpCircle} label="Help Center" onPress={() => navigateTab('Help', 'HelpMain')} />
          <SettingItem icon={Info} label="Privacy Policy" onPress={() => Alert.alert('Privacy', 'View privacy policy')} />
          <SettingItem icon={FileText} label="Terms of Service" onPress={() => Alert.alert('Terms', 'Terms of service')} />
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={18} color={colors.error} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>Smart FIR System v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Sub-components ──────────────────────────────────────
const StatBox = ({ value, label, color }) => (
  <View style={[styles.statBox, { backgroundColor: color }]}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const InfoRow = ({ icon: Icon, label, value }) => (
  <View style={styles.infoRow}>
    <Icon size={16} color={colors.textSecondary} style={{ marginRight: 12 }} />
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value || '—'}</Text>
  </View>
);

const Field = ({ label, value, onChangeText, icon: Icon, editable = true, ...props }) => (
  <View style={styles.fieldContainer}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <View style={styles.fieldInputRow}>
      <Icon size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
      <TextInput
        style={styles.fieldInput}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={colors.textLight}
        editable={editable}
        {...props}
      />
    </View>
  </View>
);

const SettingItem = ({ icon: Icon, label, value, onPress }) => (
  <TouchableOpacity style={styles.settingItem} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.settingLeft}>
      <View style={styles.settingIcon}><Icon size={18} color={colors.primary} /></View>
      <Text style={styles.settingLabel}>{label}</Text>
    </View>
    <View style={styles.settingRight}>
      {value && <Text style={styles.settingValue}>{value}</Text>}
      <ChevronRight size={18} color={colors.textLight} />
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1,
    borderBottomColor: colors.border, backgroundColor: colors.background,
  },
  headerTitle: { fontSize: 24, fontWeight: '700', color: colors.textPrimary },
  editBtn: { flexDirection: 'row', alignItems: 'center', padding: 8 },
  editBtnText: { color: colors.primary, fontWeight: '600', marginLeft: 4 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },

  profileCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: 16, padding: 20, marginBottom: 24,
    borderWidth: 1, borderColor: colors.border,
    shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 2,
  },
  avatarWrapper: { position: 'relative', marginRight: 16 },
  avatar: { width: 72, height: 72, borderRadius: 36 },
  avatarPlaceholder: { backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  cameraIcon: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: colors.primary, borderRadius: 12,
    width: 24, height: 24, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'white',
  },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  profileCnic: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },

  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  statBox: {
    flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center',
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4,
  },
  statValue: { fontSize: 22, fontWeight: '800', color: 'white' },
  statLabel: { fontSize: 11, fontWeight: '600', color: 'white', marginTop: 3 },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 12, marginTop: 8 },

  infoCard: {
    backgroundColor: colors.surface, borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: colors.border, marginBottom: 24,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  infoLabel: { flex: 1, fontSize: 13, color: colors.textSecondary, marginLeft: 0 },
  infoValue: { fontSize: 14, fontWeight: '500', color: colors.textPrimary },

  fieldContainer: { marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, marginBottom: 6 },
  fieldInputRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: colors.border, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    backgroundColor: colors.background,
  },
  fieldInput: { flex: 1, fontSize: 15, color: colors.textPrimary },

  saveBtn: {
    backgroundColor: colors.primary, borderRadius: 12, padding: 16,
    alignItems: 'center', marginTop: 16,
    elevation: 2, shadowColor: colors.primary, shadowOpacity: 0.2, shadowRadius: 4,
  },
  saveBtnText: { color: 'white', fontWeight: '700', fontSize: 16 },

  settingsList: {
    backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1,
    borderColor: colors.border, overflow: 'hidden', marginBottom: 24,
  },
  settingItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  settingIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
    marginRight: 12, borderWidth: 1, borderColor: colors.border,
  },
  settingLabel: { fontSize: 14, fontWeight: '500', color: colors.textPrimary },
  settingRight: { flexDirection: 'row', alignItems: 'center' },
  settingValue: { fontSize: 12, color: colors.textLight, marginRight: 8 },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: 14, borderRadius: 12, borderWidth: 1.5, borderColor: colors.error,
    marginTop: 8, marginBottom: 16,
  },
  logoutText: { color: colors.error, fontWeight: '700', fontSize: 15, marginLeft: 8 },
  footer: { textAlign: 'center', fontSize: 12, color: colors.textLight, marginTop: 8 },
});