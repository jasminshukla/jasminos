import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Input from '../components/Input';
import Button from '../components/Button';
import { useStore } from '../context/StoreContext';
import { colors, radius, spacing, TASK_PRIORITIES } from '../theme';

// Create / edit a to-do. Title is required; note and priority are optional.
// Deletion lives on the list screen (long-press / trash + confirm), not here.
export default function AddTaskScreen({ navigation, route }) {
  const { addTask, updateTask } = useStore();
  const editItem = route.params?.editItem || null;
  const isEdit = !!editItem;

  const [title, setTitle] = useState(editItem?.title || '');
  const [note, setNote] = useState(editItem?.note || '');
  const [priority, setPriority] = useState(editItem?.priority || 'medium');
  const [saving, setSaving] = useState(false);

  async function onSave() {
    if (!title.trim()) {
      Alert.alert('Name your task', 'e.g. Call the supplier, Pay the rent.');
      return;
    }
    setSaving(true);
    try {
      const payload = { title, note, priority };
      if (isEdit) await updateTask(editItem.id, payload);
      else await addTask(payload);
      navigation.goBack();
    } catch (e) {
      Alert.alert('Could not save', e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Input
          label="What needs doing?"
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Call the supplier"
        />

        <Input
          label="Notes (optional)"
          value={note}
          onChangeText={setNote}
          placeholder="Any details to remember…"
          multiline
        />

        <Text style={styles.sectionLabel}>Priority</Text>
        <View style={styles.chipsWrap}>
          {Object.entries(TASK_PRIORITIES).map(([key, meta]) => {
            const active = priority === key;
            return (
              <Pressable
                key={key}
                onPress={() => setPriority(key)}
                style={[
                  styles.chip,
                  active && { backgroundColor: meta.color, borderColor: meta.color },
                ]}
              >
                <View
                  style={[styles.dot, { backgroundColor: active ? '#fff' : meta.color }]}
                />
                <Text style={[styles.chipText, active && { color: '#fff' }]}>{meta.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Button
          title={isEdit ? 'Save changes' : 'Add task'}
          onPress={onSave}
          loading={saving}
          style={{ marginTop: spacing.xl }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.xl },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  chipText: { color: colors.text, fontSize: 14, fontWeight: '600' },
});
