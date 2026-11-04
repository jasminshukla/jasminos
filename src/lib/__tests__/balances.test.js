import { deriveBalances, monthTotals, expenseByCategory } from '../balances';

describe('deriveBalances', () => {
  it('returns zeros for empty / undefined input', () => {
    expect(deriveBalances([], [])).toEqual({ totalOnHand: 0, accountBalances: {} });
    expect(deriveBalances(undefined, undefined)).toEqual({
      totalOnHand: 0,
      accountBalances: {},
    });
  });

  it('sums opening balances when there are no transactions', () => {
    const { totalOnHand, accountBalances } = deriveBalances(
      [
        { id: 'a', openingBalance: 100 },
        { id: 'b', openingBalance: 50 },
      ],
      []
    );
    expect(totalOnHand).toBe(150);
    expect(accountBalances).toEqual({ a: 100, b: 50 });
  });

  it('moves both the account balance and the total for assigned transactions', () => {
    const { totalOnHand, accountBalances } = deriveBalances(
      [{ id: 'a', openingBalance: 100 }],
      [
        { type: 'income', amount: 50, accountId: 'a' },
        { type: 'expense', amount: 30, accountId: 'a' },
      ]
    );
    expect(accountBalances.a).toBe(120); // 100 + 50 - 30
    expect(totalOnHand).toBe(120);
  });

  it('counts unassigned transactions toward the total but no account', () => {
    const { totalOnHand, accountBalances } = deriveBalances(
      [{ id: 'a', openingBalance: 100 }],
      [{ type: 'income', amount: 40, accountId: null }]
    );
    expect(totalOnHand).toBe(140);
    expect(accountBalances).toEqual({ a: 100 });
  });

  it('counts transactions naming an unknown account toward the total only', () => {
    const { totalOnHand, accountBalances } = deriveBalances(
      [{ id: 'a', openingBalance: 0 }],
      [{ type: 'expense', amount: 25, accountId: 'ghost' }]
    );
    expect(totalOnHand).toBe(-25);
    expect(accountBalances).toEqual({ a: 0 });
  });

  it('coerces string opening balances / amounts to numbers', () => {
    const { totalOnHand, accountBalances } = deriveBalances(
      [{ id: 'a', openingBalance: '100' }],
      [{ type: 'income', amount: '25', accountId: 'a' }]
    );
    expect(accountBalances.a).toBe(125);
    expect(totalOnHand).toBe(125);
  });
});

describe('monthTotals', () => {
  // Pin a reference instant so month-boundary behavior is deterministic.
  const ref = new Date(2026, 5, 15).getTime(); // 15 Jun 2026

  it('returns zeros for empty / undefined input', () => {
    expect(monthTotals([], ref)).toEqual({ income: 0, expense: 0 });
    expect(monthTotals(undefined, ref)).toEqual({ income: 0, expense: 0 });
  });

  it('includes transactions within the reference month, split by type', () => {
    const { income, expense } = monthTotals(
      [
        { type: 'income', amount: 100, occurredAt: new Date(2026, 5, 10).getTime() },
        { type: 'expense', amount: 40, occurredAt: new Date(2026, 5, 12).getTime() },
      ],
      ref
    );
    expect(income).toBe(100);
    expect(expense).toBe(40);
  });

  it('excludes transactions from a prior month', () => {
    const { income, expense } = monthTotals(
      [{ type: 'expense', amount: 50, occurredAt: new Date(2026, 4, 30).getTime() }],
      ref
    );
    expect(expense).toBe(0);
    expect(income).toBe(0);
  });

  it('includes a transaction exactly at the first instant of the month', () => {
    const { income } = monthTotals(
      [{ type: 'income', amount: 10, occurredAt: new Date(2026, 5, 1).getTime() }],
      ref
    );
    expect(income).toBe(10);
  });

  it('falls back to createdAt when occurredAt is absent', () => {
    const { expense } = monthTotals(
      [{ type: 'expense', amount: 20, createdAt: new Date(2026, 5, 5).getTime() }],
      ref
    );
    expect(expense).toBe(20);
  });
});

describe('expenseByCategory', () => {
  const ref = new Date(2026, 5, 15).getTime(); // 15 Jun 2026
  const at = (day) => new Date(2026, 5, day).getTime();

  it('returns an empty array when there are no expenses this month', () => {
    expect(expenseByCategory([], ref)).toEqual([]);
    expect(expenseByCategory(undefined, ref)).toEqual([]);
    expect(
      expenseByCategory([{ type: 'income', amount: 100, occurredAt: at(5) }], ref)
    ).toEqual([]);
  });

  it('aggregates by category, sorts descending, and computes share of total', () => {
    const rows = expenseByCategory(
      [
        { type: 'expense', amount: 100, category: 'food', occurredAt: at(2) },
        { type: 'expense', amount: 50, category: 'food', occurredAt: at(3) },
        { type: 'expense', amount: 50, category: 'fun', occurredAt: at(4) },
        { type: 'income', amount: 999, category: 'salary', occurredAt: at(5) },
      ],
      ref
    );
    expect(rows).toEqual([
      { category: 'food', amount: 150, pct: 0.75 },
      { category: 'fun', amount: 50, pct: 0.25 },
    ]);
  });

  it('excludes expenses from a prior month', () => {
    const rows = expenseByCategory(
      [{ type: 'expense', amount: 80, category: 'food', occurredAt: new Date(2026, 4, 30).getTime() }],
      ref
    );
    expect(rows).toEqual([]);
  });
});
