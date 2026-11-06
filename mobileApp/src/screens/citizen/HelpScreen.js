// src/screens/citizen/HelpScreen.js – Polished, Human-Centered Design
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Linking,
  Pressable,
  Alert,
  Platform,
  StyleSheet,
  Dimensions,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import {
  HelpCircle,
  Phone,
  MessageSquare,
  Mail,
  Globe,
  Shield,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  MapPin,
  FileText,
} from 'lucide-react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get('window');
const cardGap = 12;
const cardWidth = (width - 32 - cardGap) / 2;

const colors = {
  primary: '#636d79',
  primaryLight: '#7b8590',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  textPrimary: '#212529',
  textSecondary: '#636d79',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  success: '#2F9E44',
  warning: '#E8590C',
  error: '#E03131',
  info: '#1971C2',
};

const faqs = [
  {
    q: 'How do I file an FIR?',
    a: `Use "Record FIR" to speak your complaint, or "Type FIR" to fill in details manually. The system guides you step by step.`,
  },
  {
    q: 'Can I file in Urdu?',
    a: 'Yes. Just select Urdu before recording — the system transcribes and processes both English and Urdu.',
  },
  {
    q: 'How long until approval?',
    a: `Usually 24–48 hours. You'll receive live notifications at each stage. Urgent cases may move faster.`,
  },
  {
    q: 'Can I edit a submitted FIR?',
    a: `Only if it's rejected by police. Otherwise contact the assigned officer for changes.`,
  },
  {
    q: 'Is my data safe?',
    a: `Yes — AES‑256 end‑to‑end encryption on government‑approved servers, fully compliant with Pakistan's data laws.`,
  },
];

const quickActions = [
  { icon: Phone, label: 'Call Police', number: '15', color: colors.error },
  { icon: Mail, label: 'Email Us', action: 'email', color: colors.info },
  { icon: Globe, label: 'Website', action: 'website', color: colors.success },
  { icon: MessageSquare, label: 'Live Chat', action: 'chat', color: '#7C3AED' },
];

const helplines = [
  { icon: AlertTriangle, label: 'Police', number: '15', color: '#E03131', bg: '#FEF2F2' },
  { icon: Shield, label: 'Women', number: '1099', color: '#7C3AED', bg: '#F5F3FF' },
  { icon: MapPin, label: 'Traffic', number: '1915', color: '#1D4ED8', bg: '#EFF6FF' },
  { icon: Globe, label: 'Cyber', number: '1991', color: '#059669', bg: '#ECFDF5' },
];

export function HelpScreen({ navigation }) {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (i) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenFaq(openFaq === i ? null : i);
  };

  const call = (n) => Linking.openURL(`tel:${n}`);
  const email = () => Linking.openURL('mailto:support@smartfir.gov.pk');
  const web = () => Linking.openURL('https://smartfir.gov.pk');

  const doAction = (a) => {
    if (a === 'email') email();
    else if (a === 'website') web();
    else if (a === 'chat') {
      Alert.alert('Live Chat', 'Available 9 AM–5 PM. Send an email instead?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Email', onPress: email },
      ]);
    }
  };

  return (
    <ScrollView style={styles.body} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      
      {/* Hero */}
      <View style={styles.hero}>
       
      </View>

      {/* Emergency Banner */}
      <Pressable style={styles.emergency} onPress={() => call('15')}>
        <AlertTriangle size={26} color="white" />
        <View style={styles.emergencyText}>
          <Text style={styles.emergencyLabel}>Emergency — tap to call</Text>
          <Text style={styles.emergencyNum}>15</Text>
        </View>
        <Phone size={22} color="white" />
      </Pressable>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickRow}>
        {quickActions.map((a, i) => (
          <Pressable
            key={i}
            style={styles.quickCard}
            onPress={() => (a.number ? call(a.number) : doAction(a.action))}
          >
            <View style={[styles.quickIcon, { backgroundColor: a.color + '12' }]}>
              <a.icon size={22} color={a.color} />
            </View>
            <Text style={styles.quickLabel}>{a.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* FAQs */}
      <Text style={styles.sectionTitle}>Common Questions</Text>
      <View style={styles.faqBox}>
        {faqs.map((f, i) => (
          <Pressable key={i} style={styles.faqItem} onPress={() => toggleFaq(i)}>
            <View style={styles.faqHeader}>
              <Text style={styles.faqQ}>{f.q}</Text>
              {openFaq === i ? (
                <ChevronUp size={18} color={colors.textLight} />
              ) : (
                <ChevronDown size={18} color={colors.textLight} />
              )}
            </View>
            {openFaq === i && <Text style={styles.faqA}>{f.a}</Text>}
          </Pressable>
        ))}
      </View>

      {/* Helplines */}
      <Text style={styles.sectionTitle}>Helpline Numbers</Text>
      <View style={styles.helpRow}>
        {helplines.map((h, i) => (
          <Pressable key={i} style={[styles.helpCard, { backgroundColor: h.bg }]} onPress={() => call(h.number)}>
            <h.icon size={26} color={h.color} />
            <Text style={styles.helpLabel}>{h.label}</Text>
            <Text style={[styles.helpNum, { color: h.color }]}>{h.number}</Text>
          </Pressable>
        ))}
      </View>

      {/* Steps */}
      <Text style={styles.sectionTitle}>Filing an FIR — Step by Step</Text>
      <View style={styles.stepsBox}>
        {[
          'Choose "Record FIR" or "Type FIR"',
          'Provide date, time, location, description',
          'Review the auto‑filled draft & submit',
          'Receive FIR number & track in My FIRs',
        ].map((s, i) => (
          <View key={i} style={styles.stepRow}>
            <View style={styles.stepNum}>
              <Text style={styles.stepNumText}>{i + 1}</Text>
            </View>
            <Text style={styles.stepText}>{s}</Text>
          </View>
        ))}
      </View>

      {/* Legal */}
      <View style={styles.legal}>
        <Shield size={18} color={colors.textSecondary} style={{ marginRight: 10, marginTop: 2 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.legalTitle}>Legal Note</Text>
          <Text style={styles.legalText}>
            FIR filing is governed by the Pakistan Penal Code and CrPC. False information may lead to legal action under Section 182 PPC.
          </Text>
        </View>
      </View>

      {/* Footer links */}
      <View style={styles.footer}>
        <Pressable style={styles.footerLink} onPress={() => navigation.navigate('Privacy')}>
          <Text style={styles.footerLinkText}>Privacy Policy</Text>
          <ExternalLink size={14} color={colors.textLight} />
        </Pressable>
        <Pressable style={styles.footerLink} onPress={email}>
          <Text style={styles.footerLinkText}>Contact Support</Text>
          <ExternalLink size={14} color={colors.textLight} />
        </Pressable>
      </View>

      <View style={{ height: 48 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 },

  hero: { marginBottom: 20, marginTop: 12 },
  heroTitle: { fontSize: 28, fontWeight: '800', color: colors.textPrimary },
  heroSub: { fontSize: 15, color: colors.textSecondary, marginTop: 4 },

  emergency: {
    backgroundColor: colors.error,
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    elevation: 4,
    shadowColor: colors.error,
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  emergencyText: { flex: 1, marginLeft: 14 },
  emergencyLabel: { color: 'white', fontWeight: '600', fontSize: 14 },
  emergencyNum: { color: 'white', fontWeight: '900', fontSize: 26, marginTop: 2 },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
    marginTop: 8,
  },

  // Quick actions
  quickRow: { flexDirection: 'row', gap: cardGap, marginBottom: 24 },
  quickCard: {
    width: cardWidth,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 3,
  },
  quickIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  quickLabel: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },

  // FAQs
  faqBox: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 24,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 14,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQ: { fontSize: 15, fontWeight: '600', color: colors.textPrimary, flex: 1, marginRight: 8 },
  faqA: { fontSize: 14, color: colors.textSecondary, lineHeight: 22, marginTop: 8 },

  // Helplines
  helpRow: { flexDirection: 'row', flexWrap: 'wrap', gap: cardGap, marginBottom: 24 },
  helpCard: {
    width: cardWidth,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  helpLabel: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginTop: 10 },
  helpNum: { fontSize: 18, fontWeight: '800', marginTop: 6 },

  // Steps
  stepsBox: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    marginBottom: 24,
  },
  stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  stepNumText: { color: 'white', fontWeight: '700', fontSize: 13 },
  stepText: { flex: 1, fontSize: 14, color: colors.textSecondary, lineHeight: 20 },

  // Legal
  legal: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  legalTitle: { fontWeight: '600', color: colors.textPrimary, marginBottom: 4 },
  legalText: { fontSize: 13, color: colors.textSecondary, lineHeight: 19 },

  // Footer
  footer: { gap: 8, marginTop: 8 },
  footerLink: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  footerLinkText: { fontSize: 15, color: colors.primary, fontWeight: '500' },
});