// Pure money-derivation helpers shared by the Wallet and Insights screens.
// Kept free of React/Firestore so they can be unit-tested in isolation.

// Derive per-account balances and the headline "amount on hand" from the raw
// accounts + transactions arrays.
//
// totalOnHand = sum(opening balances) + net of every transaction's signed
// amount. A transaction's amount counts toward the total regardless of which
// account it names (or none), so unassigned/orphaned transactions still affect
// the headline; only transactions naming a known account move that account's
// per-account balance.
export function deriveBalances(accounts, transactions) {
  const accountBalances = {};
  let opening = 0;
  (accounts || []).forEach((a) => {
    const ob = Number(a.openingBalance) || 0;
    accountBalances[a.id] = ob;
    opening += ob;
  });

  let net = 0;
  (transactions || []).forEach((t) => {
    const amt = Number(t.amount) || 0;
    const signed = t.type === 'income' ? amt : -amt;
    net += signed;
    if (t.accountId && accountBalances[t.accountId] != null) {
      accountBalances[t.accountId] += signed;
    }
  });

  return { totalOnHand: opening + net, accountBalances };
}

// Sum income and expense for the calendar month containing `ref` (defaults to
// now). A transaction belongs to the month if its occurredAt — falling back to
// createdAt — is on/after the first instant of that month.
export function monthTotals(transactions, ref = Date.now()) {
  const d = new Date(ref);
  const monthStart = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
  let income = 0;
  let expense = 0;
  (transactions || []).forEach((t) => {
    const amt = Number(t.amount) || 0;
    if ((t.occurredAt || t.createdAt) >= monthStart) {
      if (t.type === 'income') income += amt;
      else expense += amt;
    }
  });
  return { income, expense };
}

// Break this month's expenses down by category. Returns an array of
// { category, amount, pct } sorted by amount descending, where pct is the
// category's share of total month expense (0 when there's no expense). Income
// is ignored. Same month-boundary rule as monthTotals.
export function expenseByCategory(transactions, ref = Date.now()) {
  const d = new Date(ref);
  const monthStart = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
  const totals = {};
  let total = 0;
  (transactions || []).forEach((t) => {
    if (t.type !== 'expense') return;
    if ((t.occurredAt || t.createdAt) < monthStart) return;
    const amt = Number(t.amount) || 0;
    const key = t.category || 'other';
    totals[key] = (totals[key] || 0) + amt;
    total += amt;
  });
  return Object.entries(totals)
    .map(([category, amount]) => ({
      category,
      amount,
      pct: total ? amount / total : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}
