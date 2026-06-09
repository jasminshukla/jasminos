import React from 'react';
import { Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing, gradient } from '../theme';

export default function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}) {
  const isGhost = variant === 'ghost';
  const isDanger = variant === 'danger';
  const isPrimary = !isGhost && !isDanger;

  const content = loading ? (
    <ActivityIndicator color={isGhost ? colors.primary : '#fff'} />
  ) : (
    <Text style={[styles.text, isGhost && styles.ghostText]}>{title}</Text>
  );

  // Primary buttons use the brand gradient (Indigo → Blue → Cyan).
  if (isPrimary) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled || loading}
        style={({ pressed }) => [
          styles.wrapper,
          (disabled || loading) && styles.disabled,
          pressed && { opacity: 0.9 },
          style,
        ]}
      >
        <LinearGradient
          colors={gradient.colors}
          start={gradient.start}
          end={gradient.end}
          style={styles.inner}
        >
          {content}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        isGhost && styles.ghost,
        isDanger && styles.danger,
        (disabled || loading) && styles.disabled,
        pressed && { opacity: 0.85 },
        style,
      ]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: { borderRadius: radius.md, overflow: 'hidden' },
  inner: {
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  base: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  danger: { backgroundColor: colors.danger },
  disabled: { opacity: 0.5 },
  text: { color: '#fff', fontSize: 16, fontWeight: '700' },
  ghostText: { color: colors.primary },
});
