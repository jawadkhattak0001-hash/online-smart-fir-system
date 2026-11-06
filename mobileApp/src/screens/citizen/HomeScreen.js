// src/screens/citizen/HomeScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  StatusBar, RefreshControl 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  ShieldAlert, FileText, ScanFace, BellRing, 
  ChevronRight, PlusCircle, Shield, LogOut
} from 'lucide-react-native';

const colors = {
  primary: '#2563EB',
  secondary: '#10B981',
  accent: '#7C3AED',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  border: '#E2E8F0',
};

export function HomeScreen({ navigation }) {
  const [userName, setUserName] = useState('Citizen');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('@smartfir_user');
      if (userData) {
        const user = JSON.parse(userData);
        setUserName(user.name || 'Citizen');
      }
    } catch (e) {
      console.log('Error loading user data', e);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('@smartfir_token');
    await AsyncStorage.removeItem('@smartfir_user');
    navigation.replace('Login');
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadUserData();
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoBadge}>
            <Shield size={24} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.greetingText}>Welcome Back 👋</Text>
            <Text style={styles.userName}>{userName}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Banner Card */}
        <View style={styles.aiBanner}>
          <View style={styles.aiBadge}>
            <ScanFace size={16} color="#FFFFFF" />
            <Text style={styles.aiBadgeText}>AI Powered System</Text>
          </View>
          <Text style={styles.aiBannerTitle}>Smart Crime Detection</Text>
          <Text style={styles.aiBannerDesc}>
            Fironix uses Automated Face Recognition & Intelligent FIR Processing to assist law enforcement.
          </Text>
        </View>

        {/* Action Grid Header */}
        <Text style={styles.sectionTitle}>Quick Services</Text>

        {/* Service Cards Grid */}
        <View style={styles.gridContainer}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('FileFir')}
            activeOpacity={0.8}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#DBEAFE' }]}>
              <PlusCircle size={26} color={colors.primary} />
            </View>
            <Text style={styles.cardTitle}>File New FIR</Text>
            <Text style={styles.cardSub}>Register complaint</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('FileFir')}
            activeOpacity={0.8}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#D1FAE5' }]}>
              <FileText size={26} color={colors.secondary} />
            </View>
            <Text style={styles.cardTitle}>My FIRs</Text>
            <Text style={styles.cardSub}>View status</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => {}}
            activeOpacity={0.8}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#F3E8FF' }]}>
              <ScanFace size={26} color={colors.accent} />
            </View>
            <Text style={styles.cardTitle}>AI Face Match</Text>
            <Text style={styles.cardSub}>Crime Database</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => {}}
            activeOpacity={0.8}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#FEE2E2' }]}>
              <ShieldAlert size={26} color="#EF4444" />
            </View>
            <Text style={styles.cardTitle}>Emergency SOS</Text>
            <Text style={styles.cardSub}>Quick Police</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14, backgroundColor: colors.surface,
    borderBottomWidth: 1, borderBottomColor: colors.border
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  logoBadge: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: '#EFF6FF',
    justifyContent: 'center', alignItems: 'center', marginRight: 12
  },
  greetingText: { fontSize: 12, color: colors.textSecondary },
  userName: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary },
  logoutBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#FEE2E2',
    justifyContent: 'center', alignItems: 'center'
  },
  scrollContent: { padding: 20 },
  aiBanner: {
    backgroundColor: colors.accent, borderRadius: 16, padding: 18, marginBottom: 24,
    elevation: 3
  },
  aiBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 8
  },
  aiBadgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600', marginLeft: 6 },
  aiBannerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  aiBannerDesc: { color: '#E9D5FF', fontSize: 12, lineHeight: 18 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 14 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  actionCard: {
    width: '48%', backgroundColor: colors.surface, borderRadius: 14, padding: 16,
    marginBottom: 14, borderWidth: 1, borderColor: colors.border, elevation: 2
  },
  iconCircle: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 14, fontWeight: 'bold', color: colors.textPrimary },
  cardSub: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
});