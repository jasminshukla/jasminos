import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme';

// Reusable centered confirmation modal. Tapping the backdrop or pressing the
// Android back button cancels; nothing happens until the user confirms.
export default function ConfirmDialog({
  visible,
  title = 'Are you sure?',
  message = "This can't be undone.",
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  destructive = true,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <Pressable style={styles.backdrop} onPress={onCancel}>
        {/* Swallow presses on the card so they don't dismiss the dialog. */}
        <Pressable style={styles.card} onPress={() => {}}>
          <Text style={styles.title}>{title}</Text>
          {message ? (
            <Text style={styles.message} numberOfLines={3}>
              {message}
            </Text>
          ) : null}
          <View style={styles.actions}>
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => [styles.btn, styles.cancel, pressed && styles.pressed]}
            >
              <Text style={styles.cancelText}>{cancelLabel}</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.btn,
                destructive ? styles.confirmDanger : styles.confirm,
                pressed && styles.pressed,
              ]}
            >
              <Text style={destructive ? styles.confirmDangerText : styles.confirmText}>
                {confirmLabel}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
  },
  title: { color: colors.text, fontSize: 18, fontWeight: '800' },
  message: { color: colors.textMuted, fontSize: 14, lineHeight: 20, marginTop: spacing.sm },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl },
  btn: {
    flex: 1,
    paddingVertical: spacing.md + 2,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancel: { backgroundColor: colors.cardAlt, borderWidth: 1, borderColor: colors.border },
  cancelText: { color: colors.text, fontSize: 15, fontWeight: '700' },
  confirm: { backgroundColor: colors.primary },
  confirmText: { color: colors.onPrimary, fontSize: 15, fontWeight: '700' },
  confirmDanger: { backgroundColor: colors.danger },
  confirmDangerText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  pressed: { opacity: 0.85 },
});
