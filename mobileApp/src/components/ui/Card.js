import { View, Pressable } from 'react-native';

/* =========================
   Standard Card
========================= */
export function Card({ children, className = '', style, ...props }) {
  return (
    <View
      className={`bg-white rounded-2xl p-6 border border-gray-200 ${className}`}
      style={[
        {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 2,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

/* =========================
   Simple Card (No Shadow)
========================= */
export function CardSimple({ children, className = '', ...props }) {
  return (
    <View
      className={`bg-white rounded-2xl p-6 border border-gray-200 ${className}`}
      {...props}
    >
      {children}
    </View>
  );
}

/* =========================
   Pressable Card
========================= */
export function CardPressable({ children, onPress, className = '', style, ...props }) {
  return (
    <Pressable
      onPress={onPress}
      className={`bg-white rounded-2xl p-6 border border-gray-200 ${className}`}
      style={({ pressed }) => [
        {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 2,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Pressable>
  );
}

/* =========================
   Glass-Style Card (SAFE)
========================= */
export function GlassCard({ children, className = '', ...props }) {
  return (
    <View
      className={`rounded-2xl p-6 border border-white/30 bg-white/80 ${className}`}
      {...props}
    >
      {children}
    </View>
  );
}

/* =========================
   Gradient Card Alternative
   (Using solid fallback)
========================= */
export function GradientCard({ children, className = '', color = '#3b82f6', ...props }) {
  return (
    <View
      className={`rounded-2xl p-6 ${className}`}
      style={{
        backgroundColor: color, // fallback solid color
      }}
      {...props}
    >
      {children}
    </View>
  );
}

/* =========================
   Elevated Card
========================= */
export function ElevatedCard({ children, className = '', ...props }) {
  return (
    <View
      className={`bg-white rounded-2xl p-6 border border-gray-200 ${className}`}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
      }}
      {...props}
    >
      {children}
    </View>
  );
}

/* =========================
   Compact Card
========================= */
export function CompactCard({ children, className = '', ...props }) {
  return (
    <View
      className={`bg-white rounded-xl p-4 border border-gray-200 ${className}`}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
      }}
      {...props}
    >
      {children}
    </View>
  );
}
