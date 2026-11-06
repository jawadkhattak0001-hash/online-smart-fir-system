// src/screens/citizen/SettingsScreen.js
// SmartFIR - Settings Screen
// Dynamic Backend-Driven | Real-time Updates | Responsive | Animations

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
  TextInput,
  Modal,
} from 'react-native';
import {
  Settings,
  Bell,
  Globe,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Type,
  Languages,
  Smartphone,
  Wifi,
  Database,
  Info,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  Shield,
  FileText,
  HelpCircle,
  Star,
  Share2,
  LogOut,
  Trash2,
  Check,
  Download,
  Clock,
  MapPin,
  Navigation,
  AlertTriangle,
  CheckCircle,
  X,
  MessageSquare,
} from 'lucide-react-native';
import { useAuth } from '../../hooks/useAuth';
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

const APP_VERSION = '1.0.0';
const BUILD_NUMBER = '2024.04.26';

// ─── Dynamic Settings Configuration ───────────────────────
const SETTINGS_SECTIONS = [
  {
    id: 'general',
    title: 'General',
    icon: Settings,
    items: [
      {
        id: 'language',
        title: 'Language',
        description: 'Change app language',
        icon: Languages,
        type: 'select',
        value: 'english',
        options: [
          { label: 'English', value: 'english' },
          { label: 'Urdu (اردو)', value: 'urdu' },
        ],
        endpoint: '/settings/language',
        method: 'PUT',
      },
      {
        id: 'fontSize',
        title: 'Font Size',
        description: 'Adjust text size for better readability',
        icon: Type,
        type: 'select',
        value: 'medium',
        options: [
          { label: 'Small', value: 'small' },
          { label: 'Medium', value: 'medium' },
          { label: 'Large', value: 'large' },
        ],
        endpoint: '/settings/font-size',
        method: 'PUT',
      },
      {
        id: 'soundEffects',
        title: 'Sound Effects',
        description: 'Play sounds for actions and notifications',
        icon: Volume2,
        type: 'toggle',
        value: true,
        endpoint: '/settings/sound-effects',
        method: 'PUT',
      },
      {
        id: 'hapticFeedback',
        title: 'Haptic Feedback',
        description: 'Vibrate on button presses and actions',
        icon: Smartphone,
        type: 'toggle',
        value: true,
        endpoint: '/settings/haptic-feedback',
        method: 'PUT',
      },
    ],
  },
  {
    id: 'notifications',
    title: 'Notifications',
    icon: Bell,
    items: [
      {
        id: 'pushNotifications',
        title: 'Push Notifications',
        description: 'Receive FIR status updates instantly',
        icon: Bell,
        type: 'toggle',
        value: true,
        endpoint: '/settings/push-notifications',
        method: 'PUT',
      },
      {
        id: 'emailNotifications',
        title: 'Email Notifications',
        description: 'Receive updates via email',
        icon: MessageSquare,
        type: 'toggle',
        value: false,
        endpoint: '/settings/email-notifications',
        method: 'PUT',
      },
      {
        id: 'smsNotifications',
        title: 'SMS Alerts',
        description: 'Get critical updates via SMS',
        icon: Smartphone,
        type: 'toggle',
        value: true,
        endpoint: '/settings/sms-notifications',
        method: 'PUT',
      },
    ],
  },
  {
    id: 'data',
    title: 'Data & Storage',
    icon: Database,
    items: [
      {
        id: 'autoDownload',
        title: 'Auto-Download FIRs',
        description: 'Automatically download FIR PDFs',
        icon: Download,
        type: 'toggle',
        value: false,
        endpoint: '/settings/auto-download',
        method: 'PUT',
      },
      {
        id: 'wifiOnly',
        title: 'Wi-Fi Only Downloads',
        description: 'Download files only on Wi-Fi',
        icon: Wifi,
        type: 'toggle',
        value: true,
        endpoint: '/settings/wifi-only',
        method: 'PUT',
      },
      {
        id: 'cacheSize',
        title: 'Clear Cache',
        description: 'Free up storage space',
        icon: Trash2,
        type: 'action',
        value: null,
        action: 'clearCache',
      },
    ],
  },
  {
    id: 'about',
    title: 'About',
    icon: Info,
    items: [
      {
        id: 'version',
        title: 'App Version',
        description: `${APP_VERSION} (Build ${BUILD_NUMBER})`,
        icon: Info,
        type: 'info',
        value: null,
      },
      {
        id: 'rateApp',
        title: 'Rate the App',
        description: 'Help us improve by rating',
        icon: Star,
        type: 'action',
        value: null,
        action: 'rateApp',
      },
      {
        id: 'shareApp',
        title: 'Share with Friends',
        description: 'Spread the word about SmartFIR',
        icon: Share2,
        type: 'action',
        value: null,
        action: 'shareApp',
      },
      {
        id: 'helpCenter',
        title: 'Help Center',
        description: 'FAQs, guides, and support',
        icon: HelpCircle,
        type: 'navigation',
        value: null,
        screen: 'Help',
      },
      {
        id: 'privacyPolicy',
        title: 'Privacy Policy',
        description: 'How we protect your data',
        icon: Shield,
        type: 'navigation',
        value: null,
        screen: 'Privacy',
      },
      {
        id: 'termsOfService',
        title: 'Terms of Service',
        description: 'Read our terms and conditions',
        icon: FileText,
        type: 'action',
        value: null,
        action: 'openTerms',
      },
    ],
  },
];

// ─── Component ────────────────────────────────────────────
export function SettingsScreen({ navigation }) {
  const { user, logout } = useAuth();

  // State
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [error, setError] = useState(null);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [fontSizeModalVisible, setFontSizeModalVisible] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [cacheSize, setCacheSize] = useState('2.4 MB');

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const syncAnim = useRef(new Animated.Value(0)).current;

  // ─── Lifecycle ─────────────────────────────────────────
  useEffect(() => {
    loadSettings();
    calculateCacheSize();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  // ─── Calculate Cache Size ─────────────────────────────
  const calculateCacheSize = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const filteredKeys = keys.filter(
        (k) => !k.includes('@smartfir_token') && !k.includes('@smartfir_user')
      );
      const size = (filteredKeys.length * 0.05).toFixed(1); // Mock calculation
      setCacheSize(`${size} MB`);
    } catch (err) {
      setCacheSize('Unknown');
    }
  };

  // ─── Load Settings from Backend ───────────────────────
  const loadSettings = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all settings from backend
      const data = await apiFetch('/settings');

      // Build settings object from API response
      const settingsObj = {};
      if (data.settings) {
        Object.keys(data.settings).forEach((key) => {
          settingsObj[key] = data.settings[key];
        });
      } else {
        // Fallback to default values
        SETTINGS_SECTIONS.forEach((section) => {
          section.items.forEach((item) => {
            if (item.type === 'toggle' || item.type === 'select') {
              settingsObj[item.id] = item.value;
            }
          });
        });
      }

      setSettings(settingsObj);
      setLastSync(new Date().toLocaleTimeString());
    } catch (err) {
      // Load from local storage
      await loadLocalSettings();
      setError('Could not sync. Showing local settings.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Load Local Settings ──────────────────────────────
  const loadLocalSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem('@app_settings');
      if (saved) {
        setSettings(JSON.parse(saved));
      } else {
        const defaults = {};
        SETTINGS_SECTIONS.forEach((section) => {
          section.items.forEach((item) => {
            if (item.type === 'toggle' || item.type === 'select') {
              defaults[item.id] = item.value;
            }
          });
        });
        setSettings(defaults);
      }
    } catch (err) {
      const defaults = {};
      SETTINGS_SECTIONS.forEach((section) => {
        section.items.forEach((item) => {
          if (item.type === 'toggle' || item.type === 'select') {
            defaults[item.id] = item.value;
          }
        });
      });
      setSettings(defaults);
    }
  };

  // ─── Save Locally ────────────────────────────────────
  const saveLocally = async (newSettings) => {
    try {
      await AsyncStorage.setItem('@app_settings', JSON.stringify(newSettings));
    } catch (err) {
      console.error('Error saving settings:', err);
    }
  };

  // ─── Handle Setting Change ───────────────────────────
  const handleSettingChange = useCallback(
    async (item, newValue) => {
      // Optimistic update
      const updatedSettings = { ...settings, [item.id]: newValue };
      setSettings(updatedSettings);
      saveLocally(updatedSettings);

      // Sync with backend if endpoint exists
      if (item.endpoint) {
        setSaving((prev) => ({ ...prev, [item.id]: true }));
        try {
          await apiFetch(item.endpoint, {
            method: item.method || 'PUT',
            body: JSON.stringify({ value: newValue }),
          });
          setLastSync(new Date().toLocaleTimeString());
          setError(null);
        } catch (err) {
          // Revert on failure
          setSettings((prev) => ({ ...prev, [item.id]: settings[item.id] }));
          // Silently fail — user already sees the toggle
        } finally {
          setSaving((prev) => ({ ...prev, [item.id]: false }));
        }
      }
    },
    [settings]
  );

  // ─── Handle Action ──────────────────────────────────
  const handleAction = (action) => {
    switch (action) {
      case 'clearCache':
        handleClearCache();
        break;
      case 'rateApp':
        handleRateApp();
        break;
      case 'shareApp':
        handleShareApp();
        break;
      case 'openTerms':
        Linking.openURL('https://smartfir.gov.pk/terms');
        break;
      default:
        break;
    }
  };

  // ─── Clear Cache ────────────────────────────────────
  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      `This will clear ${cacheSize} of cached data including drafts and temporary files. FIR records on server will not be affected.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Cache',
          onPress: async () => {
            try {
              const keys = await AsyncStorage.getAllKeys();
              const keysToRemove = keys.filter(
                (k) =>
                  !k.includes('@smartfir_token') &&
                  !k.includes('@smartfir_user') &&
                  !k.includes('@privacy_settings') &&
                  !k.includes('@app_settings') &&
                  !k.includes('@emergency_contacts')
              );
              await AsyncStorage.multiRemove(keysToRemove);
              setCacheSize('0 MB');
              Alert.alert('Cleared', 'Cache has been cleared successfully.');
            } catch (err) {
              Alert.alert('Error', 'Failed to clear cache.');
            }
          },
        },
      ]
    );
  };

  // ─── Rate App ───────────────────────────────────────
  const handleRateApp = () => {
    Alert.alert(
      'Rate SmartFIR',
      'Enjoy using SmartFIR? Please take a moment to rate us on the app store.',
      [
        { text: 'Later', style: 'cancel' },
        {
          text: 'Rate Now',
          onPress: () => {
            // Open app store
            const url = Platform.OS === 'ios'
              ? 'https://apps.apple.com/app/smartfir/id123456789'
              : 'https://play.google.com/store/apps/details?id=com.smartfir';
            Linking.openURL(url);
          },
        },
      ]
    );
  };

  // ─── Share App ──────────────────────────────────────
  const handleShareApp = () => {
    Share.share({
      message:
        'Check out SmartFIR — Pakistan\'s smart FIR filing system! File complaints, track investigations, and get real-time updates.\n\nDownload now: https://smartfir.gov.pk/app',
    });
  };

  // ─── Handle Logout ──────────────────────────────────
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            if (logout) {
              await logout();
            }
            navigation.reset({
              index: 0,
              routes: [{ name: 'Auth' }],
            });
          },
        },
      ]
    );
  };

  // ─── Refresh Settings ──────────────────────────────
  const handleRefresh = () => {
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
    loadSettings();
  };

  // ─── Get Setting Value ──────────────────────────────
  const getSettingValue = (item) => {
    if (settings[item.id] !== undefined) {
      return settings[item.id];
    }
    return item.value;
  };

  // ─── Render Setting Item ────────────────────────────
  const SettingItem = ({ item, isLast }) => {
    const Icon = item.icon;
    const value = getSettingValue(item);
    const isSaving = saving[item.id];

    return (
      <Animated.View
        style={[
          styles.settingItem,
          !isLast && styles.settingItemBorder,
          { opacity: fadeAnim },
        ]}
      >
        <View style={styles.settingLeft}>
          <View style={styles.settingIcon}>
            <Icon size={isSmallScreen ? 18 : 20} color={COLORS.primary} />
          </View>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>{item.title}</Text>
            <Text style={styles.settingDescription}>{item.description}</Text>
          </View>
        </View>

        <View style={styles.settingRight}>
          {isSaving ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : item.type === 'toggle' ? (
            <Switch
              value={value}
              onValueChange={(newValue) => handleSettingChange(item, newValue)}
              trackColor={{ false: COLORS.border, true: `${COLORS.primary}40` }}
              thumbColor={value ? COLORS.primary : COLORS.textLight}
              ios_backgroundColor={COLORS.border}
            />
          ) : item.type === 'select' ? (
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => {
                if (item.id === 'language') setLanguageModalVisible(true);
                else if (item.id === 'fontSize') setFontSizeModalVisible(true);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.selectButtonText}>
                {item.options?.find((o) => o.value === value)?.label || value}
              </Text>
              <ChevronRight size={16} color={COLORS.primary} />
            </TouchableOpacity>
          ) : item.type === 'navigation' ? (
            <TouchableOpacity
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.7}
            >
              <ChevronRight size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          ) : item.type === 'action' ? (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleAction(item.action)}
              activeOpacity={0.7}
            >
              <Text style={styles.actionButtonText}>
                {item.action === 'clearCache' ? 'Clear' : 'Go'}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.infoValue}>{item.description}</Text>
          )}
        </View>
      </Animated.View>
    );
  };

  // ─── Render Section ──────────────────────────────────
  const SectionGroup = ({ section }) => {
    const SectionIcon = section.icon;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <SectionIcon size={isSmallScreen ? 16 : 18} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>{section.title}</Text>
        </View>
        <View style={styles.sectionCard}>
          {section.items.map((item, index) => (
            <SettingItem
              key={item.id}
              item={item}
              isLast={index === section.items.length - 1}
            />
          ))}
        </View>
      </View>
    );
  };

  // ─── Language Modal ──────────────────────────────────
  const LanguageModal = () => (
    <Modal
      visible={languageModalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setLanguageModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Language</Text>
            <TouchableOpacity onPress={() => setLanguageModalVisible(false)}>
              <X size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
          <View style={styles.modalBody}>
            {SETTINGS_SECTIONS[0].items[0].options.map((option) => {
              const isSelected = getSettingValue(SETTINGS_SECTIONS[0].items[0]) === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.modalOption, isSelected && styles.modalOptionSelected]}
                  onPress={() => {
                    handleSettingChange(SETTINGS_SECTIONS[0].items[0], option.value);
                    setLanguageModalVisible(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.modalOptionText, isSelected && styles.modalOptionTextSelected]}>
                    {option.label}
                  </Text>
                  {isSelected && <Check size={20} color={COLORS.primary} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );

  // ─── Font Size Modal ────────────────────────────────
  const FontSizeModal = () => (
    <Modal
      visible={fontSizeModalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setFontSizeModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Font Size</Text>
            <TouchableOpacity onPress={() => setFontSizeModalVisible(false)}>
              <X size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
          <View style={styles.modalBody}>
            {SETTINGS_SECTIONS[0].items[1].options.map((option) => {
              const isSelected = getSettingValue(SETTINGS_SECTIONS[0].items[1]) === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.modalOption, isSelected && styles.modalOptionSelected]}
                  onPress={() => {
                    handleSettingChange(SETTINGS_SECTIONS[0].items[1], option.value);
                    setFontSizeModalVisible(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.modalOptionText,
                    isSelected && styles.modalOptionTextSelected,
                    option.value === 'small' && { fontSize: 14 },
                    option.value === 'medium' && { fontSize: 16 },
                    option.value === 'large' && { fontSize: 18 },
                  ]}>
                    {option.label}
                  </Text>
                  {isSelected && <Check size={20} color={COLORS.primary} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );

  // ─── Loading State ────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading settings...</Text>
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
            <Settings size={isSmallScreen ? 22 : 26} color={COLORS.primary} />
            <Text style={styles.headerTitle}>Settings</Text>
          </View>
          <TouchableOpacity
            onPress={handleRefresh}
            style={styles.syncButton}
            activeOpacity={0.7}
          >
            <Animated.View
              style={{
                transform: [{
                  rotate: syncAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                }],
              }}
            >
              <RefreshCw size={18} color={COLORS.primary} />
            </Animated.View>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>Customize your app experience</Text>
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
        {/* ── User Profile Card ────────────────────── */}
        {user && (
          <TouchableOpacity
            style={styles.profileCard}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.7}
          >
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user.name || 'User'}</Text>
              <Text style={styles.profilePhone}>{user.phone || 'No phone'}</Text>
            </View>
            <ChevronRight size={20} color={COLORS.textLight} />
          </TouchableOpacity>
        )}

        {/* ── Settings Sections ─────────────────────── */}
        {SETTINGS_SECTIONS.map((section) => (
          <SectionGroup key={section.id} section={section} />
        ))}

        {/* ── Danger Zone ────────────────────────────── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: COLORS.error }]}>Danger Zone</Text>
          <View style={styles.sectionCard}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: `${COLORS.error}10` }]}>
                  <LogOut size={18} color={COLORS.error} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingTitle, { color: COLORS.error }]}>Logout</Text>
                  <Text style={styles.settingDescription}>
                    Sign out of your account
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Footer ────────────────────────────────── */}
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>SmartFIR</Text>
          <Text style={styles.footerVersion}>
            Version {APP_VERSION} (Build {BUILD_NUMBER})
          </Text>
          <Text style={styles.footerCopyright}>
            © 2024 Fironix. Government of Pakistan.
          </Text>
          <Text style={styles.footerRights}>All rights reserved.</Text>
        </View>
      </ScrollView>

      {/* ── Modals ─────────────────────────────────── */}
      <LanguageModal />
      <FontSizeModal />
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

  // ── Profile Card ────────────────────────────────────
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
    gap: 14,
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  profilePhone: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // ── Section ─────────────────────────────────────────
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: isSmallScreen ? 14 : 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  sectionCard: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },

  // ── Setting Item ────────────────────────────────────
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
    backgroundColor: `${COLORS.primary}10`,
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
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },
  actionButtonText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 12,
    color: COLORS.textLight,
  },

  // ── Modal ───────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalBody: {
    gap: 4,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    marginBottom: 8,
  },
  modalOptionSelected: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}05`,
  },
  modalOptionText: {
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  modalOptionTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },

  // ── Footer ──────────────────────────────────────────
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  footerVersion: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
  },
  footerCopyright: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 8,
  },
  footerRights: {
    fontSize: 11,
    color: COLORS.textLight,
  },
});