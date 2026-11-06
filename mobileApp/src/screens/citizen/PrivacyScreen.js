// src/screens/citizen/PrivacyScreen.js
// SmartFIR - Privacy & Security Screen
// Dynamic Backend-Driven | Real-time Toggle Updates | Animations

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Dimensions,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  Animated,
  ActivityIndicator,
  Linking,
} from 'react-native';
import {
  Shield,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  Fingerprint,
  Smartphone,
  Share2,
  Database,
  FileText,
  Bell,
  Globe,
  UserCheck,
  Trash2,
  Download,
  ChevronRight,
  Info,
  RefreshCw,
  Wifi,
  WifiOff,
  Users,
  UserX,
  History,
  Cookie,
  Key,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── API Configuration ────────────────────────────────────
const BASE_URL = 'http://http://localhost:5000/api/api'; // ← Update with your IP

const apiFetch = async (endpoint, options = {}) => {
  const token = await AsyncStorage.getItem('@smartfir_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Request failed');
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
  info: '#1971C2',
  infoLight: '#D0EBFF',
};

// ─── Default Privacy Settings (Fallback) ──────────────────
const DEFAULT_PRIVACY_SETTINGS = {
  profileVisibility: {
    id: 'profileVisibility',
    title: 'Profile Visibility',
    description: 'Control who can see your profile information',
    icon: Eye,
    value: 'private',
    type: 'select',
    options: [
      { label: 'Public', value: 'public', description: 'Everyone can see' },
      { label: 'Friends Only', value: 'friends', description: 'Only connected users' },
      { label: 'Private', value: 'private', description: 'Only you' },
    ],
  },
  dataSharing: {
    id: 'dataSharing',
    title: 'Data Sharing',
    description: 'Allow sharing of anonymized data for system improvement',
    icon: Share2,
    value: false,
    type: 'toggle',
  },
  locationTracking: {
    id: 'locationTracking',
    title: 'Location Tracking',
    description: 'Allow app to access your location for FIR filing',
    icon: MapPin,
    value: true,
    type: 'toggle',
  },
  biometricLogin: {
    id: 'biometricLogin',
    title: 'Biometric Login',
    description: 'Use fingerprint or face recognition to login',
    icon: Fingerprint,
    value: false,
    type: 'toggle',
  },
  twoFactorAuth: {
    id: 'twoFactorAuth',
    title: 'Two-Factor Authentication',
    description: 'Add an extra layer of security to your account',
    icon: ShieldCheck,
    value: false,
    type: 'toggle',
  },
  notificationsEnabled: {
    id: 'notificationsEnabled',
    title: 'Push Notifications',
    description: 'Receive alerts for FIR updates and status changes',
    icon: Bell,
    value: true,
    type: 'toggle',
  },
  offlineAccess: {
    id: 'offlineAccess',
    title: 'Offline Access',
    description: 'Allow access to your drafts and saved FIRs offline',
    icon: WifiOff,
    value: true,
    type: 'toggle',
  },
  analyticsCollection: {
    id: 'analyticsCollection',
    title: 'Usage Analytics',
    description: 'Help us improve by sharing anonymous usage data',
    icon: Database,
    value: false,
    type: 'toggle',
  },
  autoSaveDrafts: {
    id: 'autoSaveDrafts',
    title: 'Auto-Save Drafts',
    description: 'Automatically save FIR drafts as you type',
    icon: FileText,
    value: true,
    type: 'toggle',
  },
  showOnlineStatus: {
    id: 'showOnlineStatus',
    title: 'Online Status',
    description: 'Show when you are actively using the app',
    icon: Wifi,
    value: true,
    type: 'toggle',
  },
};

// ─── Privacy Policy Sections ──────────────────────────────
const PRIVACY_POLICY_SECTIONS = [
  {
    id: 'data_collection',
    title: 'Data We Collect',
    icon: Database,
    content: 'We collect personal information including your name, CNIC, phone number, address, and FIR details. This information is essential for filing and tracking FIRs with law enforcement agencies.',
  },
  {
    id: 'data_usage',
    title: 'How We Use Your Data',
    icon: FileText,
    content: 'Your data is used exclusively for FIR processing, investigation tracking, and communication with police officials. We do not sell or share your data with third parties.',
  },
  {
    id: 'data_storage',
    title: 'Data Storage & Security',
    icon: Lock,
    content: 'Your data is encrypted using military-grade AES-256 encryption. All data is stored on secure servers with regular security audits and compliance with Pakistan\'s data protection laws.',
  },
  {
    id: 'your_rights',
    title: 'Your Rights',
    icon: UserCheck,
    content: 'You have the right to access, correct, or delete your personal data. You can request a copy of your data or withdraw consent at any time through the app settings.',
  },
];

// ─── Component ────────────────────────────────────────────
export function PrivacyScreen({ navigation }) {
  // State
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [error, setError] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);
  const [lastSync, setLastSync] = useState(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const syncAnim = useRef(new Animated.Value(0)).current;

  // ─── Lifecycle ─────────────────────────────────────────
  useEffect(() => {
    loadPrivacySettings();
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

  // ─── Load Settings from Backend ───────────────────────
  const loadPrivacySettings = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch from backend
      const data = await apiFetch('/settings/privacy');
      
      // Merge with defaults (backend may not have all settings)
      const mergedSettings = { ...DEFAULT_PRIVACY_SETTINGS };
      
      if (data.settings) {
        Object.keys(data.settings).forEach((key) => {
          if (mergedSettings[key]) {
            mergedSettings[key] = {
              ...mergedSettings[key],
              value: data.settings[key],
            };
          }
        });
      }

      setSettings(mergedSettings);
      setLastSync(new Date().toLocaleTimeString());
    } catch (err) {
      // Fallback to local storage
      await loadLocalSettings();
      setError('Could not sync with server. Showing local settings.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Load from Local Storage (Fallback) ──────────────
  const loadLocalSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem('@privacy_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        const mergedSettings = { ...DEFAULT_PRIVACY_SETTINGS };
        Object.keys(parsed).forEach((key) => {
          if (mergedSettings[key]) {
            mergedSettings[key] = {
              ...mergedSettings[key],
              value: parsed[key],
            };
          }
        });
        setSettings(mergedSettings);
      } else {
        setSettings(DEFAULT_PRIVACY_SETTINGS);
      }
    } catch (err) {
      setSettings(DEFAULT_PRIVACY_SETTINGS);
    }
  };

  // ─── Save to Local Storage ───────────────────────────
  const saveLocalSettings = async (settingsToSave) => {
    try {
      const simplified = {};
      Object.keys(settingsToSave).forEach((key) => {
        simplified[key] = settingsToSave[key].value;
      });
      await AsyncStorage.setItem('@privacy_settings', JSON.stringify(simplified));
    } catch (err) {
      console.error('Error saving local settings:', err);
    }
  };

  // ─── Handle Toggle Change ────────────────────────────
  const handleToggleChange = useCallback(
    async (settingId, newValue) => {
      // Optimistic update
      setSettings((prev) => ({
        ...prev,
        [settingId]: { ...prev[settingId], value: newValue },
      }));

      // Save locally immediately
      const updatedSettings = {
        ...settings,
        [settingId]: { ...settings[settingId], value: newValue },
      };
      saveLocalSettings(updatedSettings);

      // Sync with backend
      setSaving((prev) => ({ ...prev, [settingId]: true }));
      try {
        await apiFetch('/settings/privacy', {
          method: 'PUT',
          body: JSON.stringify({ [settingId]: newValue }),
        });
        setLastSync(new Date().toLocaleTimeString());
        setError(null);
      } catch (err) {
        // Revert on failure
        setSettings((prev) => ({
          ...prev,
          [settingId]: { ...prev[settingId], value: !newValue },
        }));
        Alert.alert('Sync Failed', 'Could not save setting. Please try again.');
      } finally {
        setSaving((prev) => ({ ...prev, [settingId]: false }));
      }
    },
    [settings]
  );

  // ─── Handle Select Change (Profile Visibility) ────────
  const handleVisibilityChange = useCallback(
    (settingId, newValue) => {
      Alert.alert(
        'Profile Visibility',
        'Choose who can see your profile:',
        DEFAULT_PRIVACY_SETTINGS.profileVisibility.options.map((opt) => ({
          text: opt.label,
          onPress: () => handleToggleChange(settingId, opt.value),
        })),
      );
    },
    [handleToggleChange]
  );

  // ─── Sync Animation ──────────────────────────────────
  const triggerSyncAnimation = () => {
    Animated.sequence([
      Animated.timing(syncAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(syncAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // ─── Handle Refresh ──────────────────────────────────
  const handleRefresh = async () => {
    triggerSyncAnimation();
    await loadPrivacySettings();
  };

  // ─── Handle Clear Data ──────────────────────────────
  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all locally stored data including drafts and cached settings. Your FIR records on the server will not be affected.\n\nAre you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              // Keep token
              const token = await AsyncStorage.getItem('@smartfir_token');
              if (token) {
                await AsyncStorage.setItem('@smartfir_token', token);
              }
              Alert.alert('Cleared', 'Local data has been cleared successfully.');
              loadPrivacySettings();
            } catch (err) {
              Alert.alert('Error', 'Failed to clear data.');
            }
          },
        },
      ]
    );
  };

  // ─── Handle Export Data ──────────────────────────────
  const handleExportData = () => {
    Alert.alert(
      'Export My Data',
      'You can request a copy of all your personal data stored on our servers. This may take up to 48 hours.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request Export',
          onPress: async () => {
            try {
              await apiFetch('/settings/export-data', { method: 'POST' });
              Alert.alert(
                'Request Sent',
                'Your data export request has been submitted. You will receive an email with your data within 48 hours.'
              );
            } catch (err) {
              Alert.alert('Error', 'Failed to submit request. Please try again.');
            }
          },
        },
      ]
    );
  };

  // ─── Handle Delete Account ───────────────────────────
  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action is permanent and cannot be undone. All your FIR records and personal data will be deleted.\n\nType "DELETE" to confirm.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Final Confirmation',
              'Are you absolutely sure? This cannot be undone.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Yes, Delete',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await apiFetch('/auth/delete-account', { method: 'DELETE' });
                      await AsyncStorage.clear();
                      navigation.reset({
                        index: 0,
                        routes: [{ name: 'Login' }],
                      });
                    } catch (err) {
                      Alert.alert('Error', 'Failed to delete account.');
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  // ─── Render Setting Item ──────────────────────────────
  const SettingItem = ({ setting, isLast = false }) => {
    const Icon = setting.icon;
    const isSaving = saving[setting.id];

    return (
      <Animated.View
        style={[
          styles.settingItem,
          !isLast && styles.settingItemBorder,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.settingLeft}>
          <View style={[styles.settingIcon, { backgroundColor: `${COLORS.primary}10` }]}>
            <Icon size={isSmallScreen ? 18 : 20} color={COLORS.primary} />
          </View>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>{setting.title}</Text>
            <Text style={styles.settingDescription}>{setting.description}</Text>
            {setting.type === 'select' && (
              <Text style={styles.settingCurrentValue}>
                Current: {setting.options?.find((o) => o.value === setting.value)?.label || setting.value}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.settingRight}>
          {isSaving ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : setting.type === 'toggle' ? (
            <Switch
              value={setting.value}
              onValueChange={(value) => handleToggleChange(setting.id, value)}
              trackColor={{ false: COLORS.border, true: `${COLORS.primary}40` }}
              thumbColor={setting.value ? COLORS.primary : COLORS.textLight}
              ios_backgroundColor={COLORS.border}
            />
          ) : (
            <TouchableOpacity
              onPress={() => handleVisibilityChange(setting.id)}
              style={styles.selectButton}
              activeOpacity={0.7}
            >
              <Text style={styles.selectButtonText}>
                {setting.options?.find((o) => o.value === setting.value)?.label || 'Select'}
              </Text>
              <ChevronRight size={16} color={COLORS.primary} />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    );
  };

  // ─── Render Policy Section ────────────────────────────
  const PolicySection = ({ section, index }) => {
    const isExpanded = expandedSection === section.id;
    const Icon = section.icon;

    return (
      <Animated.View
        style={[
          styles.policySection,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.policyHeader}
          onPress={() => setExpandedSection(isExpanded ? null : section.id)}
          activeOpacity={0.7}
        >
          <View style={styles.policyHeaderLeft}>
            <View style={[styles.policyIcon, { backgroundColor: `${COLORS.info}10` }]}>
              <Icon size={18} color={COLORS.info} />
            </View>
            <Text style={styles.policyTitle}>{section.title}</Text>
          </View>
          <ChevronRight
            size={18}
            color={COLORS.textLight}
            style={{
              transform: [{ rotate: isExpanded ? '90deg' : '0deg' }],
            }}
          />
        </TouchableOpacity>
        {isExpanded && (
          <View style={styles.policyContent}>
            <Text style={styles.policyText}>{section.content}</Text>
          </View>
        )}
      </Animated.View>
    );
  };

  // ─── Loading State ────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading privacy settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Main Render ──────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* ── Header ────────────────────────────────── */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <View style={styles.headerTop}>
          <View style={styles.headerTitleRow}>
            <Shield size={isSmallScreen ? 22 : 26} color={COLORS.primary} />
            <Text style={styles.headerTitle}>Privacy & Security</Text>
          </View>
          <TouchableOpacity
            onPress={handleRefresh}
            style={styles.syncButton}
            activeOpacity={0.7}
          >
            <Animated.View
              style={{
                transform: [
                  {
                    rotate: syncAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
              }}
            >
              <RefreshCw size={18} color={COLORS.primary} />
            </Animated.View>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>
          Manage your data, security, and privacy preferences
        </Text>
        {lastSync && (
          <Text style={styles.syncText}>Last synced: {lastSync}</Text>
        )}
        {error && (
          <View style={styles.errorBanner}>
            <AlertTriangle size={14} color={COLORS.warning} />
            <Text style={styles.errorBannerText}>{error}</Text>
          </View>
        )}
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Privacy Settings Section ─────────────── */}
        <Text style={styles.sectionTitle}>Privacy Controls</Text>
        <View style={styles.settingsCard}>
          {Object.values(settings).map((setting, index) => (
            <SettingItem
              key={setting.id}
              setting={setting}
              isLast={index === Object.values(settings).length - 1}
            />
          ))}
        </View>

        {/* ── Privacy Policy Section ─────────────────── */}
        <Text style={styles.sectionTitle}>Privacy Policy</Text>
        <View style={styles.policyCard}>
          {PRIVACY_POLICY_SECTIONS.map((section, index) => (
            <PolicySection key={section.id} section={section} index={index} />
          ))}
        </View>

        {/* ── Data Management Section ──────────────── */}
        <Text style={styles.sectionTitle}>Data Management</Text>
        <View style={styles.settingsCard}>
          <TouchableOpacity
            style={styles.actionItem}
            onPress={handleExportData}
            activeOpacity={0.7}
          >
            <View style={styles.actionLeft}>
              <View style={[styles.actionIcon, { backgroundColor: `${COLORS.info}10` }]}>
                <Download size={18} color={COLORS.info} />
              </View>
              <View>
                <Text style={styles.actionTitle}>Export My Data</Text>
                <Text style={styles.actionDescription}>
                  Request a copy of all your personal data
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color={COLORS.textLight} />
          </TouchableOpacity>

          <View style={styles.actionItemDivider} />

          <TouchableOpacity
            style={styles.actionItem}
            onPress={handleClearData}
            activeOpacity={0.7}
          >
            <View style={styles.actionLeft}>
              <View style={[styles.actionIcon, { backgroundColor: `${COLORS.warning}10` }]}>
                <Trash2 size={18} color={COLORS.warning} />
              </View>
              <View>
                <Text style={styles.actionTitle}>Clear Local Data</Text>
                <Text style={styles.actionDescription}>
                  Remove drafts and cached data from device
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color={COLORS.textLight} />
          </TouchableOpacity>

          <View style={styles.actionItemDivider} />

          <TouchableOpacity
            style={styles.actionItem}
            onPress={handleDeleteAccount}
            activeOpacity={0.7}
          >
            <View style={styles.actionLeft}>
              <View style={[styles.actionIcon, { backgroundColor: `${COLORS.error}10` }]}>
                <AlertTriangle size={18} color={COLORS.error} />
              </View>
              <View>
                <Text style={[styles.actionTitle, { color: COLORS.error }]}>
                  Delete Account
                </Text>
                <Text style={styles.actionDescription}>
                  Permanently remove your account and all data
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color={COLORS.textLight} />
          </TouchableOpacity>
        </View>

        {/* ── Footer ───────────────────────────────── */}
        <View style={styles.footer}>
          <ShieldCheck size={16} color={COLORS.success} />
          <Text style={styles.footerText}>
            Your privacy is our priority. All data is encrypted and handled in compliance with Pakistan's data protection regulations.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
  },

  // ── Header ──────────────────────────────────────────
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 8 : 20,
    paddingBottom: 14,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: isSmallScreen ? 22 : 26,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  syncButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  syncText: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 4,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warningLight,
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    gap: 8,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.warning,
  },

  // ── ScrollView ──────────────────────────────────────
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  // ── Section Title ───────────────────────────────────
  sectionTitle: {
    fontSize: isSmallScreen ? 15 : 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
    marginTop: 8,
  },

  // ── Settings Card ───────────────────────────────────
  settingsCard: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
    gap: 12,
  },
  settingIcon: {
    width: isSmallScreen ? 38 : 42,
    height: isSmallScreen ? 38 : 42,
    borderRadius: isSmallScreen ? 19 : 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: isSmallScreen ? 13 : 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  settingCurrentValue: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '500',
    marginTop: 4,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
  },
  selectButtonText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },

  // ── Policy Card ────────────────────────────────────
  policyCard: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
    overflow: 'hidden',
  },
  policySection: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  policyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  policyHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  policyIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  policyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  policyContent: {
    padding: 16,
    paddingTop: 0,
    backgroundColor: COLORS.surface,
  },
  policyText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },

  // ── Action Items ────────────────────────────────────
  actionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  actionItemDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 16,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
    gap: 12,
  },
  actionIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },

  // ── Footer ──────────────────────────────────────────
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successLight,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: `${COLORS.success}30`,
    gap: 10,
  },
  footerText: {
    flex: 1,
    fontSize: 11,
    color: COLORS.success,
    lineHeight: 16,
  },
});