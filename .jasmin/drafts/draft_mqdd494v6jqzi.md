# Draft: Insights screen + expenseByCategory helper

> Task: `task_mqdbxtrcw4gc8`

1. balances.js: add expenseByCategory(transactions, ref=Date.now()) -> sorted-desc array of {category, amount, pct} for this month's expenses (pct = amount/total, 0 when total 0). Pure, null-safe, same month-boundary logic as monthTotals.
2. New src/screens/InsightsScreen.js: reuse monthTotals (income vs expense stat cards + net) and expenseByCategory (rows with getCategoryMeta icon/color, label, amount, % and a proportional bar scaled to the largest category). EmptyState when no expenses this month. Wrap in SafeAreaView + ScrollView; gate on store `ready` with <Loading/>.
3. AppTabs MoneyStack: add <MoneyStack.Screen name="Insights" title="Insights">.
4. WalletScreen: add a pressable 'View insights' footer inside the balance card that navigates to 'Insights'.
5. Add a couple expenseByCategory tests to balances.test.js and re-run npm test.

## Implementation Notes

Bar width scaled to the max category amount (not total) so the leading category fills the bar — clearer visual. % shown is of total month expense. No charting dependency. Insights lives in MoneyStack (reachable from Wallet) per the task. Reuses balances-lib per the earlier decision rather than re-deriving.
