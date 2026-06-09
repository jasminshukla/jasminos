// Central design tokens used across the app. Brand theme: Indigo / Blue / Cyan.
export const colors = {
  bg: '#0F172A', // Dark Slate
  card: '#1E293B', // Card surface
  cardAlt: '#334155',
  border: '#334155',
  primary: '#4F46E5', // Indigo
  primaryDark: '#4338CA',
  secondary: '#3B82F6', // Blue
  accent: '#06B6D4', // Cyan
  text: '#F8FAFC',
  textMuted: '#94A3B8',
  danger: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  instagram: '#E1306C',
  linkedin: '#0A66C2',
  link: '#3B82F6',
  note: '#10B981',
};

// Brand gradient (135°): Indigo → Blue → Cyan. Use with expo-linear-gradient.
export const gradient = {
  colors: ['#4F46E5', '#3B82F6', '#06B6D4'],
  // 135deg ≈ top-left to bottom-right
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  pill: 999,
};

// Metadata for the kinds of R&D items the user can save.
export const RND_TYPES = {
  instagram: { label: 'Instagram', color: colors.instagram, icon: '📸' },
  linkedin: { label: 'LinkedIn', color: colors.linkedin, icon: '💼' },
  link: { label: 'Link', color: colors.link, icon: '🔗' },
  note: { label: 'Note', color: colors.note, icon: '📝' },
};
