// src/components/ui/Button.js - BETTER VERSION
import { Pressable, Text, ActivityIndicator, StyleSheet } from 'react-native';

export function Button({
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  children,
  className = '',
  style,
  ...props
}) {
  // Get variant colors
  const getVariantColors = (variant) => {
    switch(variant) {
      case 'primary':
        return {
          bg: '#3b82f6',     // blue-600
          bgPressed: '#2563eb', // blue-700
          text: '#ffffff'
        };
      case 'secondary':
        return {
          bg: '#e5e7eb',     // gray-200
          bgPressed: '#d1d5db', // gray-300
          text: '#111827'     // gray-900
        };
      case 'outline':
        return {
          bg: 'transparent',
          bgPressed: '#eff6ff', // blue-50
          border: '#3b82f6',    // blue-600
          text: '#3b82f6'
        };
      case 'danger':
        return {
          bg: '#dc2626',     // red-600
          bgPressed: '#b91c1c', // red-700
          text: '#ffffff'
        };
      default:
        return {
          bg: '#3b82f6',
          bgPressed: '#2563eb',
          text: '#ffffff'
        };
    }
  };

  // Get size styles
  const getSizeStyles = (size) => {
    switch(size) {
      case 'sm':
        return {
          paddingHorizontal: 12,
          paddingVertical: 8,
          fontSize: 14
        };
      case 'md':
        return {
          paddingHorizontal: 16,
          paddingVertical: 12,
          fontSize: 16
        };
      case 'lg':
        return {
          paddingHorizontal: 24,
          paddingVertical: 16,
          fontSize: 18
        };
      default:
        return {
          paddingHorizontal: 16,
          paddingVertical: 12,
          fontSize: 16
        };
    }
  };

  const variantColors = getVariantColors(variant);
  const sizeStyle = getSizeStyles(size);

  const buttonStyles = StyleSheet.create({
    base: {
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },
    text: {
      fontWeight: '600',
    }
  });

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={className}
      style={({ pressed }) => [
        buttonStyles.base,
        {
          backgroundColor: variant === 'outline' ? variantColors.bg : variantColors.bg,
          borderWidth: variant === 'outline' ? 1 : 0,
          borderColor: variant === 'outline' ? variantColors.border : undefined,
          paddingHorizontal: sizeStyle.paddingHorizontal,
          paddingVertical: sizeStyle.paddingVertical,
          opacity: disabled || loading ? 0.6 : 1,
        },
        pressed && {
          backgroundColor: variant === 'outline' 
            ? variantColors.bgPressed 
            : variantColors.bgPressed,
        },
        style
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'outline' ? '#2563eb' : 'white'} 
          size="small"
        />
      ) : (
        <Text
          className=""
          style={[
            buttonStyles.text,
            {
              color: variantColors.text,
              fontSize: sizeStyle.fontSize
            }
          ]}
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
}