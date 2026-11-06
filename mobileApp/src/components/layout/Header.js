// src/components/ui/Header.js – Professional, Minimal & Responsive
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ArrowLeft, Bell, Search, MoreVertical } from 'lucide-react-native';

export function Header({
  title,
  subtitle,
  onBack,
  showNotification = false,
  showSearch = false,
  showMenu = false,
  onNotificationPress,
  onSearchPress,
  onMenuPress,
  unreadCount = 0,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        {/* ── Left: Back + Title ── */}
        <View style={styles.left}>
          {onBack && (
            <Pressable
              onPress={onBack}
              style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
            >
              <ArrowLeft size={20} color="#212529" />
            </Pressable>
          )}
          <View style={styles.titleArea}>
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
            {subtitle && (
              <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
            )}
          </View>
        </View>

        {/* ── Right: Actions ── */}
        <View style={styles.actions}>
          {showSearch && (
            <Pressable
              onPress={onSearchPress}
              style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
            >
              <Search size={20} color="#636d79" />
            </Pressable>
          )}

          {showNotification && (
            <Pressable
              onPress={onNotificationPress}
              style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
            >
              <Bell size={20} color="#636d79" />
              {unreadCount > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                </View>
              ) : (
                <View style={styles.dot} />
              )}
            </Pressable>
          )}

          {showMenu && (
            <Pressable
              onPress={onMenuPress}
              style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
            >
              <MoreVertical size={20} color="#636d79" />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
    // Gentle shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 42,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  titleArea: {
    flex: 1,
    marginLeft: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconBtnPressed: {
    backgroundColor: '#E9ECEF',
  },
  dot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E03131',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#E03131',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
  },
});