// src/screens/citizen/TrackFirScreen.js – Dynamic, Backend‑Driven, Professional UI
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  FileText,
  Phone,
  MapPin,
  Clock,
  Shield,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  RefreshCw,
} from 'lucide-react-native';

const BASE_URL = 'http://http://localhost:5000/api/api';

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
  info: '#1971C2',
};

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

export function TrackFirScreen({ route, navigation }) {
  const { firId } = route.params || {};
  const [fir, setFir] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadFIR = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiFetch(`/firs/${firId}`);
      setFir(data.fir);
    } catch (err) {
      setError(err.message || 'Failed to load FIR details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFIR();
  }, [firId]);

  const handleCall = (number) => {
    if (number) Linking.openURL(`tel:${number}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Build timeline steps from actual FIR status (simplified)
  const getTimelineSteps = () => {
    if (!fir) return [];
    const steps = [];
    const statusOrder = ['pending', 'under_review', 'approved', 'investigation_started', 'resolved', 'closed'];
    const currentIndex = statusOrder.indexOf(fir.status);
    
    steps.push({
      title: 'FIR Submitted',
      description: 'FIR has been registered',
      date: fir.createdAt,
      completed: true,
    });

    if (currentIndex >= 1) {
      steps.push({
        title: 'Under Review',
        description: 'Station admin is reviewing',
        date: fir.updatedAt,
        completed: true,
      });
    }

    if (currentIndex >= 2) {
      steps.push({
        title: 'Approved',
        description: 'FIR has been approved',
        date: fir.updatedAt,
        completed: true,
      });
    }

    if (currentIndex >= 3) {
      steps.push({
        title: 'Investigation Started',
        description: fir.assignedOfficer ? `Assigned to ${fir.assignedOfficer}` : 'Officer assigned',
        date: fir.updatedAt,
        completed: true,
        current: fir.status === 'investigation_started',
      });
    }

    if (currentIndex >= 4) {
      steps.push({
        title: 'Resolved',
        description: 'Case has been resolved',
        date: fir.updatedAt,
        completed: true,
      });
    }

    if (currentIndex === 5) {
      steps.push({
        title: 'Closed',
        description: 'Case closed',
        date: fir.updatedAt,
        completed: true,
      });
    }

    // Add pending steps based on current status
    if (fir.status === 'rejected') {
      steps.push({
        title: 'Rejected',
        description: fir.rejectionReason || 'FIR was rejected',
        date: fir.updatedAt,
        completed: true,
        isRejected: true,
      });
    }

    return steps;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.textSecondary, marginTop: 12 }}>Loading timeline...</Text>
      </SafeAreaView>
    );
  }

  if (error || !fir) {
    return (
      <SafeAreaView style={styles.centered}>
        <AlertCircle size={48} color={colors.error} />
        <Text style={styles.errorTitle}>Error Loading FIR</Text>
        <Text style={styles.errorMessage}>{error || 'FIR not found'}</Text>
        <Pressable style={styles.retryBtn} onPress={loadFIR}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const statusColor = getStatusColor(fir.status);
  const statusLabel = getStatusLabel(fir.status);
  const timelineSteps = getTimelineSteps();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.headerCard}>
          <Text style={styles.firNumber} selectable>{fir.firNumber || fir._id}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
          {fir.policeStation && (
            <View style={styles.metaRow}>
              <Shield size={14} color={colors.textLight} />
              <Text style={styles.metaText}>{fir.policeStation}</Text>
            </View>
          )}
          {fir.createdAt && (
            <View style={styles.metaRow}>
              <Clock size={14} color={colors.textLight} />
              <Text style={styles.metaText}>Filed: {formatDateTime(fir.createdAt)}</Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Pressable
            style={styles.quickActionBtn}
            onPress={() => navigation.navigate('FIRDetails', { firId: fir._id || fir.id })}
          >
            <FileText size={18} color={colors.primary} />
            <Text style={styles.quickActionText}>View Details</Text>
          </Pressable>
          {fir.officerContact && (
            <Pressable
              style={styles.quickActionBtn}
              onPress={() => handleCall(fir.officerContact)}
            >
              <Phone size={18} color={colors.success} />
              <Text style={styles.quickActionText}>Call Officer</Text>
            </Pressable>
          )}
        </View>

        {/* Officer Info */}
        {fir.assignedOfficer && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Investigating Officer</Text>
            <View style={styles.detailRow}>
              <Shield size={16} color={colors.textLight} />
              <Text style={styles.detailValue}>{fir.assignedOfficer}</Text>
            </View>
            {fir.officerContact && (
              <View style={styles.detailRow}>
                <Phone size={16} color={colors.textLight} />
                <Text style={styles.detailValue}>{fir.officerContact}</Text>
              </View>
            )}
          </View>
        )}

        {/* Timeline */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Case Timeline</Text>
          <View style={styles.timeline}>
            {timelineSteps.map((step, index) => (
              <View key={index} style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <View style={[
                    styles.timelineDot,
                    { backgroundColor: step.completed ? (step.isRejected ? colors.error : colors.primary) : colors.textLight }
                  ]} />
                  {index < timelineSteps.length - 1 && <View style={styles.timelineLine} />}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={[styles.timelineTitle, step.current && styles.timelineTitleCurrent]}>
                    {step.title}
                  </Text>
                  {step.description && (
                    <Text style={styles.timelineDescription}>{step.description}</Text>
                  )}
                  {step.date && (
                    <Text style={styles.timelineDate}>{formatDateTime(step.date)}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Refresh */}
        <Pressable style={styles.refreshBtn} onPress={loadFIR}>
          <RefreshCw size={16} color={colors.primary} />
          <Text style={styles.refreshText}>Refresh Status</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, padding: 20 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  headerCard: {
    backgroundColor: colors.surface, borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: colors.border, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 3,
  },
  firNumber: { fontSize: 16, fontWeight: '800', color: colors.textPrimary, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', marginBottom: 10 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 10 },
  statusText: { fontSize: 12, fontWeight: '700' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  metaText: { fontSize: 13, color: colors.textSecondary, marginLeft: 6 },
  quickActions: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  quickActionBtn: {
    flex: 1, backgroundColor: colors.surface, borderRadius: 12, padding: 14,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border,
    flexDirection: 'row', gap: 8,
  },
  quickActionText: { fontWeight: '600', color: colors.textPrimary, fontSize: 14 },
  sectionCard: {
    backgroundColor: colors.surface, borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: colors.border, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 2, elevation: 2,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, marginBottom: 14, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 8 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
  detailValue: { fontSize: 14, color: colors.textPrimary, fontWeight: '500' },
  timeline: { marginTop: 8 },
  timelineItem: { flexDirection: 'row', marginBottom: 20 },
  timelineLeft: { alignItems: 'center', width: 30, marginRight: 12 },
  timelineDot: { width: 14, height: 14, borderRadius: 7, zIndex: 1 },
  timelineLine: { flex: 1, width: 2, backgroundColor: colors.border, marginTop: 4 },
  timelineContent: { flex: 1, paddingBottom: 8 },
  timelineTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 2 },
  timelineTitleCurrent: { color: colors.info },
  timelineDescription: { fontSize: 13, color: colors.textSecondary, lineHeight: 18, marginBottom: 4 },
  timelineDate: { fontSize: 11, color: colors.textLight },
  refreshBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16, paddingVertical: 14 },
  refreshText: { color: colors.primary, fontWeight: '600', fontSize: 15 },
  errorTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginTop: 16 },
  errorMessage: { fontSize: 14, color: colors.textSecondary, marginTop: 8, textAlign: 'center' },
  retryBtn: { marginTop: 16, paddingVertical: 10, paddingHorizontal: 24, borderRadius: 8, backgroundColor: colors.primary },
  retryText: { color: 'white', fontWeight: '600' },
});