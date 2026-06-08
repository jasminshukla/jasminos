import React from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { colors, radius, spacing } from '../theme';

export default function LoginScreen() {
  const { signInWithGoogle, signInAsGuest, signingIn, canSignIn } = useAuth();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>🚀</Text>
          <Text style={styles.title}>Welcome</Text>
          <Text style={styles.subtitle}>
            Sign in to sync your follow-ups & R&D across devices
          </Text>
        </View>

        <Pressable
          onPress={signInWithGoogle}
          disabled={signingIn || !canSignIn}
          style={({ pressed }) => [
            styles.googleBtn,
            (pressed || signingIn || !canSignIn) && styles.googleBtnPressed,
          ]}
        >
          {signingIn ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <>
              <Text style={styles.googleG}>G</Text>
              <Text style={styles.googleText}>Continue with Google</Text>
            </>
          )}
        </Pressable>

        <View style={styles.dividerRow}>
          <View style={styles.line} />
          <Text style={styles.or}>or</Text>
          <View style={styles.line} />
        </View>

        <Pressable
          onPress={signInAsGuest}
          disabled={signingIn}
          style={({ pressed }) => [styles.guestBtn, pressed && styles.googleBtnPressed]}
        >
          <Text style={styles.guestText}>Continue as guest</Text>
        </Pressable>

        {!canSignIn ? (
          <Text style={styles.hint}>Preparing sign-in…</Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, justifyContent: 'center', padding: spacing.xl },
  header: { alignItems: 'center', marginBottom: spacing.xxl },
  logo: { fontSize: 56, marginBottom: spacing.md },
  title: { color: colors.text, fontSize: 28, fontWeight: '800' },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: spacing.sm,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
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
  googleBtnPressed: { opacity: 0.7 },
  googleG: {
    color: '#4285F4',
    fontSize: 20,
    fontWeight: '900',
  },
  googleText: { color: colors.text, fontSize: 16, fontWeight: '700' },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginVertical: spacing.lg,
  },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  or: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  guestBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    paddingVertical: spacing.lg,
    minHeight: 52,
  },
  guestText: { color: colors.textMuted, fontSize: 15, fontWeight: '700' },
  hint: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
