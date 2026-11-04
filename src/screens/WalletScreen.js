import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Wallet,
  TrendingUp,
  TrendingDown,
  History,
  PieChart,
  ChevronRight,
} from 'lucide-react-native';
import { useStore } from '../context/StoreContext';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import TransactionRow from '../components/TransactionRow';
import Loading from '../components/Loading';
import { colors, radius, spacing, ACCOUNT_TYPES, getCategoryMeta } from '../theme';
import { formatMoney } from '../lib/money';
import { deriveBalances, monthTotals } from '../lib/balances';

// How many transactions to preview on the Wallet screen before "History".
const RECENT_LIMIT = 6;

export default function WalletScreen({ navigation }) {
  const { ready, accounts, transactions, deleteTransaction } = useStore();
  const [toDelete, setToDelete] = useState(null);

  // Headline balance + per-account balances, derived from the raw arrays.
  // Transactions with no account still count toward the total — so the "amount
  // on hand" works even before any bank account is added.
  const { totalOnHand, accountBalances } = useMemo(
    () => deriveBalances(accounts, transactions),
    [accounts, transactions]
  );
  // This calendar month's income / expense totals.
  const { income: monthIncome, expense: monthExpense } = useMemo(
    () => monthTotals(transactions),
    [transactions]
  );

  const sortedTx = useMemo(
    () =>
      [...transactions].sort(
        (a, b) => (b.occurredAt || b.createdAt) - (a.occurredAt || a.createdAt)
      ),
    [transactions]
  );
  const recentTx = useMemo(() => sortedTx.slice(0, RECENT_LIMIT), [sortedTx]);

  const accountName = (id) => accounts.find((a) => a.id === id)?.name || null;

  const ListHeader = (
    <View>
      <View style={styles.header}>
        <Text style={styles.heading}>Wallet</Text>
        <Text style={styles.sub}>Track income, spends & balance</Text>
      </View>

      {/* Headline "amount on hand" + this-month in/out, UPI-app style. */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Amount on hand</Text>
        <Text style={styles.balanceValue}>{formatMoney(totalOnHand)}</Text>
        <View style={styles.monthRow}>
          <View style={styles.monthItem}>
            <TrendingUp color={colors.income} size={16} />
            <View>
              <Text style={styles.monthLabel}>This month in</Text>
              <Text style={[styles.monthValue, { color: colors.income }]}>
                {formatMoney(monthIncome)}
              </Text>
            </View>
          </View>
          <View style={styles.monthDivider} />
          <View style={styles.monthItem}>
            <TrendingDown color={colors.expense} size={16} />
            <View>
              <Text style={styles.monthLabel}>This month out</Text>
              <Text style={[styles.monthValue, { color: colors.expense }]}>
                {formatMoney(monthExpense)}
              </Text>
            </View>
          </View>
        </View>

        <Pressable
          style={styles.insightsBtn}
          onPress={() => navigation.navigate('Insights')}
        >
          <PieChart color={colors.primary} size={16} />
          <Text style={styles.insightsText}>View insights</Text>
          <ChevronRight color={colors.textMuted} size={16} />
        </Pressable>
      </View>

      {/* Quick actions: add income / add expense. */}
      <View style={styles.actionsRow}>
        <Pressable
          style={[styles.action, { backgroundColor: colors.income }]}
          onPress={() => navigation.navigate('AddTransaction', { kind: 'income' })}
        >
          <ArrowDownLeft color="#fff" size={20} strokeWidth={2.6} />
          <Text style={styles.actionText}>Add income</Text>
        </Pressable>
        <Pressable
          style={[styles.action, { backgroundColor: colors.expense }]}
          onPress={() => navigation.navigate('AddTransaction', { kind: 'expense' })}
        >
          <ArrowUpRight color="#fff" size={20} strokeWidth={2.6} />
          <Text style={styles.actionText}>Add expense</Text>
        </Pressable>
      </View>

      {/* Accounts: horizontal cards + add-account tile. */}
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>Accounts</Text>
        <Pressable onPress={() => navigation.navigate('AddAccount')}>
          <Text style={styles.sectionAction}>+ Add account</Text>
        </Pressable>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.accountsRow}
      >
        {accounts.map((a) => {
          const meta = ACCOUNT_TYPES[a.type] || ACCOUNT_TYPES.bank;
          return (
            <Pressable
              key={a.id}
              style={styles.accountCard}
              onPress={() => navigation.navigate('AddAccount', { editItem: a })}
            >
              <View style={[styles.accountIcon, { backgroundColor: meta.color }]}>
                <meta.Icon color="#fff" size={16} />
              </View>
              <Text style={styles.accountName} numberOfLines={1}>
                {a.name}
              </Text>
              <Text style={styles.accountType}>{meta.label}</Text>
              <Text style={styles.accountBalance}>
                {formatMoney(accountBalances[a.id] || 0)}
              </Text>
            </Pressable>
          );
        })}
        <Pressable
          style={[styles.accountCard, styles.addAccountCard]}
          onPress={() => navigation.navigate('AddAccount')}
        >
          <Plus color={colors.primary} size={22} strokeWidth={2.5} />
          <Text style={styles.addAccountText}>Add bank{'\n'}account</Text>
        </Pressable>
      </ScrollView>

      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>Recent transactions</Text>
        {transactions.length > 0 ? (
          <Pressable
            style={styles.historyBtn}
            onPress={() => navigation.navigate('History')}
          >
            <History color={colors.primary} size={15} />
            <Text style={styles.historyText}>History</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );

  if (!ready) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Loading />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={recentTx}
        keyExtractor={(i) => i.id}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TransactionRow
            item={item}
            accountName={accountName(item.accountId)}
            onEdit={(it) =>
              navigation.navigate('AddTransaction', { kind: it.type, editItem: it })
            }
            onDelete={setToDelete}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            Icon={Wallet}
            title="No transactions yet"
            subtitle="Tap Add income or Add expense above to record your first entry. Long-press any row to delete it."
          />
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
  header: { paddingTop: spacing.md, paddingBottom: spacing.lg },
  heading: { color: colors.text, fontSize: 26, fontWeight: '800' },
  sub: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  balanceCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
  },
  balanceLabel: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  balanceValue: { color: colors.text, fontSize: 38, fontWeight: '800', marginTop: spacing.xs },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.lg,
  },
  monthItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  monthDivider: { width: 1, height: 32, backgroundColor: colors.border },
  monthLabel: { color: colors.textMuted, fontSize: 12 },
  monthValue: { fontSize: 16, fontWeight: '800', marginTop: 1 },
  insightsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.lg,
  },
  insightsText: { flex: 1, color: colors.primary, fontSize: 14, fontWeight: '700' },
  actionsRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  action: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md + 2,
    borderRadius: radius.md,
  },
  actionText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
  },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '800', marginTop: spacing.xl },
  sectionAction: { color: colors.primary, fontSize: 14, fontWeight: '700', marginTop: spacing.xl },
  historyBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.xl },
  historyText: { color: colors.primary, fontSize: 14, fontWeight: '700' },
  accountsRow: { gap: spacing.md, paddingTop: spacing.md, paddingRight: spacing.xl },
  accountCard: {
    width: 150,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  accountIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  accountName: { color: colors.text, fontSize: 15, fontWeight: '700' },
  accountType: { color: colors.textMuted, fontSize: 12, marginTop: 1 },
  accountBalance: { color: colors.text, fontSize: 18, fontWeight: '800', marginTop: spacing.sm },
  addAccountCard: {
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
    borderColor: colors.primary,
    gap: spacing.sm,
  },
  addAccountText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
});
