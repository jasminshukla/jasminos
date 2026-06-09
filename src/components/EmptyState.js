import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { colors, spacing } from '../theme';

// `Icon` is a lucide-react-native component (defaults to Sparkles).
export default function EmptyState({ Icon = Sparkles, title, subtitle }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        <Icon color={colors.primary} size={44} strokeWidth={1.5} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: spacing.xxl * 2, paddingHorizontal: spacing.xl },
  iconWrap: { marginBottom: spacing.lg },
  title: { color: colors.text, fontSize: 18, fontWeight: '700', textAlign: 'center' },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 20,
  },
});
