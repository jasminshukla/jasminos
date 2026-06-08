import React, { createContext, useContext, useEffect, useState } from 'react';
import { getItem, setItem, KEYS } from '../lib/storage';
import { uid } from '../lib/id';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // logged-in user { id, name, email }
  const [loading, setLoading] = useState(true);

  // Restore session on launch.
  useEffect(() => {
    (async () => {
      const session = await getItem(KEYS.SESSION, null);
      if (session) setUser(session);
      setLoading(false);
    })();
  }, []);

  async function register({ name, email, password }) {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!name?.trim()) throw new Error('Please enter your name.');
    if (!cleanEmail) throw new Error('Please enter your email.');
    if (!password || password.length < 4)
      throw new Error('Password must be at least 4 characters.');

    const users = await getItem(KEYS.USERS, []);
    if (users.some((u) => u.email === cleanEmail)) {
      throw new Error('An account with this email already exists.');
    }
    const newUser = {
      id: uid('user'),
      name: name.trim(),
      email: cleanEmail,
      password, // NOTE: plain text for this demo. Hash on a real backend.
      createdAt: Date.now(),
    };
    await setItem(KEYS.USERS, [...users, newUser]);

    const session = { id: newUser.id, name: newUser.name, email: newUser.email };
    await setItem(KEYS.SESSION, session);
    setUser(session);
    return session;
  }

  async function login({ email, password }) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const users = await getItem(KEYS.USERS, []);
    const found = users.find((u) => u.email === cleanEmail);
    if (!found || found.password !== password) {
      throw new Error('Invalid email or password.');
    }
    const session = { id: found.id, name: found.name, email: found.email };
    await setItem(KEYS.SESSION, session);
    setUser(session);
    return session;
  }

  async function logout() {
    await setItem(KEYS.SESSION, null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
