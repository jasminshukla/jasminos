# Draft: Extract deriveBalances + monthTotals into src/lib/balances.js

> Task: `task_mqdbxtqzcy13a`

Create src/lib/balances.js with two pure functions, then refactor WalletScreen to use them with identical behavior.

deriveBalances(accounts, transactions) -> { totalOnHand, accountBalances }
  - seed accountBalances[a.id] = Number(a.openingBalance)||0, accumulate opening sum
  - for each tx: signed = type==='income' ? +amt : -amt; net += signed; if accountId present in balances, add signed there
  - totalOnHand = opening + net

monthTotals(transactions, ref = Date.now()) -> { income, expense }
  - monthStart = first of ref's month; sum amounts where (occurredAt||createdAt) >= monthStart, split by type

WalletScreen: replace the single combined useMemo with deriveBalances(accounts,transactions) (memo on [accounts,transactions]) and monthTotals(transactions) (memo on [transactions]); rename destructured income/expense to monthIncome/monthExpense.

## Implementation Notes

Behavior parity: same Number()||0 coercion, same signed convention, same occurredAt||createdAt fallback, same month-start boundary. Splitting into two functions (vs the original single pass) is a negligible second loop but makes each unit-testable and lets the Insights screen reuse them. ref defaults to Date.now() so tests can pin a deterministic month. Category breakdown helper is intentionally deferred to the Insights task.
