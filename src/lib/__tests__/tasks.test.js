import { partitionTasks } from '../tasks';

describe('partitionTasks', () => {
  it('returns empty open/done for empty or undefined input', () => {
    expect(partitionTasks([])).toEqual({ open: [], done: [] });
    expect(partitionTasks(undefined)).toEqual({ open: [], done: [] });
  });

  it('puts every task in open when none are done', () => {
    const tasks = [
      { id: 'a', done: false, createdAt: 1 },
      { id: 'b', done: false, createdAt: 2 },
    ];
    const { open, done } = partitionTasks(tasks);
    expect(open.map((t) => t.id)).toEqual(['b', 'a']); // newest first
    expect(done).toEqual([]);
  });

  it('puts every task in done when all are done', () => {
    const tasks = [
      { id: 'a', done: true, createdAt: 1 },
      { id: 'b', done: true, createdAt: 2 },
    ];
    const { open, done } = partitionTasks(tasks);
    expect(open).toEqual([]);
    expect(done.map((t) => t.id)).toEqual(['b', 'a']);
  });

  it('splits mixed tasks and orders each group newest-first', () => {
    const tasks = [
      { id: 'old-open', done: false, createdAt: 10 },
      { id: 'new-done', done: true, createdAt: 40 },
      { id: 'new-open', done: false, createdAt: 30 },
      { id: 'old-done', done: true, createdAt: 20 },
    ];
    const { open, done } = partitionTasks(tasks);
    expect(open.map((t) => t.id)).toEqual(['new-open', 'old-open']);
    expect(done.map((t) => t.id)).toEqual(['new-done', 'old-done']);
  });

  it('keeps insertion order for tasks with equal createdAt (stable sort)', () => {
    const tasks = [
      { id: 'first', done: false, createdAt: 5 },
      { id: 'second', done: false, createdAt: 5 },
      { id: 'third', done: false, createdAt: 5 },
    ];
    const { open } = partitionTasks(tasks);
    expect(open.map((t) => t.id)).toEqual(['first', 'second', 'third']);
  });

  it('treats a missing done flag as open', () => {
    const { open, done } = partitionTasks([{ id: 'a', createdAt: 1 }]);
    expect(open.map((t) => t.id)).toEqual(['a']);
    expect(done).toEqual([]);
  });
});
