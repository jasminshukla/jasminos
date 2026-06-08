import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import Input from '../components/Input';
import Button from '../components/Button';
import { useStore } from '../context/StoreContext';
import { colors, radius, spacing, RND_TYPES } from '../theme';

// Guess the type from a pasted/shared URL so the user doesn't have to.
function detectType(text) {
  const t = (text || '').toLowerCase();
  if (t.includes('instagram.com')) return 'instagram';
  if (t.includes('linkedin.com')) return 'linkedin';
  if (t.startsWith('http://') || t.startsWith('https://')) return 'link';
  return 'note';
}

export default function AddRnDScreen({ navigation, route }) {
  const { addRnd } = useStore();
  // A shared payload (from another app or deep link) can be passed in via params.
  const shared = route?.params?.sharedText;
  const [content, setContent] = useState(shared || '');
  const [title, setTitle] = useState('');
  const [type, setType] = useState(detectType(shared));
  const [tagText, setTagText] = useState('');
  const [saving, setSaving] = useState(false);

  // Re-detect type as the content changes (unless the user picked manually).
  const [typeTouched, setTypeTouched] = useState(false);
  useEffect(() => {
    if (!typeTouched) setType(detectType(content));
  }, [content, typeTouched]);

  async function pasteFromClipboard() {
    const text = await Clipboard.getStringAsync();
    if (!text) {
      Alert.alert('Clipboard empty', 'Copy a link or text first, then tap paste.');
      return;
    }
    setContent(text);
  }

  async function onSave() {
    if (!content.trim()) {
      Alert.alert('Nothing to save', 'Paste a link or write something first.');
      return;
    }
    setSaving(true);
    try {
      const tags = tagText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      await addRnd({ type, content, title, tags });
      navigation.goBack();
    } catch (e) {
      Alert.alert('Could not save', e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionLabel}>Type</Text>
        <View style={styles.typeRow}>
          {Object.entries(RND_TYPES).map(([key, meta]) => {
            const active = type === key;
            return (
              <Pressable
                key={key}
                onPress={() => {
                  setType(key);
                  setTypeTouched(true);
                }}
                style={[
                  styles.typeChip,
                  active && { backgroundColor: meta.color, borderColor: meta.color },
                ]}
              >
                <Text style={[styles.typeText, active && { color: '#fff' }]}>
                  {meta.icon} {meta.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.pasteRow}>
          <Text style={styles.sectionLabel}>Link or text</Text>
          <Pressable onPress={pasteFromClipboard} style={styles.pasteBtn}>
            <Text style={styles.pasteText}>📋 Paste</Text>
          </Pressable>
        </View>
        <Input
          value={content}
          onChangeText={setContent}
          placeholder="Paste an Instagram reel / LinkedIn post link, or jot a free-text idea…"
          multiline
          autoCapitalize="none"
        />

        <Input
          label="Title / why is this interesting? (optional)"
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Great hook idea for reels"
        />
        <Input
          label="Tags (comma separated, optional)"
          value={tagText}
          onChangeText={setTagText}
          placeholder="e.g. marketing, hook, competitor"
          autoCapitalize="none"
        />

        <Button title="Save to R&D" onPress={onSave} loading={saving} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.xl },
  sectionLabel: { color: colors.textMuted, fontSize: 13, fontWeight: '600', marginBottom: spacing.md },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  typeChip: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  typeText: { color: colors.text, fontSize: 14, fontWeight: '600' },
  pasteRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pasteBtn: {
    backgroundColor: colors.cardAlt,
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  pasteText: { color: colors.primary, fontWeight: '700', fontSize: 13 },
});
