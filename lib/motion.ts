import type { Transition, Variants } from 'framer-motion'

// ── Shared transition presets ─────────────────────────────────────────────────

export const EASE_OUT: Transition = { duration: 0.5, ease: 'easeOut' }

// ── Shared variants ───────────────────────────────────────────────────────────

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: EASE_OUT },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: EASE_OUT },
}
