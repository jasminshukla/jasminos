import React, { createContext, useContext, useEffect, useState } from 'react';
import { getItem, setItem, KEYS } from '../lib/storage';
import { uid } from '../lib/id';
import { scheduleReminder, cancelReminder } from '../lib/notifications';
import { useAuth } from './AuthContext';

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const { user } = useAuth();
  const [followups, setFollowups] = useState([]);
  const [rnd, setRnd] = useState([]);
  const [ready, setReady] = useState(false);

  // Load this user's data whenever the logged-in user changes.
  useEffect(() => {
    (async () => {
      setReady(false);
      if (!user) {
        setFollowups([]);
        setRnd([]);
        setReady(true);
        return;
      }
      const allF = await getItem(KEYS.FOLLOWUPS, []);
      const allR = await getItem(KEYS.RND, []);
      setFollowups(allF.filter((f) => f.userId === user.id));
      setRnd(allR.filter((r) => r.userId === user.id));
      setReady(true);
    })();
  }, [user]);

  // Persist helpers merge the current user's items back into the global list
  // (so multiple accounts on one device stay isolated).
  async function persistFollowups(next) {
    setFollowups(next);
    const all = await getItem(KEYS.FOLLOWUPS, []);
    const others = all.filter((f) => f.userId !== user.id);
    await setItem(KEYS.FOLLOWUPS, [...others, ...next]);
  }

  async function persistRnd(next) {
    setRnd(next);
    const all = await getItem(KEYS.RND, []);
    const others = all.filter((r) => r.userId !== user.id);
    await setItem(KEYS.RND, [...others, ...next]);
  }

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
    const item = {
      id: uid('fu'),
      userId: user.id,
      title: title.trim(),
      note: (note || '').trim(),
      contact: (contact || '').trim(),
      remindAt: remindAt || null,
      notificationId,
      done: false,
      createdAt: Date.now(),
    };
    await persistFollowups([item, ...followups]);
    return item;
  }

  async function toggleFollowupDone(id) {
    const next = await Promise.all(
      followups.map(async (f) => {
        if (f.id !== id) return f;
        const done = !f.done;
        // Cancel the reminder once it's completed.
        if (done && f.notificationId) {
          await cancelReminder(f.notificationId);
          return { ...f, done, notificationId: null };
        }
        return { ...f, done };
      })
    );
    await persistFollowups(next);
  }

  async function deleteFollowup(id) {
    const target = followups.find((f) => f.id === id);
    if (target?.notificationId) await cancelReminder(target.notificationId);
    await persistFollowups(followups.filter((f) => f.id !== id));
  }

  // ----- R&D -----
  async function addRnd({ type, content, title, tags }) {
    const item = {
      id: uid('rnd'),
      userId: user.id,
      type: type || 'note',
      title: (title || '').trim(),
      content: (content || '').trim(),
      tags: tags || [],
      createdAt: Date.now(),
    };
    await persistRnd([item, ...rnd]);
    return item;
  }

  async function deleteRnd(id) {
    await persistRnd(rnd.filter((r) => r.id !== id));
  }

  return (
    <StoreContext.Provider
      value={{
        ready,
        followups,
        rnd,
        addFollowup,
        toggleFollowupDone,
        deleteFollowup,
        addRnd,
        deleteRnd,
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
