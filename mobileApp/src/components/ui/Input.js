import React, { useState } from 'react';
import { TextInput, View, Text, Pressable } from 'react-native';
import { Search, Phone, Eye, EyeOff } from 'lucide-react-native';

/* =========================
   Base Input (NativeWind v2)
========================= */
export function Input({
  label,
  error,
  success,
  leftIcon,
  rightIcon,
  className = '',
  containerClassName = '',
  style,
  ...props
}) {
  return (
    <View className={`mb-4 ${containerClassName}`}>
      {label && (
        <Text className="text-gray-700 text-sm font-medium mb-2">
          {label}
        </Text>
      )}

      <View className="relative">
        {leftIcon && (
          <View className="absolute left-3 top-3.5 z-10">
            {leftIcon}
          </View>
        )}

        <TextInput
          className={`
            w-full rounded-xl border px-4 py-3.5
            bg-white text-gray-900 text-base
            ${error ? 'border-red-500 bg-red-50' :
              success ? 'border-green-500 bg-green-50' :
              'border-gray-300'}
            ${leftIcon ? 'pl-11' : ''}
            ${rightIcon ? 'pr-11' : ''}
            ${props.multiline ? 'min-h-[120px]' : ''}
            ${props.editable === false ? 'bg-gray-100 text-gray-600' : ''}
            ${className}
          `}
          placeholderTextColor="#9CA3AF"
          selectionColor="#2563eb"
          style={[
            {
              borderColor: error
                ? '#ef4444'
                : success
                ? '#22c55e'
                : props.value
                ? '#3b82f6'
                : '#d1d5db',
            },
            style,
          ]}
          {...props}
        />

        {rightIcon && (
          <View className="absolute right-3 top-3.5">
            {rightIcon}
          </View>
        )}
      </View>

      {error && (
        <Text className="text-red-500 text-sm mt-1 font-medium">
          {error}
        </Text>
      )}

      {success && !error && (
        <Text className="text-green-600 text-sm mt-1 font-medium">
          {success}
        </Text>
      )}
    </View>
  );
}

/* =========================
   Enhanced Input (Pure RN)
========================= */
export function InputEnhanced({
  label,
  error,
  success,
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  ...props
}) {
  const borderColor = error
    ? '#ef4444'
    : success
    ? '#22c55e'
    : props.value
    ? '#3b82f6'
    : '#d1d5db';

  const backgroundColor = error
    ? '#fef2f2'
    : success
    ? '#f0fdf4'
    : props.editable === false
    ? '#f3f4f6'
    : '#ffffff';

  return (
    <View style={[{ marginBottom: 16 }, containerStyle]}>
      {label && (
        <Text style={{ color: '#374151', fontSize: 14, fontWeight: '500', marginBottom: 8 }}>
          {label}
        </Text>
      )}

      <View style={{ position: 'relative' }}>
        {leftIcon && (
          <View style={{ position: 'absolute', left: 12, top: 14, zIndex: 10 }}>
            {leftIcon}
          </View>
        )}

        <TextInput
          style={[
            {
              width: '100%',
              borderWidth: 1,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 14,
              backgroundColor,
              color: '#111827',
              fontSize: 16,
              borderColor,
            },
            leftIcon && { paddingLeft: 44 },
            rightIcon && { paddingRight: 44 },
            props.multiline && { minHeight: 120, textAlignVertical: 'top' },
            inputStyle,
          ]}
          placeholderTextColor="#9CA3AF"
          selectionColor="#2563eb"
          {...props}
        />

        {rightIcon && (
          <View style={{ position: 'absolute', right: 12, top: 14 }}>
            {rightIcon}
          </View>
        )}
      </View>

      {error && (
        <Text style={{ color: '#ef4444', fontSize: 14, marginTop: 4, fontWeight: '500' }}>
          {error}
        </Text>
      )}

      {success && !error && (
        <Text style={{ color: '#22c55e', fontSize: 14, marginTop: 4, fontWeight: '500' }}>
          {success}
        </Text>
      )}
    </View>
  );
}

/* =========================
   Specialized Inputs
========================= */

export function SearchInput(props) {
  return (
    <Input
      placeholder="Search..."
      leftIcon={<Search size={18} color="#6B7280" />}
      className="rounded-full"
      {...props}
    />
  );
}

export function PhoneInput(props) {
  return (
    <Input
      placeholder="03xx-xxxxxxx"
      keyboardType="phone-pad"
      leftIcon={<Phone size={18} color="#6B7280" />}
      {...props}
    />
  );
}

export function PasswordInput({ onToggleVisibility, ...props }) {
  const [visible, setVisible] = useState(false);

  const toggle = () => {
    setVisible(!visible);
    onToggleVisibility?.(!visible);
  };

  return (
    <Input
      secureTextEntry={!visible}
      rightIcon={
        <Pressable onPress={toggle}>
          {visible ? (
            <EyeOff size={18} color="#6B7280" />
          ) : (
            <Eye size={18} color="#6B7280" />
          )}
        </Pressable>
      }
      {...props}
    />
  );
}
