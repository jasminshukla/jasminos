import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trash2 } from 'lucide-react-native';
import Input from '../components/Input';
import Button from '../components/Button';
import { useStore } from '../context/StoreContext';
import { colors, radius, spacing, ACCOUNT_TYPES } from '../theme';
import { parseAmount } from '../lib/money';

export default function AddAccountScreen({ navigation, route }) {
  const { addAccount, updateAccount, deleteAccount } = useStore();
  const editItem = route.params?.editItem || null;
  const isEdit = !!editItem;

  const [name, setName] = useState(editItem?.name || '');
  const [type, setType] = useState(editItem?.type || 'bank');
  const [balance, setBalance] = useState(editItem ? String(editItem.openingBalance) : '');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function onSave() {
    if (!name.trim()) {
      Alert.alert('Name your account', 'e.g. HDFC, Paytm, Cash in wallet.');
      return;
    }
    setSaving(true);
    try {
      const payload = { name, type, openingBalance: parseAmount(balance) };
      if (isEdit) await updateAccount(editItem.id, payload);
      else await addAccount(payload);
      navigation.goBack();
    } catch (e) {
      Alert.alert('Could not save', e.message);
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    try {
      await deleteAccount(editItem.id);
      navigation.goBack();
    } catch (e) {
      Alert.alert('Could not delete', e.message);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionLabel}>Account type</Text>
        <View style={styles.chipsWrap}>
          {Object.entries(ACCOUNT_TYPES).map(([key, meta]) => {
            const active = type === key;
            return (
              <Pressable
                key={key}
                onPress={() => setType(key)}
                style={[
                  styles.chip,
                  active && { backgroundColor: meta.color, borderColor: meta.color },
                ]}
              >
                <meta.Icon color={active ? '#fff' : colors.text} size={15} />
                <Text style={[styles.chipText, active && { color: '#fff' }]}>{meta.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Input
          label="Account name"
          value={name}
          onChangeText={setName}
          placeholder="e.g. HDFC Bank, Paytm, Cash"
          style={{ marginTop: spacing.xl }}
        />

        <Input
          label="Current balance"
          value={balance}
          onChangeText={setBalance}
          placeholder="0"
          keyboardType="decimal-pad"
        />
        <Text style={styles.hint}>
          The money in this account right now. Income and expenses you assign to it will move this
          balance up and down automatically.
        </Text>

        <Button
          title={isEdit ? 'Save changes' : 'Add account'}
          onPress={onSave}
          loading={saving}
          style={{ marginTop: spacing.xl }}
        />

        {isEdit ? (
          confirmDelete ? (
            <View style={styles.confirmRow}>
              <Button
                title="Cancel"
                variant="ghost"
                onPress={() => setConfirmDelete(false)}
                style={styles.confirmBtn}
              />
              <Button
                title="Delete"
                variant="danger"
                onPress={onDelete}
                style={styles.confirmBtn}
              />
            </View>
          ) : (
            <Pressable onPress={() => setConfirmDelete(true)} style={styles.deleteLink}>
              <Trash2 color={colors.danger} size={16} />
              <Text style={styles.deleteText}>Delete account</Text>
            </Pressable>
          )
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.xl },
  sectionLabel: { color: colors.textMuted, fontSize: 13, fontWeight: '600', marginBottom: spacing.md },
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
  chipText: { color: colors.text, fontSize: 14, fontWeight: '600' },
  hint: { color: colors.textMuted, fontSize: 12, marginTop: -spacing.sm, lineHeight: 18 },
  deleteLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  deleteText: { color: colors.danger, fontSize: 14, fontWeight: '700' },
  confirmRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl },
  confirmBtn: { flex: 1 },
});
