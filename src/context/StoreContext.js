import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  writeBatch,
} from '@firebase/firestore';
import { db } from '../lib/firebase';
import { scheduleReminder, cancelReminder } from '../lib/notifications';
import { useAuth } from './AuthContext';

const StoreContext = createContext(null);

// Firestore layout: users/{uid}/{followups,rnd,accounts,transactions}/{id}.
// Each item's `createdAt` is stored as a client epoch (ms) so the existing UI
// (which formats/sorts on a number) keeps working unchanged.
function userCol(uid, name) {
  return collection(db, 'users', uid, name);
}

export function StoreProvider({ children }) {
  const { user } = useAuth();
  const [followups, setFollowups] = useState([]);
  const [rnd, setRnd] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [ready, setReady] = useState(false);

  // Subscribe to this user's data in real time; tear down on user change/logout.
  useEffect(() => {
    if (!user) {
      setFollowups([]);
      setRnd([]);
      setAccounts([]);
      setTransactions([]);
      setTasks([]);
      setReady(true);
      return;
    }
    setReady(false);

    // Mark the store ready once every collection has delivered its first snapshot.
    const loaded = {
      followups: false,
      rnd: false,
      accounts: false,
      transactions: false,
      tasks: false,
    };
    const markReady = (name) => {
      loaded[name] = true;
      if (Object.values(loaded).every(Boolean)) setReady(true);
    };

    // One subscription per collection, ordered newest-first.
    const subscribe = (name, setter) =>
      onSnapshot(
        query(userCol(user.id, name), orderBy('createdAt', 'desc')),
        (snap) => {
          setter(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
          markReady(name);
        },
        (err) => {
          console.warn(`${name} snapshot failed`, err);
          markReady(name);
        }
      );

    const unsubs = [
      subscribe('followups', setFollowups),
      subscribe('rnd', setRnd),
      subscribe('accounts', setAccounts),
      subscribe('transactions', setTransactions),
      subscribe('tasks', setTasks),
    ];

    return () => unsubs.forEach((u) => u());
  }, [user]);

  // ----- Follow-ups -----
  async function addFollowup({ title, note, contact, remindAt }) {
    let notificationId = null;
    if (remindAt) {
      notificationId = await scheduleReminder({
        title: `Follow-up: ${title}`,
        body: note || contact || 'Time to follow up.',
        date: remindAt,
      });
    }
    return addDoc(userCol(user.id, 'followups'), {
      title: title.trim(),
      note: (note || '').trim(),
      contact: (contact || '').trim(),
      remindAt: remindAt || null,
      notificationId,
      done: false,
      createdAt: Date.now(),
    });
  }

  async function toggleFollowupDone(id) {
    const target = followups.find((f) => f.id === id);
    if (!target) return;
    const done = !target.done;
    const ref = doc(db, 'users', user.id, 'followups', id);
    if (done && target.notificationId) {
      // Cancel the scheduled reminder once it's completed.
      await cancelReminder(target.notificationId);
      await updateDoc(ref, { done, notificationId: null });
    } else {
      await updateDoc(ref, { done });
    }
  }

  async function updateFollowup(id, { title, note, contact, remindAt }) {
    const target = followups.find((f) => f.id === id);
    const ref = doc(db, 'users', user.id, 'followups', id);
    const patch = {
      title: title.trim(),
      note: (note || '').trim(),
      contact: (contact || '').trim(),
      remindAt: remindAt || null,
    };
    const prevRemind = target?.remindAt || null;
    const nextRemind = remindAt || null;
    // Only touch the OS notification when the reminder time actually changed (or
    // a reminder exists but was never scheduled). Otherwise leave it untouched.
    if (prevRemind !== nextRemind || (nextRemind && !target?.notificationId)) {
      if (target?.notificationId) await cancelReminder(target.notificationId);
      patch.notificationId = nextRemind
        ? await scheduleReminder({
            title: `Follow-up: ${patch.title}`,
            body: patch.note || patch.contact || 'Time to follow up.',
            date: nextRemind,
          })
        : null;
    }
    await updateDoc(ref, patch);
  }

  async function deleteFollowup(id) {
    const target = followups.find((f) => f.id === id);
    if (target?.notificationId) await cancelReminder(target.notificationId);
    await deleteDoc(doc(db, 'users', user.id, 'followups', id));
  }

  // ----- R&D -----
  async function addRnd({ type, content, title, tags }) {
    return addDoc(userCol(user.id, 'rnd'), {
      type: type || 'note',
      title: (title || '').trim(),
      content: (content || '').trim(),
      tags: tags || [],
      createdAt: Date.now(),
    });
  }

  async function updateRnd(id, { type, content, title, tags }) {
    await updateDoc(doc(db, 'users', user.id, 'rnd', id), {
      type: type || 'note',
      title: (title || '').trim(),
      content: (content || '').trim(),
      tags: tags || [],
    });
  }

  async function deleteRnd(id) {
    await deleteDoc(doc(db, 'users', user.id, 'rnd', id));
  }

  // ----- Accounts (bank / cash / UPI / card) -----
  async function addAccount({ name, type, openingBalance }) {
    return addDoc(userCol(user.id, 'accounts'), {
      name: (name || '').trim(),
      type: type || 'bank',
      openingBalance: Number(openingBalance) || 0,
      createdAt: Date.now(),
    });
  }

  async function updateAccount(id, { name, type, openingBalance }) {
    await updateDoc(doc(db, 'users', user.id, 'accounts', id), {
      name: (name || '').trim(),
      type: type || 'bank',
      openingBalance: Number(openingBalance) || 0,
    });
  }

  async function deleteAccount(id) {
    // Cascade: reassign every transaction paid from / assigned to this account
    // to "Unassigned" (accountId=null) before removing the account, all in one
    // atomic batch. This preserves spend history and keeps totalOnHand correct
    // (a transaction's signed amount counts regardless of account) instead of
    // leaving dangling accountIds that point at a deleted account.
    const affected = transactions.filter((t) => t.accountId === id);
    const batch = writeBatch(db);
    affected.forEach((t) => {
      batch.update(doc(db, 'users', user.id, 'transactions', t.id), { accountId: null });
    });
    batch.delete(doc(db, 'users', user.id, 'accounts', id));
    await batch.commit();
  }

  // ----- Transactions (income / expense) -----
  async function addTransaction({ type, amount, category, accountId, note, occurredAt }) {
    return addDoc(userCol(user.id, 'transactions'), {
      type: type === 'income' ? 'income' : 'expense',
      amount: Number(amount) || 0,
      category: category || 'other',
      accountId: accountId || null,
      note: (note || '').trim(),
      occurredAt: occurredAt || Date.now(),
      createdAt: Date.now(),
    });
  }

  async function updateTransaction(id, { type, amount, category, accountId, note, occurredAt }) {
    await updateDoc(doc(db, 'users', user.id, 'transactions', id), {
      type: type === 'income' ? 'income' : 'expense',
      amount: Number(amount) || 0,
      category: category || 'other',
      accountId: accountId || null,
      note: (note || '').trim(),
      occurredAt: occurredAt || Date.now(),
    });
  }

  async function deleteTransaction(id) {
    await deleteDoc(doc(db, 'users', user.id, 'transactions', id));
  }

  // ----- Tasks / To-Do -----
  async function addTask({ title, note, priority }) {
    return addDoc(userCol(user.id, 'tasks'), {
      title: (title || '').trim(),
      note: (note || '').trim(),
      priority: priority || 'medium',
      done: false,
      createdAt: Date.now(),
    });
  }

  async function updateTask(id, { title, note, priority }) {
    // Editing details never changes completion — `done` is toggled separately.
    await updateDoc(doc(db, 'users', user.id, 'tasks', id), {
      title: (title || '').trim(),
      note: (note || '').trim(),
      priority: priority || 'medium',
    });
  }

  async function toggleTaskDone(id) {
    const target = tasks.find((t) => t.id === id);
    if (!target) return;
    await updateDoc(doc(db, 'users', user.id, 'tasks', id), { done: !target.done });
  }

  async function deleteTask(id) {
    await deleteDoc(doc(db, 'users', user.id, 'tasks', id));
  }

  return (
    <StoreContext.Provider
      value={{
        ready,
        followups,
        rnd,
        accounts,
        transactions,
        tasks,
        addFollowup,
        toggleFollowupDone,
        updateFollowup,
        deleteFollowup,
        addRnd,
        updateRnd,
        deleteRnd,
        addAccount,
        updateAccount,
        deleteAccount,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addTask,
        updateTask,
        toggleTaskDone,
        deleteTask,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
