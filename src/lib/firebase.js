// Firebase singletons (app, auth, firestore).
//
// IMPORTANT: every Firebase symbol is imported from the SCOPED packages
// (@firebase/app, @firebase/auth, @firebase/firestore) rather than the umbrella
// "firebase/*" entry points. In firebase v12 only the scoped packages expose the
// React Native build (and getReactNativePersistence). Mixing scoped + umbrella
// imports loads two copies of @firebase/auth and triggers the classic
// "Component auth has not been registered yet" crash. Keep all auth/firestore
// imports scoped across the app.
import { initializeApp, getApps, getApp } from '@firebase/app';
import { initializeAuth, getReactNativePersistence } from '@firebase/auth';
import { getFirestore } from '@firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseConfig } from '../config/firebaseConfig';

// Reuse the existing app across Fast Refresh instead of re-initializing.
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Persist the signed-in session to AsyncStorage so the user stays logged in
// across app restarts. initializeAuth must only run once per app instance.
let _auth;
try {
  _auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  // Already initialized (e.g. after Fast Refresh) — reuse it.
  const { getAuth } = require('@firebase/auth');
  _auth = getAuth(app);
}

export const auth = _auth;
export const db = getFirestore(app);
export default app;
