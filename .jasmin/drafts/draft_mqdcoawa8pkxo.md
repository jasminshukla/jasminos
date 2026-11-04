# Draft: Explicit per-collection Firestore rules with wallet shape validation

> Task: `task_mqdbxtqwesedb`

Replace the single permissive wildcard match (/users/{userId}/{collection}/{docId}) with explicit per-collection matches under /users/{userId}, because Firestore rules are OR-ed: a permissive wildcard would override any stricter validated rule on the same path, so validation can only be enforced if the wildcard no longer covers accounts/transactions.

Structure:
- isOwner() helper: request.auth != null && request.auth.uid == userId
- followups, rnd: allow read, write if isOwner() (unchanged behavior)
- accounts: allow read, delete if isOwner(); allow create, update if isOwner() && name is string && openingBalance is number
- transactions: allow read, delete if isOwner(); allow create, update if isOwner() && amount is number && type in ['income','expense']

Split read/delete from create/update so deletes (request.resource is null) and the batch reassignment from Task 1 aren't blocked by shape checks. On update, request.resource.data is the merged full doc, so partial batch.update({accountId:null}) still satisfies amount/type checks.

## Implementation Notes

Verified via grep that only StoreContext writes Firestore docs; no users/{uid} profile doc exists (auth identity comes from Firebase Auth), so removing the wildcard regresses nothing. `tasks` is intentionally left out here — its rules land in the dedicated tasks-rules task before any tasks UI ships; unlisted collections now default-deny, which is the safer posture. Deploy is a separate task (firebase deploy --only firestore:rules).
