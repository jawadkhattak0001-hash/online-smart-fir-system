// src/screens/citizen/RecordFirScreen.js – MODERN, WITH PLAYBACK, CLEAN UI
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  Dimensions,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Platform,
  Animated,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Audio } from 'expo-av';
import { speechService } from '../../services/speechService';
import {
  Mic,
  Square,
  Info,
  Clock,
  AlertCircle,
  Languages,
  Volume2,
  CheckCircle,
  Pause,
  Play,
  SkipForward,
  FileText,
  Loader,
  RotateCcw,
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 375;

const colors = {
  primary: '#636d79',
  primaryLight: '#7b8590',
  primaryDark: '#4b545e',
  surface: '#F8F9FA',
  background: '#FFFFFF',
  textPrimary: '#212529',
  textSecondary: '#6B7280',
  textLight: '#ADB5BD',
  border: '#E5E7EB',
  recording: '#E03131',
  recordingLight: '#FEE2E2',
  pause: '#E8590C',
  success: '#2F9E44',
  warning: '#E8590C',
  error: '#E03131',
  info: '#1971C2',
};

export function RecordFirScreen({ navigation }) {
  // Recording states
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedUri, setRecordedUri] = useState(null); // for playback
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState(null);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [extractedData, setExtractedData] = useState(null);

  const [hasPermission, setHasPermission] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('english');

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveformAnims = useRef([1, 2, 3, 4, 5].map(() => new Animated.Value(0.3))).current;

  // Timer
  useEffect(() => {
    let timer;
    if (isRecording && !isPaused) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      ).start();

      waveformAnims.forEach((anim, index) => {
        Animated.loop(
          Animated.sequence([
            Animated.delay(index * 150),
            Animated.timing(anim, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(anim, { toValue: 0.3, duration: 400, useNativeDriver: true }),
          ])
        ).start();
      });

      timer = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      pulseAnim.stopAnimation();
      waveformAnims.forEach(anim => anim.stopAnimation());
      pulseAnim.setValue(1);
      waveformAnims.forEach(anim => anim.setValue(0.3));
    }
    return () => {
      if (timer) clearInterval(timer);
      pulseAnim.stopAnimation();
      waveformAnims.forEach(anim => anim.stopAnimation());
    };
  }, [isRecording, isPaused]);

  // Cleanup sound on unmount
  useEffect(() => {
    return () => {
      if (sound) sound.unloadAsync();
    };
  }, [sound]);

  // ─── Audio Playback ──────────────────────────────
  const playRecordedAudio = async () => {
    if (!recordedUri) return;
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: recordedUri },
        { shouldPlay: true }
      );
      setSound(newSound);
      setIsPlaying(true);
      newSound.setOnPlaybackStatusUpdate(status => {
        if (status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (err) {
      Alert.alert('Playback Error', 'Cannot play audio file.');
    }
  };

  const stopPlayback = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
      setIsPlaying(false);
    }
  };

  const resetRecording = () => {
    setRecordedUri(null);
    setTranscript('');
    setExtractedData(null);
    setRecordingTime(0);
    setIsPlaying(false);
    if (sound) {
      sound.unloadAsync();
      setSound(null);
    }
  };

  // ─── Start / Stop Recording ──────────────────────
  const startRecording = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      setHasPermission(false);
      Alert.alert('Microphone required', 'Please allow access to microphone.', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Settings',
          onPress: () => {
            if (Platform.OS === 'ios') {
              Linking.openURL('app-settings:');
            } else {
              Linking.openSettings();
            }
          },
        },
      ]);
      return;
    }

    setHasPermission(true);
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
      setIsRecording(true);
      setIsPaused(false);
      resetRecording();
    } catch (error) {
      Alert.alert('Error', 'Failed to start recording.');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    setIsRecording(false);
    setIsPaused(false);
    setIsProcessing(true);
    setUploadProgress(10);

    try {
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      const uri = recording.getURI();
      setRecordedUri(uri);
      setUploadProgress(30);

      if (!uri) throw new Error('No audio file found');

      setUploadProgress(50);
      const result = await speechService.transcribeAndExtract(uri, selectedLanguage);
      setUploadProgress(100);

      if (result.success && result.transcript) {
        setTranscript(result.transcript);
        setExtractedData(result.extractedData);
      } else {
        throw new Error('No transcript returned');
      }
    } catch (apiError) {
      console.error('API Error:', apiError.message);
      // fallback mock transcript
      const mockTranscript =
        selectedLanguage === 'urdu'
          ? 'میں چوری کی رپورٹ درج کرانا چاہتا ہوں۔'
          : 'My name is Ahmed. My phone was stolen at Main Market yesterday.';
      setTranscript(mockTranscript);
      setExtractedData(null);
    } finally {
      setIsProcessing(false);
      setRecording(null);
    }
  };

  const togglePause = async () => {
    if (isPaused) {
      await recording.startAsync();
    } else {
      await recording.pauseAsync();
    }
    setIsPaused(!isPaused);
  };

  const handleProceed = () => {
    if (!transcript) {
      Alert.alert('No recording', 'Please record your complaint first.');
      return;
    }
    navigation.navigate('Transcription', {
      transcript,
      extractedData,
      language: selectedLanguage,
      isMock: extractedData ? false : true,
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

     

      {/* Progress Bar */}
      {isProcessing && (
        <View style={styles.progressContainer}>
          <Loader size={16} color={colors.primary} />
          <Text style={styles.progressText}>Processing...</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${uploadProgress}%` }]} />
          </View>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Language selector */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Languages size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Select Language</Text>
          </View>
          <View style={styles.languageRow}>
            {['english', 'urdu'].map(lang => (
              <TouchableOpacity
                key={lang}
                style={[
                  styles.langBtn,
                  selectedLanguage === lang && styles.langBtnActive,
                ]}
                disabled={isRecording || isProcessing}
                onPress={() => setSelectedLanguage(lang)}
              >
                <Text
                  style={[
                    styles.langBtnText,
                    selectedLanguage === lang && styles.langBtnTextActive,
                  ]}
                >
                  {lang === 'english' ? 'English' : 'Urdu (اردو)'}
                </Text>
                {selectedLanguage === lang && <CheckCircle size={16} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recording Section */}
        <View style={styles.section}>
          <View style={styles.recordingContainer}>
            {isRecording && (
              <View style={styles.timerContainer}>
                <Clock size={18} color={colors.recording} />
                <Text style={styles.timerText}>{formatTime(recordingTime)}</Text>
              </View>
            )}

            {/* Animated record button */}
            <View style={styles.recordingButtonContainer}>
              {isRecording && !isPaused && !isProcessing && (
                <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulseAnim }] }]} />
              )}
              {isRecording && !isPaused && !isProcessing && (
                <View style={styles.waveformContainer}>
                  {waveformAnims.map((anim, index) => (
                    <Animated.View
                      key={index}
                      style={[styles.waveformBar, { transform: [{ scaleY: anim }] }]}
                    />
                  ))}
                </View>
              )}

              <TouchableOpacity
                onPress={isRecording ? stopRecording : startRecording}
                style={[
                  styles.recordBtn,
                  isRecording ? styles.recordBtnActive : styles.recordBtnInactive,
                  isProcessing && styles.recordBtnDisabled,
                ]}
                disabled={isProcessing}
                activeOpacity={0.9}
              >
                {isProcessing ? (
                  <ActivityIndicator size="large" color="white" />
                ) : isRecording ? (
                  <Square size={40} color="white" />
                ) : (
                  <Mic size={40} color="white" />
                )}
              </TouchableOpacity>

              {isRecording && !isProcessing && (
                <TouchableOpacity onPress={togglePause} style={styles.pauseBtn}>
                  {isPaused ? (
                    <Play size={22} color={colors.primary} />
                  ) : (
                    <Pause size={22} color={colors.pause} />
                  )}
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.statusText}>
              {isProcessing
                ? 'Processing...'
                : isRecording
                ? isPaused
                  ? 'Paused — tap to resume'
                  : 'Recording... speak clearly'
                : 'Tap the microphone to start'}
            </Text>
          </View>
        </View>

        {/* Playback controls (after recording) */}
        {recordedUri && !isRecording && !isProcessing && (
          <View style={styles.playbackSection}>
            <TouchableOpacity
              style={styles.playBtn}
              onPress={isPlaying ? stopPlayback : playRecordedAudio}
            >
              {isPlaying ? <Pause size={24} color="white" /> : <Play size={24} color="white" />}
              <Text style={styles.playBtnText}>{isPlaying ? 'Stop' : 'Play Recording'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={resetRecording} style={styles.retryBtn}>
              <RotateCcw size={18} color={colors.primary} />
              <Text style={styles.retryText}>Record Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Transcript section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Volume2 size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Transcription</Text>
          </View>
          <View style={styles.transcriptCard}>
            {transcript ? (
              <Text style={styles.transcriptText}>{transcript}</Text>
            ) : (
              <Text style={styles.emptyText}>
                {isProcessing ? 'Transcribing...' : 'Your spoken words will appear here'}
              </Text>
            )}
          </View>
        </View>

        {/* Quick tips (condensed) */}
        <View style={styles.tipRow}>
          <Info size={16} color={colors.textLight} />
          <Text style={styles.tipText}>
            Speak clearly • Mention location, time, suspect description, and witnesses.
          </Text>
        </View>

        {/* Action buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.primaryBtn, (!transcript || isProcessing) && styles.primaryBtnDisabled]}
            onPress={handleProceed}
            disabled={!transcript || isProcessing}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryBtnText}>
              {isProcessing ? 'Processing...' : 'Review Transcription'}
            </Text>
            <SkipForward size={18} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.navigate('DraftFIR', { mode: 'manual' })}
            disabled={isProcessing}
          >
            <FileText size={18} color={colors.primary} />
            <Text style={styles.secondaryBtnText}>Type Instead of Record</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 16 : 24, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { fontSize: 26, fontWeight: '700', color: colors.textPrimary },
  headerSubtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  progressContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 8 },
  progressText: { fontSize: 13, color: colors.textSecondary, flex: 1 },
  progressBar: { flex: 1, height: 4, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 2 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  sectionTitle: { fontSize: 17, fontWeight: '600', color: colors.textPrimary },
  languageRow: { flexDirection: 'row', gap: 12 },
  langBtn: {
    flex: 1, backgroundColor: colors.surface, borderRadius: 12,
    paddingVertical: 14, paddingHorizontal: 16,
    borderWidth: 1.5, borderColor: colors.border,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  langBtnActive: { borderColor: colors.primary, backgroundColor: '#F0F4FF' },
  langBtnText: { fontSize: 15, color: colors.textSecondary, fontWeight: '500' },
  langBtnTextActive: { color: colors.primary, fontWeight: '700' },
  recordingContainer: { alignItems: 'center' },
  timerContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.recordingLight, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, marginBottom: 20, gap: 8 },
  timerText: { fontSize: 20, fontWeight: '700', color: colors.recording },
  recordingButtonContainer: { position: 'relative', marginBottom: 16, alignItems: 'center' },
  pulseRing: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: colors.recording, opacity: 0.5 },
  waveformContainer: { position: 'absolute', flexDirection: 'row', gap: 6, bottom: -40, height: 40, alignItems: 'center' },
  waveformBar: { width: 6, height: 30, backgroundColor: colors.primary, borderRadius: 3 },
  recordBtn: { width: 150, height: 150, borderRadius: 75, alignItems: 'center', justifyContent: 'center', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  recordBtnInactive: { backgroundColor: colors.primary },
  recordBtnActive: { backgroundColor: colors.recording },
  recordBtnDisabled: { backgroundColor: colors.textLight },
  pauseBtn: { position: 'absolute', bottom: -50, backgroundColor: colors.background, width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.border, elevation: 3 },
  statusText: { fontSize: 14, color: colors.textSecondary, marginTop: 20, textAlign: 'center' },
  playbackSection: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 24 },
  playBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 24, gap: 8, elevation: 2 },
  playBtnText: { color: 'white', fontWeight: '600', fontSize: 15 },
  retryBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 20, borderWidth: 1, borderColor: colors.border, gap: 6 },
  retryText: { color: colors.primary, fontWeight: '600', fontSize: 14 },
  transcriptCard: { backgroundColor: colors.surface, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: colors.border, minHeight: 100 },
  transcriptText: { fontSize: 15, color: colors.textPrimary, lineHeight: 22 },
  emptyText: { fontSize: 14, color: colors.textLight, fontStyle: 'italic' },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 24, paddingHorizontal: 4 },
  tipText: { fontSize: 13, color: colors.textLight, flex: 1, lineHeight: 18 },
  actionsContainer: { gap: 12 },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 18, gap: 8, elevation: 3, shadowColor: colors.primary, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 6 },
  primaryBtnDisabled: { backgroundColor: colors.textLight, elevation: 0, shadowOpacity: 0 },
  primaryBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },
  secondaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderRadius: 14, paddingVertical: 16, borderWidth: 1, borderColor: colors.border, gap: 8 },
  secondaryBtnText: { color: colors.primary, fontSize: 15, fontWeight: '600' },
});