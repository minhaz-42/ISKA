/**
 * PKF Design Tokens
 * 
 * A calm, minimal design system inspired by Notion × Arc × Linear.
 * No urgency. No dopamine traps. Trust and clarity.
 */

export const PKF_TOKENS = {
  // Typography
  fonts: {
    sans: 'ui-sans-serif, system-ui, Inter, -apple-system, "Segoe UI", Roboto, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace',
  },

  fontSizes: {
    xs: '0.75rem',    // 12px
    sm: '0.8125rem',  // 13px
    base: '0.875rem', // 14px
    md: '0.9375rem',  // 15px
    lg: '1rem',       // 16px
    xl: '1.125rem',   // 18px
    '2xl': '1.375rem', // 22px
    '3xl': '1.75rem',  // 28px
    '4xl': '2.25rem',  // 36px
  },

  fontWeights: {
    normal: '400',
    medium: '500',
    semibold: '600',
  },

  lineHeights: {
    tight: '1.3',
    snug: '1.45',
    normal: '1.6',
    relaxed: '1.75',
  },

  // Spacing (8px base grid)
  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
  },

  // Border radius (soft, rounded)
  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    full: '9999px',
  },

  // Shadows (subtle, soft)
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.04)',
    md: '0 4px 12px rgba(0, 0, 0, 0.06)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.08)',
    xl: '0 12px 40px rgba(0, 0, 0, 0.10)',
    glow: '0 0 20px rgba(122, 162, 247, 0.15)',
  },

  // Transitions (smooth, calm)
  transitions: {
    fast: '100ms ease',
    base: '150ms ease',
    slow: '250ms ease',
    gentle: '350ms ease-out',
  },

  // Max widths for readable content
  maxWidths: {
    prose: '65ch',
    narrow: '480px',
    content: '720px',
    wide: '960px',
    full: '1200px',
  },
} as const

/**
 * Color palette with light and dark modes.
 * Warm, soft, non-aggressive colors.
 */
export const COLORS = {
  light: {
    // Backgrounds (warm off-whites)
    bg: '#FAFAF9',
    surface: '#FFFFFF',
    surfaceHover: '#F7F7F6',
    card: '#FFFFFF',
    cardHover: '#FAFAF9',

    // Borders (subtle, warm gray)
    border: '#E8E7E5',
    borderSubtle: '#F0EFED',
    borderFocus: '#C4C3C0',

    // Text (charcoal hierarchy)
    text: '#3D3D3C',
    textStrong: '#1A1A19',
    textMuted: '#6B6B69',
    textSubtle: '#9A9A97',

    // Accents (calm, muted)
    primary: '#5B7FD3',       // Calm blue
    primaryHover: '#4A6BC0',
    primaryMuted: '#8BA3E0',
    primarySubtle: '#E8EDF8',

    secondary: '#D4A853',     // Warm gold
    secondaryHover: '#C49840',
    secondaryMuted: '#E5C98A',
    secondarySubtle: '#FAF5E8',

    // Status (soft, not alarming)
    success: '#6DAA7E',       // Soft sage
    successSubtle: '#EDF5EF',
    warning: '#D4A853',       // Warm amber
    warningSubtle: '#FAF5E8',
    info: '#7BA3C9',          // Soft sky
    infoSubtle: '#EEF4F9',

    // Overlays
    overlay: 'rgba(0, 0, 0, 0.03)',
    overlayHover: 'rgba(0, 0, 0, 0.05)',
    backdrop: 'rgba(0, 0, 0, 0.4)',

    // Focus
    focusRing: 'rgba(91, 127, 211, 0.4)',
  },

  dark: {
    // Backgrounds (deep charcoal)
    bg: '#0F1115',
    surface: '#161A21',
    surfaceHover: '#1C2028',
    card: '#1A1F27',
    cardHover: '#21262F',

    // Borders (subtle)
    border: '#2A2F38',
    borderSubtle: '#232831',
    borderFocus: '#404650',

    // Text (soft whites)
    text: '#D4D4D2',
    textStrong: '#F0F0EE',
    textMuted: '#9A9A97',
    textSubtle: '#6B6B69',

    // Accents
    primary: '#7AA2F7',
    primaryHover: '#8FB3FF',
    primaryMuted: '#5B7FD3',
    primarySubtle: '#1E2738',

    secondary: '#E5C98A',
    secondaryHover: '#F0D9A0',
    secondaryMuted: '#B89C5A',
    secondarySubtle: '#2A2518',

    // Status
    success: '#7BC99A',
    successSubtle: '#1A2820',
    warning: '#E5C98A',
    warningSubtle: '#2A2518',
    info: '#8FB3E8',
    infoSubtle: '#1A2230',

    // Overlays
    overlay: 'rgba(255, 255, 255, 0.03)',
    overlayHover: 'rgba(255, 255, 255, 0.06)',
    backdrop: 'rgba(0, 0, 0, 0.7)',

    // Focus
    focusRing: 'rgba(122, 162, 247, 0.4)',
  },
} as const

export type ColorMode = 'light' | 'dark'
export type ColorKey = keyof typeof COLORS.light
