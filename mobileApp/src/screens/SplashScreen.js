import React, { useEffect, useRef } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Shield } from 'lucide-react-native';
import { useAuth } from '../hooks/useAuth';

export const SplashScreen = ({ navigation }) => {
  const { user, loading } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!loading) {
        if (user) {
          navigation.replace('Main');
        } else {
          navigation.replace('Auth');
        }
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [user, loading, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Shield size={64} color="#2563eb" />
        </View>
        <Text style={styles.title}>SmartFIR</Text>
        <Text style={styles.subtitle}>Pakistan's Smart FIR System</Text>
        <ActivityIndicator size="large" color="#2563eb" style={styles.loader} />
      </View>
      <Text style={styles.footer}>Powered by Fironix</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 25,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 30,
  },
  loader: {
    marginTop: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    fontSize: 12,
    color: '#9CA3AF',
  },
});