import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import { colors, radius, spacing } from '../theme';
import { formatDateTime, formatRelative } from '../lib/datetime';

function FollowUpCard({ item, onToggle, onEdit, onDelete }) {
  const overdue = item.remindAt && !item.done && item.remindAt < Date.now();
  return (
    <View style={[styles.card, item.done && styles.cardDone]}>
      <Pressable onPress={() => onToggle(item.id)} style={styles.checkbox}>
        <Text style={styles.checkboxText}>{item.done ? '✅' : '⬜️'}</Text>
      </Pressable>
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, item.done && styles.strike]}>{item.title}</Text>
        {item.contact ? <Text style={styles.contact}>👤 {item.contact}</Text> : null}
        {item.note ? <Text style={styles.note}>{item.note}</Text> : null}
        {item.remindAt ? (
          <View style={styles.reminderRow}>
            <Text style={[styles.reminder, overdue && styles.overdue]}>
              🔔 {formatDateTime(item.remindAt)}
            </Text>
            <Text style={[styles.relative, overdue && styles.overdue]}>
              {overdue ? 'overdue' : formatRelative(item.remindAt)}
            </Text>
          </View>
        ) : null}
      </View>
      <View style={styles.cardActions}>
        <Pressable onPress={() => onEdit(item)} hitSlop={8}>
          <Text style={styles.action}>✏️</Text>
        </Pressable>
        <Pressable onPress={() => onDelete(item)} hitSlop={8}>
          <Text style={styles.action}>🗑️</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function FollowUpListScreen({ navigation }) {
  const { followups, toggleFollowupDone, deleteFollowup } = useStore();
  const { user } = useAuth();
  const [toDelete, setToDelete] = useState(null);

  const { pending, done } = useMemo(() => {
    const sorted = [...followups].sort((a, b) => {
      const ax = a.remindAt || a.createdAt;
      const bx = b.remindAt || b.createdAt;
      return ax - bx;
    });
    return {
      pending: sorted.filter((f) => !f.done),
      done: sorted.filter((f) => f.done),
    };
  }, [followups]);

  const data = [...pending, ...done];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hi {user?.name?.split(' ')[0]} 👋</Text>
          <Text style={styles.heading}>Follow-ups</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{pending.length} open</Text>
        </View>
      </View>

      <FlatList
        data={data}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <FollowUpCard
            item={item}
            onToggle={toggleFollowupDone}
            onEdit={(it) => navigation.navigate('AddFollowUp', { editItem: it })}
            onDelete={setToDelete}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="🔔"
            title="No follow-ups yet"
            subtitle="Tap + to add one. Set a time and you'll get a push notification when it's due."
          />
        }
      />

      <Pressable style={styles.fab} onPress={() => navigation.navigate('AddFollowUp')}>
        <Text style={styles.fabText}>＋</Text>
      </Pressable>

      <ConfirmDialog
        visible={!!toDelete}
        title="Delete follow-up?"
        message={toDelete?.title}
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          deleteFollowup(toDelete.id);
          setToDelete(null);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  greeting: { color: colors.textMuted, fontSize: 14 },
  heading: { color: colors.text, fontSize: 26, fontWeight: '800' },
  badge: {
    backgroundColor: colors.cardAlt,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  badgeText: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  list: { paddingHorizontal: spacing.xl, paddingBottom: 120 },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  cardDone: { opacity: 0.55 },
  checkbox: { paddingTop: 2 },
  checkboxText: { fontSize: 20 },
  title: { color: colors.text, fontSize: 16, fontWeight: '700' },
  strike: { textDecorationLine: 'line-through', color: colors.textMuted },
  contact: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  note: { color: colors.textMuted, fontSize: 13, marginTop: spacing.xs, lineHeight: 18 },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  reminder: { color: colors.primary, fontSize: 13, fontWeight: '600' },
  relative: { color: colors.textMuted, fontSize: 12 },
  overdue: { color: colors.danger },
  cardActions: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  action: { fontSize: 18 },
  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: spacing.xl,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  fabText: { color: colors.onPrimary, fontSize: 32, marginTop: -2 },
});
