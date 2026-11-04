# Jasmin Memory Index

_6 memories. Auto-generated — do not edit by hand._

## architecture

- **insights-screen** — Insights screen lives in MoneyStack, reached from Wallet's balance-card footer; uses balances.expenseByCategory — links: [[balances-lib]]
- **tasks-store-api** — Tasks module store API: tasks array + addTask/updateTask/toggleTaskDone/deleteTask on useStore() — links: [[firestore-rules-structure]]
- **balances-lib** — Wallet balance math lives in pure src/lib/balances.js (deriveBalances, monthTotals), reused by Wallet and Insights — links: [[account-delete-cascade]]
- **firestore-rules-structure** — firestore.rules uses explicit per-collection owner-scoped matches (no wildcard) with shape validation on wallet writes — links: [[account-delete-cascade]]
- **account-delete-cascade** — Deleting a wallet account reassigns its transactions to Unassigned (accountId=null) atomically, never deletes them

## reference

- **test-setup** — Tests run via `npm test` (jest-expo preset); pure-fn specs live in src/lib/__tests__/ — links: [[balances-lib]]

