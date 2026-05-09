'use client'

import { motion } from 'framer-motion'

interface DividerProps {
  className?: string
  delay?: number
}

export function Divider({ className = '', delay = 0 }: DividerProps) {
  return (
    <motion.hr
      initial={{ opacity: 0, scaleX: 0 }}
      animate={{ opacity: 1, scaleX: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay }}
      style={{ originX: 0 }}
      className={`border-none h-px bg-[var(--border)] my-8 ${className}`}
    />
  )
}
