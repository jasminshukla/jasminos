import AsyncStorage from '@react-native-async-storage/async-storage';

// Small typed wrapper around AsyncStorage so the rest of the app
// never deals with JSON parsing / keys directly.
export const KEYS = {
  USERS: '@app/users',
  SESSION: '@app/session',
  FOLLOWUPS: '@app/followups',
  RND: '@app/rnd',
};

export async function getItem(key, fallback = null) {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.warn('storage.getItem failed', key, e);
    return fallback;
  }
}

export async function setItem(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('storage.setItem failed', key, e);
  }
}

export async function removeItem(key) {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.warn('storage.removeItem failed', key, e);
  }
}
