import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import {
  GoogleAuthProvider,
  signInWithCredential,
  signInAnonymously,
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
