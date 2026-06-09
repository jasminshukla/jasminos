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
} from '@firebase/firestore';
import { db } from '../lib/firebase';
import { scheduleReminder, cancelReminder } from '../lib/notifications';
import { useAuth } from './AuthContext';

const StoreContext = createContext(null);

// Firestore layout: users/{uid}/followups/{id} and users/{uid}/rnd/{id}.
// Each item's `createdAt` is stored as a client epoch (ms) so the existing UI
// (which formats/sorts on a number) keeps working unchanged.
function userCol(uid, name) {
  return collection(db, 'users', uid, name);
}

export function StoreProvider({ children }) {
  const { user } = useAuth();
  const [followups, setFollowups] = useState([]);
  const [rnd, setRnd] = useState([]);
  const [ready, setReady] = useState(false);

  // Subscribe to this user's data in real time; tear down on user change/logout.
  useEffect(() => {
    if (!user) {
      setFollowups([]);
      setRnd([]);
      setReady(true);
      return;
    }
    setReady(false);

    let followupsLoaded = false;
    let rndLoaded = false;
    const markReady = () => {
      if (followupsLoaded && rndLoaded) setReady(true);
    };

    const fq = query(userCol(user.id, 'followups'), orderBy('createdAt', 'desc'));
    const rq = query(userCol(user.id, 'rnd'), orderBy('createdAt', 'desc'));

    const unsubF = onSnapshot(
      fq,
      (snap) => {
        setFollowups(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        followupsLoaded = true;
        markReady();
      },
      (err) => {
        console.warn('followups snapshot failed', err);
        followupsLoaded = true;
        markReady();
      }
    );

    const unsubR = onSnapshot(
      rq,
      (snap) => {
        setRnd(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        rndLoaded = true;
        markReady();
      },
      (err) => {
        console.warn('rnd snapshot failed', err);
        rndLoaded = true;
        markReady();
      }
    );

    return () => {
      unsubF();
      unsubR();
    };
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

  return (
    <StoreContext.Provider
      value={{
        ready,
        followups,
        rnd,
        addFollowup,
        toggleFollowupDone,
        updateFollowup,
        deleteFollowup,
        addRnd,
        updateRnd,
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
