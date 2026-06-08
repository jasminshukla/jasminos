import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { StoreProvider } from './src/context/StoreContext';
import RootNavigator from './src/navigation/RootNavigator';
import { registerForNotifications } from './src/lib/notifications';

export default function App() {
  // Ask for notification permission once on launch.
  useEffect(() => {
    registerForNotifications();
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StoreProvider>
          <StatusBar style="light" />
          <RootNavigator />
        </StoreProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
