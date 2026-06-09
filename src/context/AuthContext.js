import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import {
  GoogleAuthProvider,
  signInWithCredential,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  signOut,
} from '@firebase/auth';
import { auth } from '../lib/firebase';
import {
  googleClientIds,
  isFirebaseConfigured,
  isGoogleConfigured,
} from '../config/firebaseConfig';

// Finishes the web auth session if the app was reopened mid sign-in.
WebBrowser.maybeCompleteAuthSession();

const AuthContext = createContext(null);

// Turn Firebase auth error codes into friendly messages.
function prettyAuthError(e) {
  const code = e?.code || '';
  switch (code) {
    case 'auth/invalid-email':
      return 'That email address looks invalid.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try signing in instead.';
    case 'auth/weak-password':
      return 'Password is too weak — use at least 6 characters.';
    case 'auth/missing-password':
      return 'Please enter a password.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a bit and try again.';
    case 'auth/operation-not-allowed':
      return 'Email/password sign-in is not enabled in Firebase. Enable it in Authentication → Sign-in method.';
    default:
      return e?.message || 'Something went wrong. Please try again.';
  }
}

// Map a Firebase user to the shape the rest of the app expects ({ id, name, email }).
function mapUser(u) {
  if (!u) return null;
  return {
    id: u.uid,
    name: u.displayName || (u.isAnonymous ? 'Guest' : u.email ? u.email.split('@')[0] : 'You'),
    email: u.email || (u.isAnonymous ? 'Signed in as guest' : ''),
    photo: u.photoURL || null,
    isGuest: !!u.isAnonymous,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);

  // Google OAuth request — returns an id_token we exchange for a Firebase credential.
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: googleClientIds.web,
    iosClientId: googleClientIds.ios,
    androidClientId: googleClientIds.android,
  });

  // Keep React state in sync with Firebase's auth state (also restores the
  // persisted session on launch via AsyncStorage).
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(mapUser(u));
      setLoading(false);
    });
    return unsub;
  }, []);

  // When Google returns an id_token, sign in to Firebase with it.
  useEffect(() => {
    if (!response) return;
    if (response.type === 'success') {
      const idToken = response.params?.id_token || response.authentication?.idToken;
      if (!idToken) {
        setSigningIn(false);
        Alert.alert('Sign-in failed', 'Google did not return an ID token.');
        return;
      }
      const credential = GoogleAuthProvider.credential(idToken);
      signInWithCredential(auth, credential)
        .catch((e) => Alert.alert('Sign-in failed', e.message))
        .finally(() => setSigningIn(false));
    } else if (response.type === 'error') {
      setSigningIn(false);
      Alert.alert('Sign-in failed', response.error?.message || 'Google sign-in was cancelled.');
    } else {
      // dismiss / cancel
      setSigningIn(false);
    }
  }, [response]);

  async function signInWithGoogle() {
    if (!isFirebaseConfigured || !isGoogleConfigured) {
      Alert.alert(
        'Setup required',
        'Add your Firebase config and Google OAuth client IDs in src/config/firebaseConfig.js. See FIREBASE_SETUP.md.'
      );
      return;
    }
    if (!request) return; // request not ready yet
    setSigningIn(true);
    try {
      await promptAsync();
    } catch (e) {
      setSigningIn(false);
      Alert.alert('Sign-in failed', e.message);
    }
  }

  async function signInWithEmail(email, password) {
    if (!isFirebaseConfigured) {
      Alert.alert('Setup required', 'Add your Firebase config in src/config/firebaseConfig.js.');
      return false;
    }
    setSigningIn(true);
    try {
      await signInWithEmailAndPassword(auth, (email || '').trim(), password);
      return true;
    } catch (e) {
      Alert.alert('Sign-in failed', prettyAuthError(e));
      return false;
    } finally {
      setSigningIn(false);
    }
  }

  async function signUpWithEmail(name, email, password) {
    if (!isFirebaseConfigured) {
      Alert.alert('Setup required', 'Add your Firebase config in src/config/firebaseConfig.js.');
      return false;
    }
    setSigningIn(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, (email || '').trim(), password);
      if (name?.trim()) {
        await updateProfile(cred.user, { displayName: name.trim() });
        // updateProfile doesn't re-fire onAuthStateChanged, so refresh manually.
        setUser(mapUser(auth.currentUser));
      }
      return true;
    } catch (e) {
      Alert.alert('Sign-up failed', prettyAuthError(e));
      return false;
    } finally {
      setSigningIn(false);
    }
  }

  async function signInAsGuest() {
    if (!isFirebaseConfigured) {
      Alert.alert(
        'Setup required',
        'Add your Firebase config in src/config/firebaseConfig.js. See FIREBASE_SETUP.md.'
      );
      return;
    }
    setSigningIn(true);
    try {
      // Requires the "Anonymous" provider to be enabled in Firebase Auth.
      await signInAnonymously(auth);
    } catch (e) {
      Alert.alert('Guest sign-in failed', e.message);
    } finally {
      setSigningIn(false);
    }
  }

  async function logout() {
    await signOut(auth);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signingIn,
        // The Google request must be initialized before the button can prompt.
        canSignIn: !!request,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signInAsGuest,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
