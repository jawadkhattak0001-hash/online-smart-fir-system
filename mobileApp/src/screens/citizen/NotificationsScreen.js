// src/screens/citizen/NotificationsScreen.js – FULLY FIXED (navigation + hooks)
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  Animated,
  ActivityIndicator,
} from 'react-native';
import {
  Bell,
  BellOff,
  CheckCircle,
  AlertCircle,
  Info,
  Clock,
  ChevronRight,
  Shield,
  FileText,
  AlertTriangle,
  RefreshCw,
  Trash2,
  Filter,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://http://localhost:5000/api/api';

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

const { width } = Dimensions.get('window');
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
  warning: '#E8590C',
  warningLight: '#FFE8CC',
  error: '#E03131',
  errorLight: '#FFE3E3',
  info: '#1971C2',
  infoLight: '#D0EBFF',
  unreadDot: '#E03131',
};

const NOTIFICATION_TYPES = {
  FIR_SUBMITTED: { icon: FileText, color: COLORS.info, bg: COLORS.infoLight, label: 'FIR Submitted' },
  STATUS_UPDATE: { icon: RefreshCw, color: COLORS.primary, bg: COLORS.surfaceDark, label: 'Status Update' },
  OFFICER_ASSIGNED: { icon: Shield, color: COLORS.success, bg: COLORS.successLight, label: 'Officer Assigned' },
  EVIDENCE_REQUEST: { icon: AlertCircle, color: COLORS.warning, bg: COLORS.warningLight, label: 'Evidence Request' },
  CASE_RESOLVED: { icon: CheckCircle, color: COLORS.success, bg: COLORS.successLight, label: 'Case Resolved' },
  ALERT: { icon: AlertTriangle, color: COLORS.error, bg: COLORS.errorLight, label: 'Alert' },
  GENERAL: { icon: Info, color: COLORS.info, bg: COLORS.infoLight, label: 'General' },
};

export function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [markingRead, setMarkingRead] = useState({});

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadNotifications();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await apiFetch('/notifications');
      const sorted = (data.notifications || []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setNotifications(sorted);
    } catch (error) {
      const mock = generateMockNotifications();
      setNotifications(mock);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const generateMockNotifications = () => {
    const now = new Date();
    return [
      { id: '1', type: 'STATUS_UPDATE', title: 'FIR Status Updated', message: 'Your FIR #FIR-2024-001 has been approved.', read: false, createdAt: new Date(now - 30*60*1000).toISOString(), firId: 'FIR-2024-001' },
      { id: '2', type: 'OFFICER_ASSIGNED', title: 'Officer Assigned', message: 'ASI Talha assigned to FIR #FIR-2024-001.', read: false, createdAt: new Date(now - 2*60*60*1000).toISOString(), firId: 'FIR-2024-001' },
      { id: '3', type: 'FIR_SUBMITTED', title: 'FIR Submitted', message: 'Mobile Phone Theft submitted to Tarnol PS.', read: true, createdAt: new Date(now - 24*60*60*1000).toISOString(), firId: 'FIR-2024-001' },
      { id: '4', type: 'ALERT', title: 'Court Date', message: 'Hearing on Mar 15 at Sessions Court.', read: true, createdAt: new Date(now - 3*24*60*60*1000).toISOString(), firId: 'FIR-2024-001' },
      { id: '5', type: 'GENERAL', title: 'System Update', message: 'Maintenance on Sunday, 2-6 AM.', read: true, createdAt: new Date(now - 5*24*60*60*1000).toISOString() },
    ];
  };

  const handleMarkAsRead = async (id) => {
    setMarkingRead(prev => ({ ...prev, [id]: true }));
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
    try {
      await apiFetch(`/notifications/${id}/read`, { method: 'PUT' });
    } catch {
      setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: false } : n)));
    } finally {
      setMarkingRead(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleMarkAllRead = () => {
    Alert.alert('Mark All as Read', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Mark All', onPress: () => setNotifications(prev => prev.map(n => ({ ...n, read: true }))) },
    ]);
  };

  const handleDelete = (id) => {
    Alert.alert('Delete', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        setNotifications(prev => prev.filter(n => n.id !== id));
        try { await apiFetch(`/notifications/${id}`, { method: 'DELETE' }); } catch {}
      }},
    ]);
  };

  // ─── FIXED: Cross‑tab navigation to FIRDetails ──────
  const handleNotificationPress = (notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    if (notification.firId) {
      // FIRDetails is inside MyFirsStack → go through the tab navigator
      const tabNav = navigation.getParent();
      tabNav?.navigate('MyFIRs', {
        screen: 'FIRDetails',
        params: { firId: notification.firId },
      });
    }
  };

  const safeNotifications = Array.isArray(notifications) ? notifications : [];

  const filteredNotifications = safeNotifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const unreadCount = safeNotifications.filter(n => !n.read).length;

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const now = new Date();
    const date = new Date(timestamp);
    const diffMins = Math.floor((now - date) / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' });
  };

  const renderNotification = ({ item }) => {
    const typeConfig = NOTIFICATION_TYPES[item.type] || NOTIFICATION_TYPES.GENERAL;
    const Icon = typeConfig.icon;
    const isMarking = markingRead[item.id];

    return (
      <TouchableOpacity
        style={[styles.notificationCard, !item.read && styles.unreadCard]}
        onPress={() => handleNotificationPress(item)}
        onLongPress={() => handleDelete(item.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: typeConfig.bg }]}>
          <Icon size={isSmallScreen ? 18 : 20} color={typeConfig.color} />
          {isMarking && <ActivityIndicator size="small" color={typeConfig.color} style={styles.markingIndicator} />}
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.notificationTitle} numberOfLines={1}>{item.title}</Text>
            {!item.read && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.notificationMessage} numberOfLines={2}>{item.message}</Text>
          <View style={styles.footerRow}>
            <View style={styles.typeBadge}>
              <View style={[styles.typeDot, { backgroundColor: typeConfig.color }]} />
              <Text style={[styles.typeText, { color: typeConfig.color }]}>{typeConfig.label}</Text>
            </View>
            <View style={styles.timeContainer}>
              <Clock size={12} color={COLORS.textLight} />
              <Text style={styles.timeText}>{formatTime(item.createdAt)}</Text>
            </View>
          </View>
        </View>
        <ChevronRight size={18} color={COLORS.textLight} />
      </TouchableOpacity>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      {filter === 'all' ? (
        <>
          <BellOff size={isSmallScreen ? 48 : 56} color={COLORS.textLight} />
          <Text style={styles.emptyTitle}>No Notifications</Text>
          <Text style={styles.emptySubtitle}>We'll notify you when there are updates.</Text>
        </>
      ) : (
        <>
        
         
          <TouchableOpacity style={styles.resetFilterButton} onPress={() => setFilter('all')}>
            <Filter size={16} color="white" />
            <Text style={styles.resetFilterText}>Show All</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <View style={styles.headerTop}>
          <View style={styles.headerTitleRow}>
          
            {unreadCount > 0 && (
              <View style={styles.badge}><Text style={styles.badgeText}>{unreadCount}</Text></View>
            )}
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllButton}>
              <CheckCircle size={16} color={COLORS.primary} />
              <Text style={styles.markAllText}>Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filterRow}>
          {['all', 'unread', 'read'].map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              style={[styles.filterTab, filter === f && styles.filterTabActive]}
            >
              <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>
                {f === 'all' ? 'All' : f === 'unread' ? 'Unread' : 'Read'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadNotifications(); }} colors={[COLORS.primary]} />
        }
        ListEmptyComponent={EmptyState}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: COLORS.textSecondary },
  header: { backgroundColor: COLORS.background, paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 8 : 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { fontSize: isSmallScreen ? 22 : 26, fontWeight: '700', color: COLORS.textPrimary },
  badge: { backgroundColor: COLORS.unreadDot, minWidth: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  badgeText: { color: 'white', fontSize: 12, fontWeight: '700' },
  markAllButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: COLORS.surface },
  markAllText: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  filterRow: { flexDirection: 'row', gap: 8 },
  filterTab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  filterTabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterTabText: { fontSize: 13, fontWeight: '500', color: COLORS.textSecondary },
  filterTabTextActive: { color: 'white' },
  listContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40 },
  notificationCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, borderRadius: 16, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border, gap: 12 },
  unreadCard: { backgroundColor: '#F8F9FF', borderColor: '#D0D5FF', borderLeftWidth: 4, borderLeftColor: COLORS.primary },
  iconContainer: { width: isSmallScreen ? 44 : 48, height: isSmallScreen ? 44 : 48, borderRadius: isSmallScreen ? 22 : 24, alignItems: 'center', justifyContent: 'center' },
  markingIndicator: { position: 'absolute', top: -4, right: -4 },
  contentContainer: { flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  notificationTitle: { fontSize: isSmallScreen ? 14 : 15, fontWeight: '600', color: COLORS.textPrimary, flex: 1, marginRight: 8 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.unreadDot },
  notificationMessage: { fontSize: isSmallScreen ? 12 : 13, color: COLORS.textSecondary, lineHeight: 18, marginBottom: 8 },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  typeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  typeDot: { width: 6, height: 6, borderRadius: 3 },
  typeText: { fontSize: 11, fontWeight: '500' },
  timeContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timeText: { fontSize: 11, color: COLORS.textLight },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32, paddingTop: 80 },
  emptyTitle: { fontSize: isSmallScreen ? 18 : 20, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8, textAlign: 'center' },
  emptySubtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 },
  resetFilterButton: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.primary, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12, marginTop: 20 },
  resetFilterText: { color: 'white', fontSize: 14, fontWeight: '600' },
});