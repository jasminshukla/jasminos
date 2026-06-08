import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import Input from '../components/Input';
import Button from '../components/Button';
import { useStore } from '../context/StoreContext';
import { colors, radius, spacing } from '../theme';
import { formatDateTime, presetDates } from '../lib/datetime';

export default function AddFollowUpScreen({ navigation }) {
  const { addFollowup } = useStore();
  const [title, setTitle] = useState('');
  const [contact, setContact] = useState('');
  const [note, setNote] = useState('');
  const [remindAt, setRemindAt] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('date');
  const [saving, setSaving] = useState(false);

  const presets = presetDates();

  function onPickerChange(event, selected) {
    if (event.type === 'dismissed') {
      setShowPicker(false);
      return;
    }
    if (Platform.OS === 'android' && pickerMode === 'date') {
      // After choosing the date on Android, chain into the time picker.
      const base = selected || new Date();
      setRemindAt(base.getTime());
      setPickerMode('time');
      setShowPicker(true);
      return;
    }
    if (selected) {
      const base = remindAt ? new Date(remindAt) : new Date();
      if (pickerMode === 'time') {
        base.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
        setRemindAt(base.getTime());
      } else {
        setRemindAt(selected.getTime());
      }
    }
    setShowPicker(false);
  }

  function openCustomPicker() {
    setPickerMode('date');
    setShowPicker(true);
  }

  async function onSave() {
    if (!title.trim()) {
      Alert.alert('Missing title', 'Give your follow-up a title.');
      return;
    }
    if (remindAt && remindAt <= Date.now()) {
      Alert.alert('Pick a future time', 'The reminder time must be in the future.');
      return;
    }
    setSaving(true);
    try {
      await addFollowup({ title, contact, note, remindAt });
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
          label="What's the follow-up?"
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Call client about proposal"
        />
        <Input
          label="Contact / who (optional)"
          value={contact}
          onChangeText={setContact}
          placeholder="e.g. Priya — +91 98xxxxxx"
        />
        <Input
          label="Notes (optional)"
          value={note}
          onChangeText={setNote}
          placeholder="Anything you want to remember…"
          multiline
        />

        <Text style={styles.sectionLabel}>Remind me</Text>
        <View style={styles.chips}>
          {presets.map((p) => {
            const active = remindAt === p.value;
            return (
              <Pressable
                key={p.label}
                onPress={() => setRemindAt(active ? null : p.value)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{p.label}</Text>
              </Pressable>
            );
          })}
          <Pressable onPress={openCustomPicker} style={[styles.chip, styles.chipCustom]}>
            <Text style={styles.chipText}>📅 Custom…</Text>
          </Pressable>
        </View>

        {remindAt ? (
          <View style={styles.reminderBox}>
            <Text style={styles.reminderText}>
              🔔 You'll get a push notification {'\n'}
              <Text style={styles.reminderWhen}>{formatDateTime(remindAt)}</Text>
            </Text>
            <Pressable onPress={() => setRemindAt(null)}>
              <Text style={styles.clear}>Clear</Text>
            </Pressable>
          </View>
        ) : (
          <Text style={styles.hint}>No reminder set — pick a time to get notified.</Text>
        )}

        {showPicker && (
          <DateTimePicker
            value={remindAt ? new Date(remindAt) : new Date(Date.now() + 3600000)}
            mode={pickerMode}
            display="default"
            onChange={onPickerChange}
          />
        )}

        <Button title="Save follow-up" onPress={onSave} loading={saving} style={{ marginTop: spacing.lg }} />
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
    marginBottom: spacing.md,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  chipCustom: { borderStyle: 'dashed' },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontSize: 14, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  reminderBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardAlt,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  reminderText: { color: colors.text, fontSize: 14, lineHeight: 20, flex: 1 },
  reminderWhen: { fontWeight: '800', color: colors.primary },
  clear: { color: colors.danger, fontWeight: '700', marginLeft: spacing.md },
  hint: { color: colors.textMuted, fontSize: 13, marginTop: spacing.lg },
});
