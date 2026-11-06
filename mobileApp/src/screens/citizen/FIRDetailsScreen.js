// src/screens/citizen/FIRDetailsScreen.js – Dynamic, Professional, No NativeWind
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Share,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  FileText,
  Download,
  Edit,
  RefreshCw,
  Phone,
  MapPin,
  Calendar,
  Clock,
  User,
  Shield,
  AlertCircle,
  Copy,
  MessageSquare,
  ChevronRight,
  CheckCircle,
  XCircle,
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

// ─── API Helper ──────────────────────────────────────────
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

// ─── Helper functions ─────────────────────────────────────
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

// ─── Component ────────────────────────────────────────────
export function FIRDetailsScreen({ route, navigation }) {
  const { firId } = route.params || {};
  const [fir, setFir] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadFIR();
  }, [firId]);

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

  const handleCall = (number) => {
    if (number) Linking.openURL(`tel:${number}`);
  };

  const handleDownloadPDF = () => {
    if (!fir) return;
    // Generate official FIR HTML (using the same template as DraftFirScreen)
    const html = generateFIRHTML(fir);
    if (Platform.OS === 'web') {
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `FIR-${fir.firNumber || fir._id}.html`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } else {
      Share.share({ message: html, title: `FIR-${fir.firNumber || fir._id}` });
    }
  };

  const handleEditResubmit = () => {
    navigation.navigate('DraftFIR', { mode: 'edit', existingData: fir });
  };

  const handleContactOfficer = () => {
    const officer = fir?.assignedOfficer;
    const contact = fir?.officerContact;
    if (!officer && !contact) {
      Alert.alert('No officer assigned', 'An officer has not been assigned to this case yet.');
      return;
    }
    Alert.alert('Contact Officer', `${officer || 'Officer'}\n${contact || 'No contact available'}`, [
      { text: 'Cancel', style: 'cancel' },
      ...(contact ? [{ text: 'Call', onPress: () => handleCall(contact) }] : []),
      { text: 'Copy Number', onPress: () => Clipboard.setString(contact || '') },
    ]);
  };

  const handleCopyFirNumber = () => {
    if (fir?.firNumber) {
      Clipboard.setString(fir.firNumber);
      Alert.alert('Copied', 'FIR number copied to clipboard.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.textSecondary, marginTop: 12 }}>Loading FIR details...</Text>
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <Text style={styles.firNumber} selectable>{fir.firNumber || fir._id}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
            </View>
          </View>
          <Text style={styles.incidentType}>{fir.incidentType || 'FIR'}</Text>
          {fir.policeStation && (
            <View style={styles.metaRow}>
              <Shield size={14} color={colors.textLight} />
              <Text style={styles.metaText}>{fir.policeStation}</Text>
            </View>
          )}
          <View style={styles.metaRow}>
            <Calendar size={14} color={colors.textLight} />
            <Text style={styles.metaText}>{formatDateTime(fir.createdAt)}</Text>
          </View>
        </View>

        {/* Complainant Details */}
        {fir.complainantName && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Complainant</Text>
            <DetailRow icon={User} label="Name" value={fir.complainantName} />
            {fir.fatherName && <DetailRow icon={User} label="Father Name" value={fir.fatherName} />}
            {fir.cnic && <DetailRow icon={FileText} label="CNIC" value={fir.cnic} />}
            {fir.contactNumber && <DetailRow icon={Phone} label="Phone" value={fir.contactNumber} />}
            {fir.address && <DetailRow icon={MapPin} label="Address" value={fir.address} />}
          </View>
        )}

        {/* Incident Details */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Incident Details</Text>
          {fir.incidentType && <DetailRow icon={AlertCircle} label="Type" value={fir.incidentType} />}
          <DetailRow icon={Calendar} label="Date" value={formatDate(fir.dateOfIncident)} />
          {fir.timeOfIncident && <DetailRow icon={Clock} label="Time" value={fir.timeOfIncident} />}
          {fir.placeOfIncident && <DetailRow icon={MapPin} label="Place" value={fir.placeOfIncident} />}
          {fir.ppcSections && <DetailRow icon={Shield} label="PPC Sections" value={fir.ppcSections} />}
        </View>

        {/* Narrative */}
        {fir.narrative && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Narrative</Text>
            <Text style={styles.narrativeText}>{fir.narrative}</Text>
          </View>
        )}

        {/* Accused */}
        {fir.accusedName && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Accused</Text>
            <DetailRow icon={User} label="Name" value={fir.accusedName} />
            {fir.accusedDescription && <DetailRow icon={FileText} label="Description" value={fir.accusedDescription} />}
          </View>
        )}

        {/* Witnesses */}
        {(fir.witnessName || fir.witnessContact) && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Witnesses</Text>
            {fir.witnessName && <DetailRow icon={User} label="Name" value={fir.witnessName} />}
            {fir.witnessContact && <DetailRow icon={Phone} label="Contact" value={fir.witnessContact} />}
          </View>
        )}

        {/* Assigned Officer */}
        {fir.assignedOfficer && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Investigation Officer</Text>
            <DetailRow icon={Shield} label="Name" value={fir.assignedOfficer} />
            {fir.officerContact && <DetailRow icon={Phone} label="Contact" value={fir.officerContact} />}
            <Pressable style={styles.contactBtn} onPress={handleContactOfficer}>
              <Phone size={16} color="white" />
              <Text style={styles.contactBtnText}>Contact Officer</Text>
            </Pressable>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Pressable style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={handleDownloadPDF}>
            <Download size={18} color="white" />
            <Text style={styles.actionBtnText}>Download FIR (PDF)</Text>
          </Pressable>

          {fir.status === 'rejected' && (
            <Pressable style={[styles.actionBtn, { backgroundColor: colors.warning }]} onPress={handleEditResubmit}>
              <Edit size={18} color="white" />
              <Text style={styles.actionBtnText}>Edit & Resubmit</Text>
            </Pressable>
          )}

          <Pressable
            style={[styles.actionBtn, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.primary }]}
            onPress={() => navigation.navigate('TrackFIR', { firId: fir._id || fir.id })}
          >
            <RefreshCw size={18} color={colors.primary} />
            <Text style={[styles.actionBtnText, { color: colors.primary }]}>View Timeline</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Mini Components ───────────────────────────────────────
const DetailRow = ({ icon: Icon, label, value }) => (
  <View style={styles.detailRow}>
    <Icon size={16} color={colors.textLight} style={styles.detailIcon} />
    <Text style={styles.detailLabel}>{label}:</Text>
    <Text style={styles.detailValue} selectable>{value || '—'}</Text>
  </View>
);

// ─── Generate official FIR HTML for download ───────────────
const generateFIRHTML = (d) => {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>FIR - ${d.firNumber || d._id}</title>
  <style>
    @page { margin: 0.6in; size: A4; }
    body { font-family: Arial, sans-serif; font-size: 13px; color: #000; line-height: 1.6; padding: 20px; }
    .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px; }
    .fir-number { font-size: 20px; font-weight: bold; margin: 10px 0; }
    .section { margin: 20px 0; padding: 15px; border: 1px solid #000; background: #fafafa; }
    .section-title { font-weight: bold; font-size: 14px; margin-bottom: 10px; border-bottom: 1px solid #000; padding-bottom: 5px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .field { margin-bottom: 6px; }
    .label { font-weight: bold; }
    .footer { margin-top: 40px; text-align: center; border-top: 1px solid #000; padding-top: 15px; }
  </style>
</head>
<body>
  <div class="header">
    <h3>GOVERNMENT OF PAKISTAN</h3>
    <h4>POLICE DEPARTMENT</h4>
    <h4>FIRST INFORMATION REPORT</h4>
    <p>(Under Section 154 CrPC)</p>
    <p class="fir-number">FIR No: ${d.firNumber || d._id}</p>
    <p>Police Station: ${d.policeStation || ''}</p>
    <p>Date: ${d.dateOfIncident || d.createdAt?.split('T')[0] || ''}</p>
  </div>
  <div class="section"><div class="section-title">1. COMPLAINANT DETAILS</div>
    <div class="grid">
      <div class="field"><span class="label">Name:</span> ${d.complainantName || ''}</div>
      <div class="field"><span class="label">Father/Husband:</span> ${d.fatherName || ''}</div>
      <div class="field"><span class="label">CNIC:</span> ${d.cnic || ''}</div>
      <div class="field"><span class="label">Phone:</span> ${d.contactNumber || ''}</div>
      <div class="field" style="grid-column: span 2"><span class="label">Address:</span> ${d.address || ''}</div>
    </div>
  </div>
  <div class="section"><div class="section-title">2. INCIDENT DETAILS</div>
    <div class="grid">
      <div class="field"><span class="label">Date of Incident:</span> ${d.dateOfIncident || ''}</div>
      <div class="field"><span class="label">Time:</span> ${d.timeOfIncident || ''}</div>
      <div class="field" style="grid-column: span 2"><span class="label">Place of Incident:</span> ${d.placeOfIncident || ''}</div>
    </div>
  </div>
  <div class="section"><div class="section-title">3. ACCUSED DETAILS</div>
    <div class="field"><span class="label">Name:</span> ${d.accusedName || 'Unknown'}</div>
    <div class="field"><span class="label">Description:</span> ${d.accusedDescription || 'N/A'}</div>
  </div>
  <div class="section"><div class="section-title">4. OFFENCE DETAILS</div>
    <div class="field"><span class="label">Offence Type:</span> ${d.incidentType || ''}</div>
    <div class="field"><span class="label">PPC Sections:</span> ${d.ppcSections || ''}</div>
  </div>
  <div class="section"><div class="section-title">5. INCIDENT NARRATIVE</div>
    <p>${d.narrative || ''}</p>
  </div>
  <div class="section"><div class="section-title">6. WITNESSES</div>
    <p>${d.witnessName ? `${d.witnessName}, ${d.witnessContact}` : 'None'}</p>
  </div>
  <div class="footer">
    <p>Complainant Signature: ______________</p>
    <p>Station House Officer Signature: ______________</p>
    <p>Official Stamp</p>
  </div>
</body>
</html>`;
};

// ─── Styles ────────────────────────────────────────────────
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
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  firNumber: { fontSize: 16, fontWeight: '800', color: colors.textPrimary, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '700' },
  incidentType: { fontSize: 22, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  metaText: { fontSize: 13, color: colors.textSecondary, marginLeft: 6 },
  sectionCard: {
    backgroundColor: colors.surface, borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: colors.border, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 2, elevation: 2,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, marginBottom: 14, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 8 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  detailIcon: { marginRight: 10 },
  detailLabel: { fontSize: 14, fontWeight: '600', color: colors.textSecondary, width: 80 },
  detailValue: { flex: 1, fontSize: 14, color: colors.textPrimary, fontWeight: '500' },
  narrativeText: { fontSize: 14, color: colors.textSecondary, lineHeight: 22 },
  contactBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 12, marginTop: 12,
    gap: 8,
  },
  contactBtnText: { color: 'white', fontWeight: '700', fontSize: 15 },
  actions: { gap: 12, marginTop: 8 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: 12, paddingVertical: 16, gap: 8,
  },
  actionBtnText: { color: 'white', fontWeight: '700', fontSize: 16 },
  errorTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginTop: 16 },
  errorMessage: { fontSize: 14, color: colors.textSecondary, marginTop: 8, textAlign: 'center' },
  retryBtn: { marginTop: 16, paddingVertical: 10, paddingHorizontal: 24, borderRadius: 8, backgroundColor: colors.primary },
  retryText: { color: 'white', fontWeight: '600' },
});