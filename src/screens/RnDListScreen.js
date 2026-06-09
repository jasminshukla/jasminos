import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
  Linking,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ExternalLink, Share2, Pencil, Trash2, Plus, FlaskConical } from 'lucide-react-native';
import { useStore } from '../context/StoreContext';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import { colors, radius, spacing, RND_TYPES } from '../theme';
import { formatDateTime } from '../lib/datetime';

const FILTERS = ['all', 'instagram', 'linkedin', 'link', 'note'];
const isUrl = (s) => /^https?:\/\//i.test((s || '').trim());

function RnDCard({ item, onEdit, onDelete }) {
  const meta = RND_TYPES[item.type] || RND_TYPES.note;
  const linky = isUrl(item.content);

  async function open() {
    if (!linky) return;
    const ok = await Linking.canOpenURL(item.content);
    if (ok) Linking.openURL(item.content);
    else Alert.alert('Cannot open', 'This link could not be opened.');
  }

  async function share() {
    try {
      await Share.share({
        message: item.title ? `${item.title}\n${item.content}` : item.content,
      });
    } catch (e) {
      // user cancelled — ignore
    }
  }

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={[styles.tag, { backgroundColor: meta.color }]}>
          <meta.Icon color="#fff" size={12} />
          <Text style={styles.tagText}>{meta.label}</Text>
        </View>
        <Text style={styles.date}>{formatDateTime(item.createdAt)}</Text>
      </View>

      {item.title ? <Text style={styles.title}>{item.title}</Text> : null}

      <Pressable onPress={open} disabled={!linky}>
        <Text style={[styles.content, linky && styles.contentLink]} numberOfLines={4}>
          {item.content}
        </Text>
      </Pressable>

      {item.tags?.length ? (
        <View style={styles.tagsRow}>
          {item.tags.map((t) => (
            <Text key={t} style={styles.chip}>
              #{t}
            </Text>
          ))}
        </View>
      ) : null}

      <View style={styles.actions}>
        {linky ? (
          <Pressable onPress={open} style={styles.actionBtn}>
            <ExternalLink color={colors.text} size={15} />
            <Text style={styles.actionText}>Open</Text>
          </Pressable>
        ) : null}
        <Pressable onPress={share} style={styles.actionBtn}>
          <Share2 color={colors.text} size={15} />
          <Text style={styles.actionText}>Share</Text>
        </Pressable>
        <Pressable onPress={() => onEdit(item)} style={styles.actionBtn}>
          <Pencil color={colors.text} size={15} />
          <Text style={styles.actionText}>Edit</Text>
        </Pressable>
        <Pressable onPress={() => onDelete(item)} style={styles.actionBtn}>
          <Trash2 color={colors.danger} size={15} />
          <Text style={[styles.actionText, { color: colors.danger }]}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function RnDListScreen({ navigation }) {
  const { rnd, deleteRnd } = useStore();
  const [filter, setFilter] = useState('all');
  const [toDelete, setToDelete] = useState(null);

  const data = useMemo(() => {
    if (filter === 'all') return rnd;
    return rnd.filter((r) => r.type === filter);
  }, [rnd, filter]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>R&D Vault</Text>
          <Text style={styles.sub}>Save reels, posts & ideas to research later</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{rnd.length}</Text>
        </View>
      </View>

      <View style={styles.filters}>
        {FILTERS.map((f) => {
          const active = filter === f;
          const label = f === 'all' ? 'All' : RND_TYPES[f].label;
          return (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              style={[styles.filterChip, active && styles.filterActive]}
            >
              <Text style={[styles.filterText, active && styles.filterTextActive]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={data}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <RnDCard
            item={item}
            onEdit={(it) => navigation.navigate('AddRnD', { editItem: it })}
            onDelete={setToDelete}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            Icon={FlaskConical}
            title="Your R&D vault is empty"
            subtitle="Tap + to paste an Instagram reel or LinkedIn post link, or save a free-text idea to revisit later."
          />
        }
      />

      <Pressable style={styles.fab} onPress={() => navigation.navigate('AddRnD')}>
        <Plus color={colors.onPrimary} size={30} strokeWidth={2.5} />
      </Pressable>

      <ConfirmDialog
        visible={!!toDelete}
        title="Delete this R&D item?"
        message={toDelete?.title || toDelete?.content}
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          deleteRnd(toDelete.id);
          setToDelete(null);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  heading: { color: colors.text, fontSize: 26, fontWeight: '800' },
  sub: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  badge: {
    backgroundColor: colors.cardAlt,
    borderRadius: radius.pill,
    minWidth: 36,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  badgeText: { color: colors.primary, fontWeight: '800', fontSize: 14 },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  filterChip: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
  },
  filterActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  filterTextActive: { color: colors.onPrimary },
  list: { paddingHorizontal: spacing.xl, paddingBottom: 120 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: radius.pill,
    paddingVertical: 4,
    paddingHorizontal: spacing.md,
  },
  tagText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  date: { color: colors.textMuted, fontSize: 12 },
  title: { color: colors.text, fontSize: 16, fontWeight: '700', marginTop: spacing.md },
  content: { color: colors.textMuted, fontSize: 14, marginTop: spacing.sm, lineHeight: 20 },
  contentLink: { color: colors.primary, textDecorationLine: 'underline' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  chip: { color: colors.primary, fontSize: 12, fontWeight: '600' },
  actions: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionText: { color: colors.text, fontSize: 13, fontWeight: '700' },
  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: spacing.xl,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});
