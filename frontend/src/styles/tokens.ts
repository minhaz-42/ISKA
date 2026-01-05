// PKF calm design tokens.
// These are the single source of truth for UI constants.
// Components should reference CSS variables via Tailwind (e.g., `bg-(--pkf-card)`),
// and reference motion/behavior constants from here to avoid inline magic numbers.

export const PKF_TOKENS = {
  colors: {
    // Backgrounds
    bg: '#0C0F14',
    surface: '#111827',
    card: '#161E2E',
    cardHover: '#1B2538',

    // Accents
    primary: '#7AA2F7',
    primaryHover: '#8FB3FF',
    primaryMuted: '#4C6FBF',

    secondary: '#F5C97A',
    secondaryHover: '#E8B86D',
    secondaryMuted: '#9A7B43',

    // Status (muted)
    healthy: '#7BC99A',
    neutral: '#E5D27A',
    attention: '#D98C8C',

    // Neutrals
    border: '#1F2937',
  },

  radiusPx: {
    card: 16,
    pill: 999,
  },

  spacingPx: {
    // Keep a small, calm spacing set used for layout decisions.
    // Tailwind spacing utilities still handle the majority of spacing.
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
  },

  shadow: {
    // Matches the global `.pkf-card` shadow.
    card: '0 10px 30px rgba(0,0,0,0.25)',
  },

  motionMs: {
    fast: 150,
    normal: 250,

    // Monitor toasts
    toastTtl: 5000,
    toastSweep: 250,

    // Mock insight cadence (UI-only simulation)
    mockInsightCadence: 2600,
  },

  ring: {
    // Soft ring indicator geometry (no numeric display).
    sizePx: 64,
    strokeWidthPx: 7,
    // Static demo "fill" levels — not shown as numbers.
    demoProgress: {
      novelty: 0.78,
      cognitiveLoad: 0.55,
      misinformationSignals: 0.22,
    },
  },

  limits: {
    toastStack: 4,
  },
} as const

export type ConfidenceWord = 'Low confidence' | 'Moderate confidence' | 'High confidence'

export function confidenceToWords(confidence01: number): ConfidenceWord {
  const c = Number.isFinite(confidence01) ? Math.max(0, Math.min(1, confidence01)) : 0
  if (c >= 0.75) return 'High confidence'
  if (c >= 0.45) return 'Moderate confidence'
  return 'Low confidence'
}
