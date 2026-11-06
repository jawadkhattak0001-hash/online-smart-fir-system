// src/screens/citizen/EmergencyScreen.js – Clean, Professional, Responsive
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Dimensions,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  TextInput,
  Share,
} from 'react-native';
import {
  Phone,
  Shield,
  Heart,
  AlertTriangle,
  Flame,
  Users,
  Search,
  Info,
  Plus,
  X,
  ChevronRight,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 375;

const COLORS = {
  primary: '#636d79',
  primaryLight: '#7b8590',
  background: '#FFFFFF',
  surface: '#F8F9FA',
  textPrimary: '#212529',
  textSecondary: '#636d79',
  textLight: '#ADB5BD',
  border: '#DEE2E6',
  emergency: '#E03131',
  emergencyLight: '#FFE3E3',
  police: '#1971C2',
  medical: '#2F9E44',
  fire: '#E8590C',
  women: '#C2255C',
};

const DEFAULT_CONTACTS = [
  {
    id: 'police',
    category: 'Police',
    color: COLORS.police,
    icon: Shield,
    contacts: [
      { id: '1', name: 'Police Emergency', number: '15' },
      { id: '2', name: 'Highway Police', number: '130' },
      { id: '3', name: 'Traffic Police', number: '1915' },
    ],
  },
  {
    id: 'medical',
    category: 'Medical',
    color: COLORS.medical,
    icon: Heart,
    contacts: [
      { id: '4', name: 'Ambulance (Rescue)', number: '1122' },
      { id: '5', name: 'Blood Bank', number: '1121' },
    ],
  },
  {
    id: 'fire',
    category: 'Fire',
    color: COLORS.fire,
    icon: Flame,
    contacts: [
      { id: '6', name: 'Fire Brigade', number: '16' },
      { id: '7', name: 'Rescue 1122', number: '1122' },
    ],
  },
  {
    id: 'women',
    category: 'Women Help',
    color: COLORS.women,
    icon: Users,
    contacts: [
      { id: '8', name: 'Women Helpline', number: '1099' },
      { id: '9', name: 'Child Protection', number: '1121' },
    ],
  },
];

export function EmergencyScreen({ navigation }) {
  const [customContacts, setCustomContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState('police');
  const [showAdd, setShowAdd] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', number: '' });

  // load saved custom contacts
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('@emergency_contacts');
        if (saved) setCustomContacts(JSON.parse(saved));
      } catch {}
    })();
  }, []);

  const saveCustom = async (list) => {
    await AsyncStorage.setItem('@emergency_contacts', JSON.stringify(list));
  };

  const handleCall = (number, name) => {
    Alert.alert(`Call ${name}?`, number, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Call',
        onPress: () => Linking.openURL(`tel:${number}`).catch(() =>
          Alert.alert('Error', 'Cannot make a call on this device.')
        ),
      },
    ]);
  };

  const handleAdd = () => {
    if (!newContact.name.trim() || !newContact.number.trim()) {
      Alert.alert('Required', 'Please enter name and number.');
      return;
    }
    const updated = [
      ...customContacts,
      { id: Date.now().toString(), ...newContact },
    ];
    setCustomContacts(updated);
    saveCustom(updated);
    setNewContact({ name: '', number: '' });
    setShowAdd(false);
  };

  const handleDelete = (id) => {
    const updated = customContacts.filter((c) => c.id !== id);
    setCustomContacts(updated);
    saveCustom(updated);
  };

  const toggleCategory = (id) => {
    setExpanded((prev) => (prev === id ? null : id));
  };

  const filteredDefault = search
    ? DEFAULT_CONTACTS.reduce((acc, cat) => {
        const filtered = cat.contacts.filter(
          (c) =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.number.includes(search)
        );
        if (filtered.length) acc.push({ ...cat, contacts: filtered });
        return acc;
      }, [])
    : DEFAULT_CONTACTS;

  const filteredCustom = search
    ? customContacts.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.number.includes(search)
      )
    : customContacts;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Emergency Contacts</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setShowAdd(true)}
          >
            <Plus size={18} color="white" />
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>Tap any number to dial instantly</Text>

        {/* Search */}
        <View style={styles.searchBox}>
          <Search size={18} color={COLORS.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search contacts..."
            placeholderTextColor={COLORS.textLight}
            value={search}
            onChangeText={setSearch}
          />
          {search !== '' && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <X size={18} color={COLORS.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* SOS Button */}
        <View style={styles.sosWrapper}>
          <TouchableOpacity
            style={styles.sosBtn}
            onPress={() => handleCall('15', 'Police')}
          >
            <Shield size={32} color="white" />
            <Text style={styles.sosText}>EMERGENCY</Text>
            <Text style={styles.sosNumber}>15</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Dials */}
        <View style={styles.quickGrid}>
          {[
            { num: '1122', lab: 'Ambulance', icon: Heart, color: COLORS.medical },
            { num: '16', lab: 'Fire', icon: Flame, color: COLORS.fire },
            { num: '1099', lab: 'Women', icon: Users, color: COLORS.women },
            { num: '15', lab: 'Police', icon: Shield, color: COLORS.police },
          ].map((q) => (
            <TouchableOpacity
              key={q.num}
              style={styles.quickCard}
              onPress={() => handleCall(q.num, q.lab)}
            >
              <View style={[styles.quickIcon, { backgroundColor: q.color + '15' }]}>
                <q.icon size={22} color={q.color} />
              </View>
              <Text style={[styles.quickNum, { color: q.color }]}>{q.num}</Text>
              <Text style={styles.quickLab}>{q.lab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Official Categories */}
        {filteredDefault.map((cat) => {
          const isOpen = expanded === cat.id;
          const Icon = cat.icon;
          return (
            <View key={cat.id} style={styles.category}>
              <TouchableOpacity
                style={styles.catHeader}
                onPress={() => toggleCategory(cat.id)}
              >
                <View style={styles.catHeaderLeft}>
                  <View
                    style={[
                      styles.catIcon,
                      { backgroundColor: cat.color + '15' },
                    ]}
                  >
                    <Icon size={20} color={cat.color} />
                  </View>
                  <Text style={styles.catTitle}>{cat.category}</Text>
                </View>
                <ChevronRight
                  size={20}
                  color={cat.color}
                  style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}
                />
              </TouchableOpacity>
              {isOpen && (
                <View style={styles.contactList}>
                  {cat.contacts.map((c) => (
                    <View key={c.id} style={styles.contactRow}>
                      <View style={styles.contactInfo}>
                        <Text style={styles.contactName}>{c.name}</Text>
                        <Text style={styles.contactNumber}>{c.number}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.callBtn}
                        onPress={() => handleCall(c.number, c.name)}
                      >
                        <Phone size={18} color="white" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        {/* Custom Contacts */}
        {filteredCustom.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Your Contacts</Text>
            {filteredCustom.map((c) => (
              <View key={c.id} style={styles.contactRow}>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{c.name}</Text>
                  <Text style={styles.contactNumber}>{c.number}</Text>
                </View>
                <TouchableOpacity
                  style={styles.callBtn}
                  onPress={() => handleCall(c.number, c.name)}
                >
                  <Phone size={18} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.delBtn}
                  onPress={() => handleDelete(c.id)}
                >
                  <X size={16} color={COLORS.emergency} />
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Add Contact Modal */}
      {showAdd && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Contact</Text>
              <TouchableOpacity onPress={() => setShowAdd(false)}>
                <X size={20} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.modalInput}
              placeholder="Name"
              value={newContact.name}
              onChangeText={(t) => setNewContact({ ...newContact, name: t })}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Phone"
              keyboardType="phone-pad"
              value={newContact.number}
              onChangeText={(t) => setNewContact({ ...newContact, number: t })}
            />
            <TouchableOpacity style={styles.modalAddBtn} onPress={handleAdd}>
              <Text style={styles.modalAddText}>Save Contact</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 16 : 24,
    paddingBottom: 12,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: { fontSize: 26, fontWeight: '700', color: COLORS.textPrimary },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    gap: 6,
  },
  addBtnText: { color: 'white', fontWeight: '600', fontSize: 14 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 12 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: COLORS.textPrimary },
  scroll: { paddingHorizontal: 16, paddingBottom: 20 },
  sosWrapper: { alignItems: 'center', marginVertical: 20 },
  sosBtn: {
    width: width * 0.38,
    aspectRatio: 1,
    borderRadius: (width * 0.38) / 2,
    backgroundColor: COLORS.emergency,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.emergencyLight,
    elevation: 6,
  },
  sosText: { color: 'white', fontSize: 16, fontWeight: '800', letterSpacing: 2 },
  sosNumber: { color: 'white', fontSize: 32, fontWeight: '900', marginTop: 4 },
  quickGrid: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  quickCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickNum: { fontSize: 18, fontWeight: '700', marginBottom: 2 },
  quickLab: { fontSize: 11, color: COLORS.textSecondary },
  category: { marginBottom: 12 },
  catHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  catHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  catIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catTitle: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  contactList: { marginTop: 8, gap: 8 },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  contactNumber: { fontSize: 13, color: COLORS.primary, marginTop: 2, fontWeight: '700' },
  callBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.emergency,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    elevation: 2,
  },
  delBtn: {
    marginLeft: 8,
    padding: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 10,
    marginTop: 16,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
    zIndex: 10,
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  modalInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalAddBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  modalAddText: { color: 'white', fontWeight: '600', fontSize: 15 },
});