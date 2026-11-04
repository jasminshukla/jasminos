// Pure task-list helpers, kept free of React/Firestore for unit testing.

// Split tasks into open (not done) and done, each ordered newest-first by
// createdAt. The store already returns tasks createdAt-desc, but re-sorting
// here keeps the helper self-contained and deterministic for tests.
export function partitionTasks(tasks) {
  const sorted = [...(tasks || [])].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  return {
    open: sorted.filter((t) => !t.done),
    done: sorted.filter((t) => t.done),
  };
}
