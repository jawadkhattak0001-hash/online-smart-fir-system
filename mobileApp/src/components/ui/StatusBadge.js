// src/components/ui/StatusBadge.js - COMPATIBLE WITH NATIVEWIND v2
import { View, Text } from 'react-native';

// Define status constants if not imported
const FIR_STATUS = {
  DRAFT: 'DRAFT',
  PENDING: 'PENDING',
  UNDER_REVIEW: 'UNDER_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  INVESTIGATION_STARTED: 'INVESTIGATION_STARTED',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED'
};

// Default colors if STATUS_COLORS is not imported
const DEFAULT_STATUS_COLORS = {
  [FIR_STATUS.DRAFT]: 'bg-gray-100 text-gray-800',
  [FIR_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
  [FIR_STATUS.UNDER_REVIEW]: 'bg-blue-100 text-blue-800',
  [FIR_STATUS.APPROVED]: 'bg-green-100 text-green-800',
  [FIR_STATUS.REJECTED]: 'bg-red-100 text-red-800',
  [FIR_STATUS.INVESTIGATION_STARTED]: 'bg-purple-100 text-purple-800',
  [FIR_STATUS.RESOLVED]: 'bg-green-100 text-green-800',
  [FIR_STATUS.CLOSED]: 'bg-gray-100 text-gray-800'
};

// Default labels if STATUS_LABELS is not imported
const DEFAULT_STATUS_LABELS = {
  [FIR_STATUS.DRAFT]: 'Draft',
  [FIR_STATUS.PENDING]: 'Pending',
  [FIR_STATUS.UNDER_REVIEW]: 'Under Review',
  [FIR_STATUS.APPROVED]: 'Approved',
  [FIR_STATUS.REJECTED]: 'Rejected',
  [FIR_STATUS.INVESTIGATION_STARTED]: 'Investigation',
  [FIR_STATUS.RESOLVED]: 'Resolved',
  [FIR_STATUS.CLOSED]: 'Closed'
};

export function StatusBadge({ 
  status, 
  size = 'md', 
  STATUS_COLORS = DEFAULT_STATUS_COLORS, 
  STATUS_LABELS = DEFAULT_STATUS_LABELS 
}) {
  const sizeClasses = {
    sm: 'px-2 py-1',
    md: 'px-3 py-1.5',
    lg: 'px-4 py-2'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  // Get color from your constants
  const badgeColor = STATUS_COLORS[status] || STATUS_COLORS[FIR_STATUS.PENDING];
  const statusLabel = STATUS_LABELS[status] || status;

  return (
    <View className={`
      rounded-full items-center justify-center
      ${badgeColor}
      ${sizeClasses[size]}
    `}>
      <Text className={`
        font-semibold ${textSizeClasses[size]}
      `}>
        {statusLabel}
      </Text>
    </View>
  );
}

// Enhanced version with icons (using system icons)
export function EnhancedStatusBadge({ 
  status, 
  size = 'md', 
  showIcon = false,
  STATUS_COLORS = DEFAULT_STATUS_COLORS, 
  STATUS_LABELS = DEFAULT_STATUS_LABELS 
}) {
  const sizeClasses = {
    sm: 'px-2 py-1',
    md: 'px-3 py-1.5',
    lg: 'px-4 py-2'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  // Using system emojis since lucide-react-native might not have all icons
  const statusIcons = {
    [FIR_STATUS.DRAFT]: '📝',
    [FIR_STATUS.PENDING]: '⏳',
    [FIR_STATUS.UNDER_REVIEW]: '🔍',
    [FIR_STATUS.APPROVED]: '✅',
    [FIR_STATUS.REJECTED]: '❌',
    [FIR_STATUS.INVESTIGATION_STARTED]: '🕵️',
    [FIR_STATUS.RESOLVED]: '✅',
    [FIR_STATUS.CLOSED]: '🔒'
  };

  const badgeColor = STATUS_COLORS[status] || STATUS_COLORS[FIR_STATUS.PENDING];
  const statusLabel = STATUS_LABELS[status] || status;
  const icon = statusIcons[status] || '📄';

  return (
    <View className={`
      rounded-full items-center justify-center flex-row
      ${badgeColor}
      ${sizeClasses[size]}
      ${showIcon ? 'px-3 py-1.5' : sizeClasses[size]} // Fixed padding for icon
    `}>
      {showIcon && (
        <Text className="mr-2">{icon}</Text>
      )}
      <Text className={`
        font-semibold ${textSizeClasses[size]}
      `}>
        {statusLabel}
      </Text>
    </View>
  );
}

// Status badge with custom colors
export function CustomStatusBadge({ 
  status, 
  label, 
  bgColor = 'bg-gray-100', 
  textColor = 'text-gray-800',
  size = 'md' 
}) {
  const sizeClasses = {
    sm: 'px-2 py-1',
    md: 'px-3 py-1.5',
    lg: 'px-4 py-2'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <View className={`
      rounded-full items-center justify-center
      ${bgColor}
      ${sizeClasses[size]}
    `}>
      <Text className={`
        font-semibold ${textColor} ${textSizeClasses[size]}
      `}>
        {label || status}
      </Text>
    </View>
  );
}

// Dot-only status indicator
export function StatusDot({ status }) {
  const statusColors = {
    [FIR_STATUS.DRAFT]: 'bg-gray-400',
    [FIR_STATUS.PENDING]: 'bg-yellow-500',
    [FIR_STATUS.UNDER_REVIEW]: 'bg-blue-500',
    [FIR_STATUS.APPROVED]: 'bg-green-500',
    [FIR_STATUS.REJECTED]: 'bg-red-500',
    [FIR_STATUS.INVESTIGATION_STARTED]: 'bg-purple-500',
    [FIR_STATUS.RESOLVED]: 'bg-green-500',
    [FIR_STATUS.CLOSED]: 'bg-gray-400'
  };

  const dotColor = statusColors[status] || statusColors[FIR_STATUS.PENDING];

  return (
    <View className={`w-2 h-2 rounded-full ${dotColor} mr-2`} />
  );
}

// Status with dot and text
export function StatusIndicator({ status, size = 'md' }) {
  return (
    <View className="flex-row items-center">
      <StatusDot status={status} />
      <Text className="text-gray-700 font-medium">
        {DEFAULT_STATUS_LABELS[status] || status}
      </Text>
    </View>
  );
}