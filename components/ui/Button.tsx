'use client'

import { motion } from 'framer-motion'
import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'ghost' | 'disabled'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  loading?: boolean
}

export function Button({
  variant = 'primary',
  loading = false,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || variant === 'disabled' || loading

  const base =
    'inline-flex items-center justify-center px-6 py-3 min-h-[44px] text-sm tracking-widest uppercase transition-colors duration-300 font-mono outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]'

  const variants: Record<ButtonVariant, string> = {
    primary:
      'bg-[var(--text-primary)] text-[var(--background)] hover:bg-white cursor-pointer',
    ghost:
      'bg-transparent text-[var(--text-primary)] border border-[var(--border)] hover:border-[var(--text-muted)] cursor-pointer',
    disabled:
      'bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)] cursor-not-allowed',
  }

  const resolvedVariant = isDisabled && variant === 'primary' ? 'disabled' : variant

  return (
    <motion.button
      whileTap={isDisabled ? {} : { scale: 0.98 }}
      className={`${base} ${variants[resolvedVariant]} ${className}`}
      disabled={isDisabled}
      {...(props as object)}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          {children}
          <span className="cursor-blink">_</span>
        </span>
      ) : (
        children
      )}
    </motion.button>
  )
}
