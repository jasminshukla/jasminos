# Draft: History filters: type + account + search

> Task: `task_mqdbxtr8v9n0v`

Rewrite HistoryScreen with three filters applied in a useMemo before the existing day-grouping pass:
- type: 'all' | 'income' | 'expense' (segmented control)
- account: 'all' | accountId | 'unassigned' (horizontal chip row built from accounts)
- q: free-text, matched case-insensitively against note, category label (getCategoryMeta), and account name — this covers the 'search over note/category' requirement and makes category reachable.

Filter order in predicate: type, then account (handle 'unassigned' = accountId falsy), then q across the three text fields. Feed the filtered array into the unchanged grouping reducer. Controls live in the FlatList ListHeaderComponent. Show an active-filter summary line ("N of M shown") + a Clear button when any filter is non-default. EmptyState branches: 'No transactions yet' when there are none at all vs 'No matches' when filters exclude everything.

## Implementation Notes

Use a plain styled TextInput (not the form Input) to avoid label/margin baggage. keyboardShouldPersistTaps="handled" so tapping chips while the keyboard is open works. Category as a discrete filter is intentionally folded into search (11 expense + 5 income labels would bloat the header); account stays a discrete chip row since the set is small and user-defined. Keep the loading gate added in the previous task.
