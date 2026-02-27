// Design tokens extracted from Google Stitch designs
// Primary brand: #195de6 (blue), Playfair Display (serif) + Inter (sans)

export const colors = {
  primary: '#195de6',
  primaryLight: 'rgba(25, 93, 230, 0.12)',
  backgroundLight: '#f6f6f8',
  backgroundDark: '#111621',
  surfaceLight: '#ffffff',
  surfaceDark: '#1e2433',
  textPrimary: '#1a1a1a',
  textSecondary: '#666666',
  textMuted: '#9ca3af',
  borderLight: '#e5e7eb',
  borderDark: '#374151',
  red: '#ef4444',
  redLight: 'rgba(239, 68, 68, 0.12)',
} as const

export const fonts = {
  serif: 'PlayfairDisplay_700Bold',
  serifMedium: 'PlayfairDisplay_600SemiBold',
  serifItalic: 'PlayfairDisplay_400Regular_Italic',
  sans: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
  sansSemiBold: 'Inter_600SemiBold',
} as const

export const radii = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  full: 9999,
} as const

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const
