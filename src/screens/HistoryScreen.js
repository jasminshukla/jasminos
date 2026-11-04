import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ScrollView,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { History as HistoryIcon, Search, X } from 'lucide-react-native';
import { useStore } from '../context/StoreContext';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import TransactionRow from '../components/TransactionRow';
import Loading from '../components/Loading';
import { colors, radius, spacing, getCategoryMeta } from '../theme';
import { formatMoney } from '../lib/money';
import { formatDate } from '../lib/datetime';

const TYPE_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'income', label: 'Income' },
  { key: 'expense', label: 'Expense' },
];

// Full transaction history, newest first, grouped by day. Tap a row to edit,
// long-press to delete. Filter by type / account and search note + category.
export default function HistoryScreen({ navigation }) {
  const { ready, accounts, transactions, deleteTransaction } = useStore();
  const [toDelete, setToDelete] = useState(null);
  const [type, setType] = useState('all');
  const [acct, setAcct] = useState('all'); // 'all' | accountId | 'unassigned'
  const [q, setQ] = useState('');

  const accountName = (id) => accounts.find((a) => a.id === id)?.name || null;

  const hasFilter = type !== 'all' || acct !== 'all' || q.trim() !== '';
  const clearAll = () => {
    setType('all');
    setAcct('all');
    setQ('');
  };

  // Apply the active filters before grouping. Search matches the note, the
  // category label, and the account name (so a category/account is reachable
  // by typing it).
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return transactions.filter((t) => {
      if (type !== 'all' && t.type !== type) return false;
      if (acct === 'unassigned' && t.accountId) return false;
      if (acct !== 'all' && acct !== 'unassigned' && t.accountId !== acct) return false;
      if (needle) {
        const cat = getCategoryMeta(t.type, t.category).label.toLowerCase();
        const note = (t.note || '').toLowerCase();
        const accName = (accountName(t.accountId) || '').toLowerCase();
        if (!cat.includes(needle) && !note.includes(needle) && !accName.includes(needle)) {
          return false;
        }
      }
      return true;
    });
    // accountName depends on accounts; include both as deps.
  }, [transactions, accounts, type, acct, q]);

  // Flatten into rows interleaved with date headers so a single FlatList can
  // render day separators without nested lists.
  const rows = useMemo(() => {
    const sorted = [...filtered].sort(
      (a, b) => (b.occurredAt || b.createdAt) - (a.occurredAt || a.createdAt)
    );
    const out = [];
    let lastDay = null;
    sorted.forEach((t) => {
      const day = formatDate(t.occurredAt || t.createdAt);
      if (day !== lastDay) {
        out.push({ kind: 'header', id: `h-${day}`, label: day });
        lastDay = day;
      }
      out.push({ kind: 'tx', id: t.id, tx: t });
    });
    return out;
  }, [filtered]);

  const ListHeader = (
    <View style={styles.filters}>
      {/* Search box. */}
      <View style={styles.searchBox}>
        <Search color={colors.textMuted} size={16} />
        <TextInput
          style={styles.searchInput}
          value={q}
          onChangeText={setQ}
          placeholder="Search note, category or account"
          placeholderTextColor={colors.textMuted}
          returnKeyType="search"
        />
        {q ? (
          <Pressable onPress={() => setQ('')} hitSlop={8}>
            <X color={colors.textMuted} size={16} />
          </Pressable>
        ) : null}
      </View>

      {/* Income / expense / all. */}
      <View style={styles.segment}>
        {TYPE_FILTERS.map((f) => {
          const active = type === f.key;
          return (
            <Pressable
              key={f.key}
              onPress={() => setType(f.key)}
              style={[styles.segmentBtn, active && styles.segmentBtnActive]}
            >
              <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Account chips (only when there are accounts to filter by). */}
      {accounts.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
          keyboardShouldPersistTaps="handled"
        >
          {[
            { id: 'all', name: 'All accounts' },
            ...accounts,
            { id: 'unassigned', name: 'Unassigned' },
          ].map((a) => {
            const active = acct === a.id;
            return (
              <Pressable
                key={a.id}
                onPress={() => setAcct(a.id)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{a.name}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}

      {/* Active-filter summary + clear-all. */}
      {hasFilter ? (
        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>
            {filtered.length} of {transactions.length} shown
          </Text>
          <Pressable onPress={clearAll} hitSlop={8} style={styles.clearBtn}>
            <X color={colors.primary} size={14} />
            <Text style={styles.clearText}>Clear</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );

  if (!ready) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <Loading />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <FlatList
        data={rows}
        keyExtractor={(i) => i.id}
        ListHeaderComponent={transactions.length > 0 ? ListHeader : null}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) =>
          item.kind === 'header' ? (
            <Text style={styles.dayHeader}>{item.label}</Text>
          ) : (
            <TransactionRow
              item={item.tx}
              accountName={accountName(item.tx.accountId)}
              onEdit={(it) =>
                navigation.navigate('AddTransaction', { kind: it.type, editItem: it })
              }
              onDelete={setToDelete}
            />
          )
        }
        ListEmptyComponent={
          transactions.length === 0 ? (
            <EmptyState
              Icon={HistoryIcon}
              title="No transactions yet"
              subtitle="Your income and expenses will appear here once you add them."
            />
          ) : (
            <EmptyState
              Icon={Search}
              title="No matches"
              subtitle="No transactions match these filters. Try clearing them."
            />
          )
        }
      />

      <ConfirmDialog
        visible={!!toDelete}
        title="Delete this transaction?"
        message={
          toDelete
            ? `${getCategoryMeta(toDelete.type, toDelete.category).label} · ${formatMoney(
                toDelete.amount
              )}`
            : ''
        }
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          deleteTransaction(toDelete.id);
          setToDelete(null);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  list: { paddingHorizontal: spacing.xl, paddingBottom: 120 },
  filters: { paddingTop: spacing.md },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchInput: { flex: 1, color: colors.text, fontSize: 15, padding: 0 },
  segment: {
    flexDirection: 'row',
    gap: spacing.xs,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.xs,
    marginTop: spacing.md,
  },
  segmentBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
  },
  segmentBtnActive: { backgroundColor: colors.primary },
  segmentText: { color: colors.textMuted, fontSize: 14, fontWeight: '700' },
  segmentTextActive: { color: colors.onPrimary },
  chipsRow: { gap: spacing.sm, paddingTop: spacing.md, paddingRight: spacing.xl },
  chip: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: colors.onPrimary },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  summaryText: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  clearBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  clearText: { color: colors.primary, fontSize: 13, fontWeight: '700' },
  dayHeader: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    marginTop: spacing.xl,
  },
});
