// src/screens/citizen/MyFirsScreen.js – Responsive, Dynamic & Polished
import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, RefreshControl, StyleSheet,
  TouchableOpacity, SafeAreaView, StatusBar, Platform,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  FileText, Plus, Search, MapPin, Shield, ChevronRight, Calendar,
} from 'lucide-react-native';

const BASE_URL = 'http://http://localhost:5000/api/api';
const { width } = Dimensions.get('window');
const isSmallScreen = width < 360;

const colors = {
  primary: '#636d79',
  primaryLight: '#7b8590',
  background: '#F5F5F0',
  surface: '#FFFFFF',
  textPrimary: '#1A1A1A',
  textSecondary: '#636d79',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  success: '#2F9E44',
  warning: '#E8590C',
  error: '#E03131',
  info: '#1971C2',
};

const getStatusColor = (status) => {
  const map = {
    draft: colors.textLight,
    pending: colors.warning,
    under_review: colors.info,
    approved: colors.success,
    rejected: colors.error,
    investigation_started: colors.info,
    resolved: colors.success,
    closed: colors.textLight,
  };
  return map[status] || colors.textLight;
};

const getStatusLabel = (status) => {
  const map = {
    draft: 'Draft',
    pending: 'Pending',
    under_review: 'Under Review',
    approved: 'Approved',
    rejected: 'Rejected',
    investigation_started: 'Investigation',
    resolved: 'Resolved',
    closed: 'Closed',
  };
  return map[status] || status;
};

const fetchFirs = async () => {
  const token = await AsyncStorage.getItem('@smartfir_token');
  const res = await fetch(`${BASE_URL}/firs/my-firs`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.firs || [];
};

export function MyFirsScreen({ navigation }) {
  const [firs, setFirs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadFirs = useCallback(async () => {
    try {
      const data = await fetchFirs();
      setFirs(data);
    } catch (err) {
      console.log('Load error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => { loadFirs(); }, [loadFirs]);

  const onRefresh = () => {
    setRefreshing(true);
    loadFirs();
  };

  const filtered = firs.filter(fir => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'pending' && fir.status === 'pending') ||
      (filter === 'active' && ['approved', 'investigation_started'].includes(fir.status)) ||
      (filter === 'resolved' && ['resolved', 'closed'].includes(fir.status));
    const query = search.toLowerCase();
    const matchesSearch = !query ||
      (fir.firNumber || '').toLowerCase().includes(query) ||
      (fir.incidentType || '').toLowerCase().includes(query) ||
      (fir.placeOfIncident || '').toLowerCase().includes(query) ||
      (fir.policeStation || '').toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  });

  const counts = {
    all: firs.length,
    pending: firs.filter(f => f.status === 'pending').length,
    active: firs.filter(f => ['approved', 'investigation_started'].includes(f.status)).length,
    resolved: firs.filter(f => ['resolved', 'closed'].includes(f.status)).length,
  };

  // Navigation helper for cross‑tab
  const navigateToHome = () => {
    const tabNav = navigation.getParent();
    tabNav?.navigate('Home', { screen: 'HomeMain' });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('FIRDetails', { firId: item._id || item.id })}
    >
      <View style={[styles.statusStrip, { backgroundColor: getStatusColor(item.status) }]} />
      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <Text style={styles.firNumber} numberOfLines={1}>
            {item.firNumber || item.id}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusLabel(item.status)}
            </Text>
          </View>
        </View>
        <Text style={styles.incidentType} numberOfLines={1}>
          {item.incidentType || 'FIR'}
        </Text>
        <View style={styles.locationRow}>
          <MapPin size={14} color={colors.textLight} />
          <Text style={styles.locationText} numberOfLines={1}>
            {item.placeOfIncident || item.location || 'Not specified'}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Calendar size={14} color={colors.textLight} />
            <Text style={styles.metaText}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Shield size={14} color={colors.textLight} />
            <Text style={styles.metaText}>{item.policeStation || 'N/A'}</Text>
          </View>
        </View>
      </View>
      <ChevronRight size={20} color={colors.textLight} style={styles.chevron} />
    </TouchableOpacity>
  );

  const EmptyComponent = () => (
    <View style={styles.empty}>
      <FileText size={56} color={colors.textLight} />
      <Text style={styles.emptyTitle}>No FIRs Found</Text>
      <Text style={styles.emptySubtitle}>
        {search ? 'Try a different search.' : 'File your first FIR to get started.'}
      </Text>
      <TouchableOpacity
        style={styles.fileNewButton}
        onPress={navigateToHome}
      >
        <Plus size={20} color="white" />
        <Text style={styles.fileNewText}>File New FIR</Text>
      </TouchableOpacity>
    </View>
  );

  // Responsive filter tabs
  const renderFilterTabs = () => (
    <View style={styles.filterRow}>
      {['all', 'pending', 'active', 'resolved'].map(key => (
        <TouchableOpacity
          key={key}
          style={[styles.filterTab, filter === key && styles.filterTabActive]}
          onPress={() => setFilter(key)}
        >
          <Text style={[styles.filterTabText, filter === key && styles.filterTabTextActive]}>
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </Text>
          <View style={[styles.filterCount, filter === key && styles.filterCountActive]}>
            <Text style={[styles.filterCountText, filter === key && styles.filterCountTextActive]}>
              {counts[key]}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  if (loading && firs.length === 0) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={{ color: colors.textSecondary, fontSize: 16 }}>Loading FIRs...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      <View style={styles.header}>
        
        
      </View>

      {renderFilterTabs()}

      <View style={styles.searchContainer}>
        <Search size={18} color={colors.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by number, type, location..."
          placeholderTextColor={colors.textLight}
          value={search}
          onChangeText={setSearch}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={{ color: colors.textLight, fontSize: 18 }}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item._id || item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        ListEmptyComponent={EmptyComponent}
        showsVerticalScrollIndicator={false}
      />

      {firs.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.8}
          onPress={navigateToHome}
        >
          <Plus size={24} color="white" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 16 : 24, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: '700', color: colors.textPrimary },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 12, gap: 8 },
  filterTab: {
    flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
  },
  filterTabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterTabText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 4 },
  filterTabTextActive: { color: 'white' },
  filterCount: {
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, backgroundColor: colors.border,
  },
  filterCountActive: { backgroundColor: 'rgba(255,255,255,0.3)' },
  filterCountText: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  filterCountTextActive: { color: 'white' },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 16,
    paddingHorizontal: 16, paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: colors.textPrimary },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  card: {
    flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 16, marginBottom: 12,
    borderWidth: 1, borderColor: colors.border, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4,
    elevation: 2,
  },
  statusStrip: { width: 5, height: '100%' },
  cardBody: { flex: 1, padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  firNumber: {
    fontSize: 14, fontWeight: '700', color: colors.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '600' },
  incidentType: { fontSize: isSmallScreen ? 15 : 16, fontWeight: '600', color: colors.textPrimary, marginBottom: 6 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  locationText: { marginLeft: 6, fontSize: 13, color: colors.textSecondary, flex: 1 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: colors.textLight },
  chevron: { alignSelf: 'center', marginRight: 12 },
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: colors.textPrimary, marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 4, textAlign: 'center', marginBottom: 24, paddingHorizontal: 32 },
  fileNewButton: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary,
    paddingVertical: 14, paddingHorizontal: 28, borderRadius: 12, gap: 8,
  },
  fileNewText: { color: 'white', fontWeight: '600', fontSize: 16 },
  fab: {
    position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 6,
  },
});