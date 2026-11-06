// src/screens/FileFirScreen.js
import React, { useState } from 'react';
import { 
  View, Text, Alert, Keyboard, TouchableOpacity,
  ScrollView, TextInput, StyleSheet, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MapPin, Calendar, AlignLeft, ShieldAlert, ArrowLeft } from 'lucide-react-native';
import { API_CONFIG } from '../utils/constants';

const colors = {
  primary: '#3B82F6', background: '#FFFFFF', surface: '#F9FAFB',
  textPrimary: '#111827', textSecondary: '#6B7280', border: '#E5E7EB',
  danger: '#EF4444',
};

export function FileFirScreen({ navigation }) {
  const [incidentType, setIncidentType] = useState('');
  const [location, setLocation] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmitFir = async () => {
    Keyboard.dismiss();

    if (!incidentType || !location || !description) {
      Alert.alert('Missing Fields', 'Please fill in Incident Type, Location, and Description.');
      return;
    }

    setLoading(true);

    try {
      const userToken = await AsyncStorage.getItem('@smartfir_token');
      const userData = await AsyncStorage.getItem('@smartfir_user');
      const user = userData ? JSON.parse(userData) : null;

      const targetUrl = `${API_CONFIG.BASE_URL}/firs`;

      const payload = {
        userId: user?._id || user?.id,
        complainantName: user?.name || 'Citizen',
        cnic: user?.cnic || '',
        phone: user?.phone || '',
        incidentType,
        crimeCategory: incidentType,
        location,
        incidentDate: incidentDate || new Date().toISOString(),
        narrative: description,
        description: description,
      };

      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': userToken ? `Bearer ${userToken}` : ''
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok || response.status === 201 || data.success) {
        Alert.alert('FIR Submitted!', 'Your complaint has been registered successfully.', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Submission Failed', data.message || 'Could not submit FIR.');
      }
    } catch (err) {
      console.log('FIR Submit Error:', err);
      Alert.alert('Connection Error', 'Failed to connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>File New FIR</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Complaint Details</Text>

          <Text style={styles.label}>Incident Category / Type</Text>
          <View style={styles.inputWrapper}>
            <ShieldAlert size={18} color={colors.primary} />
            <TextInput
              value={incidentType}
              onChangeText={setIncidentType}
              placeholder="e.g. Theft, Robbery, Cyber Crime"
              placeholderTextColor="#94a3b8"
              style={styles.textInput}
            />
          </View>

          <Text style={styles.label}>Incident Location</Text>
          <View style={styles.inputWrapper}>
            <MapPin size={18} color={colors.primary} />
            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder="Street, City, Landmark"
              placeholderTextColor="#94a3b8"
              style={styles.textInput}
            />
          </View>

          <Text style={styles.label}>Date & Time of Incident</Text>
          <View style={styles.inputWrapper}>
            <Calendar size={18} color={colors.primary} />
            <TextInput
              value={incidentDate}
              onChangeText={setIncidentDate}
              placeholder="e.g. 2026-09-10"
              placeholderTextColor="#94a3b8"
              style={styles.textInput}
            />
          </View>

          <Text style={styles.label}>Detailed Description</Text>
          <View style={[styles.inputWrapper, { alignItems: 'flex-start', paddingTop: 10 }]}>
            <AlignLeft size={18} color={colors.primary} style={{ marginTop: 2 }} />
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Provide all details about what happened..."
              placeholderTextColor="#94a3b8"
              style={[styles.textInput, { height: 100, textAlignVertical: 'top' }]}
              multiline={true}
              numberOfLines={4}
            />
          </View>

          <TouchableOpacity 
            onPress={handleSubmitFir} 
            disabled={loading}
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          >
            <Text style={styles.submitButtonText}>{loading ? 'Submitting FIR...' : 'Submit FIR'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16 },
  card: { backgroundColor: colors.background },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, marginBottom: 6, marginTop: 10 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 10, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, paddingVertical: 10 },
  textInput: { flex: 1, fontSize: 14, color: colors.textPrimary, marginLeft: 8 },
  submitButton: { marginTop: 24, backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});