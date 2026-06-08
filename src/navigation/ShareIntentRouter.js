import { useEffect } from 'react';
import { useShareIntentContext } from 'expo-share-intent';
import { useAuth } from '../context/AuthContext';
import { navigateWhenReady } from './navigationRef';

// Listens for content shared INTO the app (e.g. an Instagram reel link shared from
// Instagram) and routes it to the "Save to R&D" screen with the URL pre-filled.
//
// Renders nothing. Must live inside both ShareIntentProvider and AuthProvider.
export default function ShareIntentRouter() {
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntentContext();
  const { user } = useAuth();

  useEffect(() => {
    if (!hasShareIntent) return;
    // Hold the intent until the user is signed in — the R&D tab only exists then.
    // Once `user` flips truthy this effect re-runs and routes the pending link.
    if (!user) return;

    const sharedText = shareIntent?.webUrl || shareIntent?.text || '';
    if (!sharedText) {
      resetShareIntent();
      return;
    }

    navigateWhenReady('App', {
      screen: 'R&D',
      params: { screen: 'AddRnD', params: { sharedText } },
    });
    resetShareIntent();
  }, [hasShareIntent, shareIntent, user, resetShareIntent]);

  return null;
}
