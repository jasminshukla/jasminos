import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ArrowDownLeft, ArrowUpRight, Calendar, Trash2 } from 'lucide-react-native';
import Input from '../components/Input';
import Button from '../components/Button';
import { useStore } from '../context/StoreContext';
import {
  colors,
  radius,
  spacing,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  ACCOUNT_TYPES,
} from '../theme';
import { formatMoney, parseAmount } from '../lib/money';
import { formatDateTime } from '../lib/datetime';

export default function AddTransactionScreen({ navigation, route }) {
  const { accounts, addTransaction, updateTransaction, deleteTransaction } = useStore();
  const editItem = route.params?.editItem || null;
  const isEdit = !!editItem;

  const [type, setType] = useState(editItem?.type || route.params?.kind || 'expense');
  const [amount, setAmount] = useState(editItem ? String(editItem.amount) : '');
  const [category, setCategory] = useState(editItem?.category || 'other');
  const [accountId, setAccountId] = useState(editItem?.accountId || null);
  const [note, setNote] = useState(editItem?.note || '');
  const [occurredAt, setOccurredAt] = useState(editItem?.occurredAt || Date.now());
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const income = type === 'income';
  const accent = income ? colors.income : colors.expense;
  const categories = useMemo(
    () => (income ? INCOME_CATEGORIES : EXPENSE_CATEGORIES),
    [income]
  );

  // An expense must always be paid from an account. Auto-select the first one
  // so the user never lands on an unassigned expense; income may stay unassigned.
  useEffect(() => {
    if (!income && accountId == null && accounts.length > 0) {
      setAccountId(accounts[0].id);
    }
  }, [income, accountId, accounts]);

  // Switching kind resets the category to a valid one for that kind.
  function switchType(next) {
    if (next === type) return;
    setType(next);
    setCategory('other');
  }

  function onPickerChange(event, selected) {
    setShowPicker(false);
    if (event.type === 'dismissed' || !selected) return;
    // Keep the time portion of "now" so same-day entries sort sensibly.
    const base = new Date(occurredAt);
    selected.setHours(base.getHours(), base.getMinutes(), 0, 0);
    setOccurredAt(selected.getTime());
  }

  async function onSave() {
    const value = parseAmount(amount);
    if (!value) {
      Alert.alert('Enter an amount', 'Type how much this was, e.g. 250.');
      return;
    }
    // Expenses must come out of an account — block if none exists or none chosen.
    if (!income) {
      if (accounts.length === 0) {
        Alert.alert(
          'Add an account first',
          'You need at least one bank/cash account before recording an expense. Add one from the Wallet screen.'
        );
        return;
      }
      if (!accountId) {
        Alert.alert('Choose an account', 'Select the account you paid this expense from.');
        return;
      }
    }
    setSaving(true);
    try {
      const payload = { type, amount: value, category, accountId, note, occurredAt };
      if (isEdit) await updateTransaction(editItem.id, payload);
      else await addTransaction(payload);
      navigation.goBack();
    } catch (e) {
      Alert.alert('Could not save', e.message);
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    try {
      await deleteTransaction(editItem.id);
      navigation.goBack();
    } catch (e) {
      Alert.alert('Could not delete', e.message);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Income / expense toggle. */}
        <View style={styles.toggle}>
          <Pressable
            style={[styles.toggleBtn, income && { backgroundColor: colors.income }]}
            onPress={() => switchType('income')}
          >
            <ArrowDownLeft color={income ? '#fff' : colors.textMuted} size={18} />
            <Text style={[styles.toggleText, income && styles.toggleTextActive]}>Income</Text>
          </Pressable>
          <Pressable
            style={[styles.toggleBtn, !income && { backgroundColor: colors.expense }]}
            onPress={() => switchType('expense')}
          >
            <ArrowUpRight color={!income ? '#fff' : colors.textMuted} size={18} />
            <Text style={[styles.toggleText, !income && styles.toggleTextActive]}>Expense</Text>
          </Pressable>
        </View>

        {/* Amount. */}
        <View style={styles.amountWrap}>
          <Text style={[styles.currency, { color: accent }]}>₹</Text>
          <Input
            value={amount}
            onChangeText={setAmount}
            placeholder="0"
            keyboardType="decimal-pad"
            style={styles.amountInput}
            // Visually large amount field.
          />
        </View>
        {parseAmount(amount) > 0 ? (
          <Text style={[styles.amountPreview, { color: accent }]}>
            {formatMoney(parseAmount(amount))}
          </Text>
        ) : null}

        {/* Category. */}
        <Text style={styles.sectionLabel}>Category</Text>
        <View style={styles.chipsWrap}>
          {Object.entries(categories).map(([key, meta]) => {
            const active = category === key;
            return (
              <Pressable
                key={key}
                onPress={() => setCategory(key)}
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

        {/* Account. */}
        <Text style={styles.sectionLabel}>{income ? 'Into account' : 'Paid from'}</Text>
        <View style={styles.chipsWrap}>
          {/* Income may be left unassigned; an expense must name an account. */}
          {income ? (
            <Pressable
              onPress={() => setAccountId(null)}
              style={[styles.chip, accountId === null && styles.chipActive]}
            >
              <Text style={[styles.chipText, accountId === null && styles.chipTextActive]}>
                Unassigned
              </Text>
            </Pressable>
          ) : null}
          {accounts.map((a) => {
            const meta = ACCOUNT_TYPES[a.type] || ACCOUNT_TYPES.bank;
            const active = accountId === a.id;
            return (
              <Pressable
                key={a.id}
                onPress={() => setAccountId(a.id)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <meta.Icon color={active ? colors.onPrimary : colors.text} size={15} />
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{a.name}</Text>
              </Pressable>
            );
          })}
        </View>
        {accounts.length === 0 ? (
          <Pressable onPress={() => navigation.navigate('AddAccount')}>
            <Text style={[styles.hint, !income && styles.hintWarn]}>
              {income
                ? 'No accounts yet — add a bank/cash account from the Wallet screen to track per-account balances.'
                : 'No account yet — you must add a bank/cash account before you can record an expense. Tap here to add one.'}
            </Text>
          </Pressable>
        ) : null}

        {/* Date. */}
        <Text style={styles.sectionLabel}>Date</Text>
        <Pressable onPress={() => setShowPicker(true)} style={styles.dateBtn}>
          <Calendar color={colors.primary} size={16} />
          <Text style={styles.dateText}>{formatDateTime(occurredAt)}</Text>
        </Pressable>
        {showPicker && (
          <DateTimePicker
            value={new Date(occurredAt)}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            maximumDate={new Date()}
            onChange={onPickerChange}
          />
        )}

        <Input
          label="Note (optional)"
          value={note}
          onChangeText={setNote}
          placeholder={income ? 'e.g. Client payment' : 'e.g. Groceries at the market'}
          style={{ marginTop: spacing.lg }}
        />

        <Button
          title={isEdit ? 'Save changes' : income ? 'Add income' : 'Add expense'}
          onPress={onSave}
          loading={saving}
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
              <Text style={styles.deleteText}>Delete transaction</Text>
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
  toggle: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.xs,
    marginBottom: spacing.xl,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
  },
  toggleText: { color: colors.textMuted, fontSize: 15, fontWeight: '700' },
  toggleTextActive: { color: '#fff' },
  amountWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  currency: { fontSize: 34, fontWeight: '800' },
  amountInput: { flex: 1, marginBottom: 0 },
  amountPreview: { fontSize: 14, fontWeight: '700', marginTop: spacing.sm },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    marginTop: spacing.xl,
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
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontSize: 14, fontWeight: '600' },
  chipTextActive: { color: colors.onPrimary },
  hint: { color: colors.textMuted, fontSize: 12, marginTop: spacing.md, lineHeight: 18 },
  hintWarn: { color: colors.danger },
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.lg,
  },
  dateText: { color: colors.text, fontSize: 15, fontWeight: '600' },
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
