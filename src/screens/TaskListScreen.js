import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ListChecks, Pencil, Trash2, Plus, SquareCheckBig, Square } from 'lucide-react-native';
import { useStore } from '../context/StoreContext';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import { colors, radius, spacing, getPriorityMeta } from '../theme';
import { partitionTasks } from '../lib/tasks';

// One to-do row. Tap the checkbox to close/reopen, pencil to edit, trash to
// delete (confirmed). Done tasks are dimmed with a strike-through title.
function TaskCard({ item, onToggle, onEdit, onDelete }) {
  const meta = getPriorityMeta(item.priority);
  return (
    <View style={[styles.card, item.done && styles.cardDone]}>
      <Pressable onPress={() => onToggle(item.id)} style={styles.checkbox} hitSlop={6}>
        {item.done ? (
          <SquareCheckBig color={colors.primary} size={22} />
        ) : (
          <Square color={colors.textMuted} size={22} />
        )}
      </Pressable>
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, item.done && styles.strike]}>{item.title}</Text>
        {item.note ? <Text style={styles.note}>{item.note}</Text> : null}
        <View style={styles.metaRow}>
          <View style={[styles.dot, { backgroundColor: meta.color }]} />
          <Text style={styles.priority}>{meta.label} priority</Text>
        </View>
      </View>
      <View style={styles.cardActions}>
        <Pressable onPress={() => onEdit(item)} hitSlop={8}>
          <Pencil color={colors.textMuted} size={18} />
        </Pressable>
        <Pressable onPress={() => onDelete(item)} hitSlop={8}>
          <Trash2 color={colors.danger} size={18} />
        </Pressable>
      </View>
    </View>
  );
}

export default function TaskListScreen({ navigation }) {
  const { tasks, toggleTaskDone, deleteTask } = useStore();
  const [toDelete, setToDelete] = useState(null);

  // Open tasks first, then completed ones — each newest-first.
  const { open, done } = useMemo(() => partitionTasks(tasks), [tasks]);
  const data = [...open, ...done];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.heading}>Tasks</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{open.length} open</Text>
        </View>
      </View>

      <FlatList
        data={data}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TaskCard
            item={item}
            onToggle={toggleTaskDone}
            onEdit={(it) => navigation.navigate('AddTask', { editItem: it })}
            onDelete={setToDelete}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            Icon={ListChecks}
            title="No tasks yet"
            subtitle="Tap + to add a to-do. Check it off when it's done, or remove it with the trash icon."
          />
        }
      />

      <Pressable style={styles.fab} onPress={() => navigation.navigate('AddTask')}>
        <Plus color={colors.onPrimary} size={30} strokeWidth={2.5} />
      </Pressable>

      <ConfirmDialog
        visible={!!toDelete}
        title="Delete task?"
        message={toDelete?.title}
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          deleteTask(toDelete.id);
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
  title: { color: colors.text, fontSize: 16, fontWeight: '700' },
  strike: { textDecorationLine: 'line-through', color: colors.textMuted },
  note: { color: colors.textMuted, fontSize: 13, marginTop: spacing.xs, lineHeight: 18 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.sm },
  dot: { width: 10, height: 10, borderRadius: 5 },
  priority: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  cardActions: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
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
});
