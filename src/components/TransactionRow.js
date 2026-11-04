import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, radius, spacing, getCategoryMeta } from '../theme';
import { formatMoney } from '../lib/money';
import { formatDateTime } from '../lib/datetime';

// One row in a transactions list. Tap to edit, long-press to delete.
export default function TransactionRow({ item, accountName, onEdit, onDelete }) {
  const meta = getCategoryMeta(item.type, item.category);
  const income = item.type === 'income';
  return (
    <Pressable
      style={styles.txRow}
      onPress={() => onEdit && onEdit(item)}
      onLongPress={() => onDelete && onDelete(item)}
    >
      <View style={[styles.txIcon, { backgroundColor: meta.color }]}>
        <meta.Icon color="#fff" size={18} />
      </View>
      <View style={styles.txMid}>
        <Text style={styles.txTitle} numberOfLines={1}>
          {item.note || meta.label}
        </Text>
        <Text style={styles.txSub} numberOfLines={1}>
          {meta.label}
          {accountName ? ` · ${accountName}` : ''} · {formatDateTime(item.occurredAt || item.createdAt)}
        </Text>
      </View>
      <Text style={[styles.txAmount, { color: income ? colors.income : colors.expense }]}>
        {formatMoney(income ? item.amount : -item.amount, { sign: true })}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  txIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txMid: { flex: 1 },
  txTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
  txSub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  txAmount: { fontSize: 16, fontWeight: '800' },
});
