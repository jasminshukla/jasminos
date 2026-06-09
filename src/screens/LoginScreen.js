import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { colors, radius, spacing } from '../theme';

export default function LoginScreen() {
  const {
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signInAsGuest,
    signingIn,
    canSignIn,
  } = useAuth();

  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isSignup = mode === 'signup';

  async function onEmailSubmit() {
    if (!email.trim() || !password) {
      Alert.alert('Missing details', 'Enter your email and password.');
      return;
    }
    if (isSignup) {
      await signUpWithEmail(name, email, password);
    } else {
      await signInWithEmail(email, password);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logoImg}
              resizeMode="contain"
            />
            <Text style={styles.title}>{isSignup ? 'Create account' : 'Welcome'}</Text>
            <Text style={styles.subtitle}>
              Sign in to sync your follow-ups & R&D across devices
            </Text>
          </View>

          {isSignup ? (
            <Input
              label="Name"
              value={name}
              onChangeText={setName}
              placeholder="Jane Doe"
              autoCapitalize="words"
            />
          ) : null}
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder={isSignup ? 'At least 6 characters' : '••••••••'}
            secureTextEntry
          />

          <Button
            title={isSignup ? 'Create account' : 'Sign in'}
            onPress={onEmailSubmit}
            loading={signingIn}
          />

          <Pressable
            onPress={() => setMode(isSignup ? 'signin' : 'signup')}
            style={styles.toggleRow}
          >
            <Text style={styles.toggleText}>
              {isSignup ? 'Already have an account? ' : "Don't have an account? "}
              <Text style={styles.toggleLink}>{isSignup ? 'Sign in' : 'Create one'}</Text>
            </Text>
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={styles.line} />
            <Text style={styles.or}>or</Text>
            <View style={styles.line} />
          </View>

          <Pressable
            onPress={signInWithGoogle}
            disabled={signingIn || !canSignIn}
            style={({ pressed }) => [
              styles.googleBtn,
              (pressed || signingIn || !canSignIn) && styles.btnPressed,
            ]}
          >
            <Text style={styles.googleG}>G</Text>
            <Text style={styles.googleText}>Continue with Google</Text>
          </Pressable>

          <Pressable
            onPress={signInAsGuest}
            disabled={signingIn}
            style={({ pressed }) => [styles.guestBtn, pressed && styles.btnPressed]}
          >
            <Text style={styles.guestText}>Continue as guest</Text>
          </Pressable>

          {signingIn ? <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.lg }} /> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  logoImg: { width: 110, height: 110, marginBottom: spacing.md },
  title: { color: colors.text, fontSize: 28, fontWeight: '800' },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: spacing.sm,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  toggleRow: { alignItems: 'center', marginTop: spacing.lg },
  toggleText: { color: colors.textMuted, fontSize: 14 },
  toggleLink: { color: colors.primary, fontWeight: '700' },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginVertical: spacing.xl,
  },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  or: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingVertical: spacing.lg,
    minHeight: 56,
  },
  btnPressed: { opacity: 0.7 },
  googleG: { color: '#4285F4', fontSize: 20, fontWeight: '900' },
  googleText: { color: colors.text, fontSize: 16, fontWeight: '700' },
  guestBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    paddingVertical: spacing.lg,
    minHeight: 52,
    marginTop: spacing.sm,
  },
  guestText: { color: colors.textMuted, fontSize: 15, fontWeight: '700' },
});
