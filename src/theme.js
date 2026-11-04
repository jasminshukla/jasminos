import {
  Camera,
  Briefcase,
  Link as LinkIcon,
  StickyNote,
  UtensilsCrossed,
  Car,
  ShoppingBag,
  ShoppingCart,
  Fuel,
  Cigarette,
  ReceiptText,
  HeartPulse,
  Clapperboard,
  Home,
  Wallet,
  Gift,
  TrendingUp,
  Coins,
  Landmark,
  Banknote,
  Smartphone,
  CreditCard,
} from 'lucide-react-native';

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
  income: '#10B981', // Money in (green)
  expense: '#EF4444', // Money out (red)
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

// ----- Money / Expense module -----
// Expense categories the user can tag a spend with. `Icon` is a
// lucide-react-native component rendered wherever the category is shown.
export const EXPENSE_CATEGORIES = {
  food: { label: 'Food', color: '#F97316', Icon: UtensilsCrossed },
  grocery: { label: 'Grocery', color: '#14B8A6', Icon: ShoppingCart },
  petrol: { label: 'Petrol', color: '#F43F5E', Icon: Fuel },
  transport: { label: 'Transport', color: '#3B82F6', Icon: Car },
  shopping: { label: 'Shopping', color: '#EC4899', Icon: ShoppingBag },
  smoking: { label: 'Smoking', color: '#6B7280', Icon: Cigarette },
  bills: { label: 'Bills', color: '#EAB308', Icon: ReceiptText },
  health: { label: 'Health', color: '#22C55E', Icon: HeartPulse },
  fun: { label: 'Fun', color: '#8B5CF6', Icon: Clapperboard },
  rent: { label: 'Rent', color: '#06B6D4', Icon: Home },
  other: { label: 'Other', color: '#9A9A9A', Icon: Wallet },
};

// Income categories (money coming in).
export const INCOME_CATEGORIES = {
  salary: { label: 'Salary', color: '#22C55E', Icon: Wallet },
  business: { label: 'Business', color: '#EB9944', Icon: Briefcase },
  gift: { label: 'Gift', color: '#EC4899', Icon: Gift },
  interest: { label: 'Interest', color: '#3B82F6', Icon: TrendingUp },
  other: { label: 'Other', color: '#9A9A9A', Icon: Coins },
};

// Kinds of account the user can hold money in (bank / cash / UPI wallet / card).
export const ACCOUNT_TYPES = {
  bank: { label: 'Bank', color: '#3B82F6', Icon: Landmark },
  cash: { label: 'Cash', color: '#22C55E', Icon: Banknote },
  upi: { label: 'UPI / Wallet', color: '#8B5CF6', Icon: Smartphone },
  card: { label: 'Card', color: '#EB9944', Icon: CreditCard },
};

// Resolve a transaction's category metadata by kind, falling back to "Other".
export function getCategoryMeta(type, key) {
  const map = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  return map[key] || map.other;
}

// ----- Tasks / To-Do module -----
// Priority levels a task can carry. `color` is used for the chip + the dot on
// the task card. Ordered low -> high.
export const TASK_PRIORITIES = {
  low: { label: 'Low', color: '#3B82F6' },
  medium: { label: 'Medium', color: '#EB9944' },
  high: { label: 'High', color: '#EF4444' },
};

// Resolve a task's priority metadata, defaulting to "Medium".
export function getPriorityMeta(key) {
  return TASK_PRIORITIES[key] || TASK_PRIORITIES.medium;
}
