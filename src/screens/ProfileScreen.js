import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { colors, radius, spacing } from '../theme';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { followups, rnd } = useStore();

  const openFollowups = followups.filter((f) => !f.done).length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.content}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(user?.name || '?').slice(0, 1).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{openFollowups}</Text>
            <Text style={styles.statLabel}>Open follow-ups</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.stat}>
            <Text style={styles.statNum}>{rnd.length}</Text>
            <Text style={styles.statLabel}>R&D saved</Text>
          </View>
        </View>

        <Button title="Log out" variant="danger" onPress={logout} style={{ marginTop: spacing.xxl }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, alignItems: 'center', padding: spacing.xl, paddingTop: spacing.xxl },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  avatarText: { color: colors.onPrimary, fontSize: 36, fontWeight: '800' },
  name: { color: colors.text, fontSize: 22, fontWeight: '800' },
  email: { color: colors.textMuted, fontSize: 14, marginTop: spacing.xs },
  stats: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    marginTop: spacing.xxl,
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  stat: { alignItems: 'center', flex: 1 },
  statNum: { color: colors.primary, fontSize: 28, fontWeight: '800' },
  statLabel: { color: colors.textMuted, fontSize: 13, marginTop: spacing.xs },
  divider: { width: 1, height: 40, backgroundColor: colors.border },
});
