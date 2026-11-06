// src/screens/citizen/TranscriptionScreen.js — Clean, Human‑Centered Design
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TextInput, Alert,
  SafeAreaView, StyleSheet, Platform, StatusBar,
  TouchableOpacity, Clipboard, Animated, ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ArrowLeft, Mic, Copy, Edit, Save, RefreshCw,
  FileText, CheckCircle, ChevronRight, Zap,
} from 'lucide-react-native';

const colors = {
  primary: '#636d79',
  primaryLight: '#7b8590',
  background: '#FFFFFF',
  surface: '#F8F9FA',
  textPrimary: '#212529',
  textSecondary: '#636d79',
  textLight: '#ADB5BD',
  border: '#DEE2E6',
  success: '#2F9E44',
  warning: '#E8590C',
  error: '#E03131',
};

export function TranscriptionScreen({ route, navigation }) {
  const {
    transcript: initialTranscript = '',
    language = 'english',
    mode = 'voice',
    recordingId,
    extractedData: initialExtractedData = {},
  } = route.params || {};

  const [editedTranscript, setEditedTranscript] = useState(initialTranscript);
  const [isEditing, setIsEditing] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [originalTranscript] = useState(initialTranscript);
  const [changesMade, setChangesMade] = useState(false);
  const [showAI, setShowAI] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);

  const inputRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadDraft();
    Animated.timing(fadeAnim, {
      toValue: 1, duration: 400, useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (editedTranscript) {
      const words = editedTranscript.trim().split(/\s+/).filter(Boolean);
      setWordCount(words.length);
      setChangesMade(originalTranscript !== editedTranscript);
    }
  }, [editedTranscript]);

  // Only load saved draft if no real transcript was passed
  const loadDraft = async () => {
    if (initialTranscript && initialTranscript.trim().length > 0) return;
    try {
      const saved = await AsyncStorage.getItem(`transcript_${recordingId || 'current'}`);
      if (saved) {
        setEditedTranscript(saved);
        setLastSaved(new Date().toLocaleTimeString());
      }
    } catch (e) {}
  };

  const saveTranscript = async () => {
    if (!changesMade) return;
    try {
      await AsyncStorage.setItem(`transcript_${recordingId || 'current'}`, editedTranscript);
      setLastSaved(new Date().toLocaleTimeString());
      setChangesMade(false);
    } catch (e) {}
  };

  const handleEditToggle = () => {
    if (isEditing) {
      saveTranscript();
      setIsEditing(false);
    } else {
      setIsEditing(true);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleCopy = () => {
    Clipboard.setString(editedTranscript);
    Alert.alert('Copied', 'Transcript copied to clipboard.');
  };

  const handleReset = () => {
    Alert.alert('Reset', 'Revert to original transcript?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset', style: 'destructive',
        onPress: () => {
          setEditedTranscript(originalTranscript);
          setChangesMade(false);
        },
      },
    ]);
  };

  const handleContinue = () => {
    if (!editedTranscript.trim()) {
      Alert.alert('Empty Transcript', 'Please add content before proceeding.');
      return;
    }
    saveTranscript();

    const backendData = route.params?.extractedData || {};
    navigation.navigate('DraftFIR', {
      mode: 'audio',
      transcript: editedTranscript,
      extractedData: { ...backendData, narrative: editedTranscript },
      language,
      recordingId,
    });
  };

  const handleBack = () => {
    if (changesMade) {
      Alert.alert('Unsaved Changes', 'You have unsaved edits. Go back?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Go Back', onPress: () => navigation.goBack() },
      ]);
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

     

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Transcript Card */}
        <View style={styles.transcriptCard}>
          <View style={styles.transcriptHeader}>
            <Text style={styles.sectionTitle}>Your FIR Transcript</Text>
            <View style={styles.transcriptActions}>
              <TouchableOpacity onPress={handleEditToggle} style={styles.miniBtn}>
                {isEditing ? (
                  <Save size={16} color={colors.success} />
                ) : (
                  <Edit size={16} color={colors.primary} />
                )}
                <Text style={[styles.miniBtnText, { color: isEditing ? colors.success : colors.primary }]}>
                  {isEditing ? 'Save' : 'Edit'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCopy} style={styles.miniBtn}>
                <Copy size={16} color={colors.primary} />
                <Text style={[styles.miniBtnText, { color: colors.primary }]}>Copy</Text>
              </TouchableOpacity>
              {changesMade && (
                <TouchableOpacity onPress={handleReset} style={styles.miniBtn}>
                  <RefreshCw size={16} color={colors.error} />
                  <Text style={[styles.miniBtnText, { color: colors.error }]}>Reset</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {isEditing ? (
            <TextInput
              ref={inputRef}
              value={editedTranscript}
              onChangeText={setEditedTranscript}
              multiline
              placeholder="Edit your transcript here…"
              placeholderTextColor={colors.textLight}
              style={styles.textInput}
              textAlignVertical="top"
            />
          ) : (
            <Text style={styles.transcriptText} selectable>
              {editedTranscript || 'No transcript available. Please record your FIR first.'}
            </Text>
          )}
        </View>

        {/* AI Suggestions */}
        {showAI && (
          <View style={styles.suggestionsCard}>
            <View style={styles.suggestionsHeader}>
              <Zap size={16} color={colors.warning} />
              <Text style={styles.suggestionsTitle}>Suggestions to Improve</Text>
            </View>
            <View style={styles.suggestionList}>
              {[
                'Add exact time (e.g., 6:00 PM) instead of "evening"',
                'Include phone model, color, and IMEI number',
                'Mention CCTV locations or nearby witnesses',
                'Describe suspect: age, height, clothing',
              ].map((tip, i) => (
                <View key={i} style={styles.suggestionItem}>
                  <CheckCircle size={14} color={colors.success} />
                  <Text style={styles.suggestionText}>{tip}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.primaryBtn, !editedTranscript.trim() && styles.primaryBtnDisabled]}
          onPress={handleContinue}
          disabled={!editedTranscript.trim()}
          activeOpacity={0.8}
        >
          <FileText size={18} color="white" />
          <Text style={styles.primaryBtnText}>Continue to FIR Draft</Text>
          <ChevronRight size={18} color="white" />
        </TouchableOpacity>

        <View style={styles.secondaryRow}>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.navigate('RecordFIR')}
          >
            <Mic size={16} color={colors.primary} />
            <Text style={styles.secondaryBtnText}>Record Again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.navigate('DraftFIR', { mode: 'manual' })}
          >
            <Edit size={16} color={colors.primary} />
            <Text style={styles.secondaryBtnText}>Type Manually</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  iconBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
  },
  headerCenter: { flex: 1, marginHorizontal: 12 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  headerMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  aiBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.surface, paddingHorizontal: 10,
    paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: colors.border,
  },
  aiBadgeText: { fontSize: 12, fontWeight: '600' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 20 },
  transcriptCard: {
    backgroundColor: colors.surface, borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: colors.border, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  transcriptHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 14, flexWrap: 'wrap', gap: 10,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
  transcriptActions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  miniBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  miniBtnText: { fontSize: 13, fontWeight: '600' },
  textInput: {
    fontSize: 15, color: colors.textPrimary, lineHeight: 23,
    minHeight: 180, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  transcriptText: {
    fontSize: 15, color: colors.textPrimary, lineHeight: 23,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  suggestionsCard: {
    backgroundColor: '#FFFBEB', borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: '#FDE68A',
  },
  suggestionsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  suggestionsTitle: { fontWeight: '700', fontSize: 15, color: colors.textPrimary },
  suggestionList: { gap: 10 },
  suggestionItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  suggestionText: { flex: 1, fontSize: 13, color: colors.textSecondary, lineHeight: 19 },
  bottomBar: {
    padding: 16, paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.background,
    gap: 12,
  },
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 16, gap: 8,
    elevation: 3, shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 6,
  },
  primaryBtnDisabled: { backgroundColor: colors.textLight, elevation: 0, shadowOpacity: 0 },
  primaryBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },
  secondaryRow: { flexDirection: 'row', gap: 12 },
  secondaryBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.surface, borderRadius: 12, paddingVertical: 12,
    borderWidth: 1, borderColor: colors.border, gap: 6,
  },
  secondaryBtnText: { color: colors.primary, fontSize: 14, fontWeight: '600' },
});