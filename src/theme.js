import { Camera, Briefcase, Link as LinkIcon, StickyNote } from 'lucide-react-native';

// Central design tokens used across the app. Brand theme: aligned to
// jasminshukla.com — warm orange on near-black with neutral grays.
export const colors = {
  bg: '#000000', // Black
  card: '#121212', // Card surface
  cardAlt: '#1C1C1C', // Slightly raised surface (badges, reminder box)
  border: '#323232',
  primary: '#EB9944', // Brand orange
  primaryDark: '#D07F2C',
  secondary: '#EB9944',
  accent: '#D07F2C',
  text: '#F5F5F5',
  textMuted: '#9A9A9A',
  onPrimary: '#1A1208', // Dark text/icons that sit on top of the orange
  danger: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  instagram: '#E1306C',
  linkedin: '#0A66C2',
  link: '#EB9944',
  note: '#9A9A9A',
};

// Brand gradient (135°): orange → deep orange. Use with expo-linear-gradient.
export const gradient = {
  colors: ['#EB9944', '#D07F2C'],
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

// Metadata for the kinds of R&D items the user can save. `Icon` is a
// lucide-react-native component rendered wherever the type is shown.
export const RND_TYPES = {
  instagram: { label: 'Instagram', color: colors.instagram, Icon: Camera },
  linkedin: { label: 'LinkedIn', color: colors.linkedin, Icon: Briefcase },
  link: { label: 'Link', color: colors.link, Icon: LinkIcon },
  note: { label: 'Note', color: colors.note, Icon: StickyNote },
};
