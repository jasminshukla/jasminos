// Central design tokens used across the app.
export const colors = {
  bg: '#0F1115',
  card: '#1A1D24',
  cardAlt: '#22262F',
  border: '#2C313C',
  primary: '#5B8CFF',
  primaryDark: '#3D6BE0',
  text: '#F2F4F8',
  textMuted: '#9BA3B2',
  danger: '#FF5C5C',
  success: '#37C978',
  warning: '#FFB020',
  instagram: '#E1306C',
  linkedin: '#0A66C2',
  link: '#5B8CFF',
  note: '#37C978',
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
