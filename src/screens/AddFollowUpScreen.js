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
import * as Contacts from 'expo-contacts';
import { Contact, Calendar, Bell } from 'lucide-react-native';
import Input from '../components/Input';
import Button from '../components/Button';
import { useStore } from '../context/StoreContext';
import { colors, radius, spacing } from '../theme';
import { formatDateTime, presetDates } from '../lib/datetime';

export default function AddFollowUpScreen({ navigation, route }) {
  const { addFollowup, updateFollowup } = useStore();
  const editItem = route.params?.editItem || null;
  const isEdit = !!editItem;
  const [title, setTitle] = useState(editItem?.title || '');
  const [contact, setContact] = useState(editItem?.contact || '');
  const [note, setNote] = useState(editItem?.note || '');
  const [remindAt, setRemindAt] = useState(editItem?.remindAt || null);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('date');
  const [saving, setSaving] = useState(false);

  const presets = presetDates();

  function onPickerChange(event, selected) {
    if (event.type === 'dismissed') {
      setShowPicker(false);
      return;
    }
    if (Platform.OS === 'android') {
      if (pickerMode === 'date') {
        // After choosing the date on Android, chain into the time picker.
        const base = selected || new Date();
        setRemindAt(base.getTime());
        setPickerMode('time');
        setShowPicker(true);
        return;
      }
      // Time chosen — combine with the previously chosen date.
      if (selected) {
        const base = remindAt ? new Date(remindAt) : new Date();
        base.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
        setRemindAt(base.getTime());
      }
      setShowPicker(false);
      return;
    }
    // iOS: a single 'datetime' spinner picks both date & time. Update live and
    // keep it open until the user taps Done.
    if (selected) setRemindAt(selected.getTime());
  }

  function openCustomPicker() {
    // iOS can pick date + time together; Android chains date -> time.
    setPickerMode(Platform.OS === 'ios' ? 'datetime' : 'date');
    setShowPicker(true);
  }

  async function pickContact() {
    try {
      const c = await Contacts.presentContactPickerAsync();
      if (!c) return; // user cancelled
      const fullName =
        c.name || [c.firstName, c.lastName].filter(Boolean).join(' ').trim();
      const phone = c.phoneNumbers?.[0]?.number || '';
      setContact(phone ? `${fullName} — ${phone}`.trim() : fullName);
    } catch (e) {
      Alert.alert('Could not open contacts', e.message);
    }
  }

  async function onSave() {
    if (!title.trim()) {
      Alert.alert('Missing title', 'Give your follow-up a title.');
      return;
    }
    // Only enforce a future time when the reminder is new or has been changed —
    // editing an already-overdue follow-up shouldn't force re-picking a time.
    if (remindAt && remindAt <= Date.now() && remindAt !== editItem?.remindAt) {
      Alert.alert('Pick a future time', 'The reminder time must be in the future.');
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await updateFollowup(editItem.id, { title, contact, note, remindAt });
      } else {
        await addFollowup({ title, contact, note, remindAt });
      }
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
        <View style={styles.contactRow}>
          <Text style={styles.contactLabel}>Contact / who (optional)</Text>
          <Pressable onPress={pickContact} style={styles.contactBtn}>
            <Contact color={colors.primary} size={14} />
            <Text style={styles.contactBtnText}>Pick from contacts</Text>
          </Pressable>
        </View>
        <Input
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
            <View style={styles.chipInner}>
              <Calendar color={colors.text} size={14} />
              <Text style={styles.chipText}>Custom…</Text>
            </View>
          </Pressable>
        </View>

        {remindAt ? (
          <View style={styles.reminderBox}>
            <Bell color={colors.primary} size={18} />
            <Text style={styles.reminderText}>
              You'll get a push notification {'\n'}
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
          <View style={styles.pickerWrap}>
            <DateTimePicker
              value={remindAt ? new Date(remindAt) : new Date(Date.now() + 3600000)}
              mode={pickerMode}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              minimumDate={new Date()}
              onChange={onPickerChange}
            />
            {Platform.OS === 'ios' && (
              <Pressable onPress={() => setShowPicker(false)} style={styles.doneBtn}>
                <Text style={styles.doneText}>Done</Text>
              </Pressable>
            )}
          </View>
        )}

        <Button
          title={isEdit ? 'Save changes' : 'Save follow-up'}
          onPress={onSave}
          loading={saving}
          style={{ marginTop: spacing.lg }}
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
  chipInner: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontSize: 14, fontWeight: '600' },
  chipTextActive: { color: colors.onPrimary },
  reminderBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.cardAlt,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  reminderText: { color: colors.text, fontSize: 14, lineHeight: 20, flex: 1 },
  reminderWhen: { fontWeight: '800', color: colors.primary },
  clear: { color: colors.danger, fontWeight: '700', marginLeft: spacing.md },
  hint: { color: colors.textMuted, fontSize: 13, marginTop: spacing.lg },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  contactLabel: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.cardAlt,
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  contactBtnText: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  pickerWrap: { marginTop: spacing.md },
  doneBtn: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.sm,
  },
  doneText: { color: colors.onPrimary, fontWeight: '700', fontSize: 14 },
});
