# Draft: Cascade account deletion via writeBatch

> Task: `task_mqdbxtqobo0k6`

Rewrite StoreContext.deleteAccount so deleting an account first reassigns its transactions to Unassigned (accountId=null), then deletes the account doc — atomically.

Plan:
1. Import `writeBatch` from '@firebase/firestore' (add to existing scoped import).
2. In deleteAccount(id): derive affected = transactions.filter(t => t.accountId === id) from local state (no extra read needed — store already subscribes to all transactions).
3. Build a writeBatch: for each affected tx, batch.update(txDoc, { accountId: null }); then batch.delete(accountDoc).
4. await batch.commit().

## Implementation Notes

Correctness on totalOnHand (= sum(account.openingBalance) + net of all tx signed amounts): nulling accountId does NOT change net (net is account-agnostic), so recorded income/expense stays counted. Deleting the account removes only its openingBalance from the opening sum — which is the intended effect of removing that account. Affected transactions surface as 'Unassigned', a state the AddTransaction UI already supports. Single atomic commit avoids a half-deleted state. Using local `transactions` state is safe because the store is the single source subscribed to that user's full collection.
