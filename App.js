import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ShareIntentProvider } from 'expo-share-intent';
import { AuthProvider } from './src/context/AuthContext';
import { StoreProvider } from './src/context/StoreContext';
import RootNavigator from './src/navigation/RootNavigator';
import ShareIntentRouter from './src/navigation/ShareIntentRouter';
import { registerForNotifications } from './src/lib/notifications';

export default function App() {
  // Ask for notification permission once on launch.
  useEffect(() => {
    registerForNotifications();
  }, []);

  return (
    <ShareIntentProvider>
      <SafeAreaProvider>
        <AuthProvider>
          <StoreProvider>
            <StatusBar style="light" />
            <RootNavigator />
            {/* Routes reels/links shared into the app to the R&D screen. */}
            <ShareIntentRouter />
          </StoreProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </ShareIntentProvider>
  );
}
