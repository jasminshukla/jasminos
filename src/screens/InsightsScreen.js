import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, TrendingDown, PieChart } from 'lucide-react-native';
import { useStore } from '../context/StoreContext';
import EmptyState from '../components/EmptyState';
import Loading from '../components/Loading';
import { colors, radius, spacing, getCategoryMeta } from '../theme';
import { formatMoney } from '../lib/money';
import { monthTotals, expenseByCategory } from '../lib/balances';

// This-month spending insights: income vs expense, net, and a per-category
// expense breakdown with proportional bars. Reuses the pure balances lib.
export default function InsightsScreen() {
  const { ready, transactions } = useStore();

  const { income, expense } = useMemo(() => monthTotals(transactions), [transactions]);
  const breakdown = useMemo(() => expenseByCategory(transactions), [transactions]);
  const net = income - expense;
  // Scale each bar to the largest category so the leader fills the track.
  const maxAmount = breakdown.length ? breakdown[0].amount : 0;

  if (!ready) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <Loading />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.monthLabel}>This month</Text>

        {/* Income vs expense. */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <TrendingUp color={colors.income} size={18} />
            <Text style={styles.statLabel}>Income</Text>
            <Text style={[styles.statValue, { color: colors.income }]}>{formatMoney(income)}</Text>
          </View>
          <View style={styles.statCard}>
            <TrendingDown color={colors.expense} size={18} />
            <Text style={styles.statLabel}>Expense</Text>
            <Text style={[styles.statValue, { color: colors.expense }]}>
              {formatMoney(expense)}
            </Text>
          </View>
        </View>

        {/* Net. */}
        <View style={styles.netCard}>
          <Text style={styles.netLabel}>Net this month</Text>
          <Text
            style={[styles.netValue, { color: net >= 0 ? colors.income : colors.expense }]}
          >
            {formatMoney(net, { sign: true })}
          </Text>
        </View>

        {/* Category breakdown. */}
        <Text style={styles.sectionTitle}>Where it went</Text>
        {breakdown.length === 0 ? (
          <EmptyState
            Icon={PieChart}
            title="No spending yet this month"
            subtitle="Add an expense and your category breakdown will show up here."
          />
        ) : (
          <View style={styles.breakdown}>
            {breakdown.map((row) => {
              const meta = getCategoryMeta('expense', row.category);
              const width = maxAmount ? `${Math.round((row.amount / maxAmount) * 100)}%` : '0%';
              return (
                <View key={row.category} style={styles.catRow}>
                  <View style={[styles.catIcon, { backgroundColor: meta.color }]}>
                    <meta.Icon color="#fff" size={16} />
                  </View>
                  <View style={styles.catBody}>
                    <View style={styles.catTop}>
                      <Text style={styles.catLabel}>{meta.label}</Text>
                      <Text style={styles.catAmount}>{formatMoney(row.amount)}</Text>
                    </View>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { width, backgroundColor: meta.color }]} />
                    </View>
                    <Text style={styles.catPct}>{Math.round(row.pct * 100)}% of spend</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.xl, paddingBottom: 120 },
  monthLabel: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  statLabel: { color: colors.textMuted, fontSize: 12, marginTop: spacing.xs },
  statValue: { fontSize: 20, fontWeight: '800' },
  netCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  netLabel: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  netValue: { fontSize: 20, fontWeight: '800' },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  breakdown: { gap: spacing.lg },
  catRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  catIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catBody: { flex: 1 },
  catTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  catLabel: { color: colors.text, fontSize: 15, fontWeight: '700' },
  catAmount: { color: colors.text, fontSize: 15, fontWeight: '800' },
  barTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.cardAlt,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  barFill: { height: 8, borderRadius: 4 },
  catPct: { color: colors.textMuted, fontSize: 12, marginTop: spacing.xs },
});
