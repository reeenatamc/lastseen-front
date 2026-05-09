'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import type { Narrative } from '@/lib/api/types'
import { fadeUp } from '@/lib/motion'

interface NarrativeCardProps {
  narrative: Narrative
  onComplete?: () => void
}

const TYPEWRITER_SPEED = 28   // ms per character
const AUTO_ADVANCE_DELAY = 1100 // ms after typing finishes before auto-advancing

// ── Typewriter hook ───────────────────────────────────────────────────────────

function useTypewriter(text: string, active: boolean, onDone: () => void) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => {
    if (!active) return
    setDisplayed('')
    setDone(false)
    let i = 0
    const timer = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(timer)
        setDone(true)
        onDoneRef.current()
      }
    }, TYPEWRITER_SPEED)
    return () => clearInterval(timer)
  }, [text, active])

  return { displayed, done }
}

// ── Main component ────────────────────────────────────────────────────────────

export function NarrativeCard({ narrative, onComplete }: NarrativeCardProps) {
  const t = useTranslations('narrative')
  const isError = narrative.error === 'not_configured'

  const fields = [
    narrative.resumen,
    narrative.dinamica,
    narrative.punto_de_quiebre,
    narrative.estado_actual,
    narrative.reflexion,
  ].filter((f): f is string => f !== null && f !== undefined)

  const [index, setIndex]         = useState(0)
  const [typingDone, setTypingDone] = useState(false)
  const [manual, setManual]       = useState(false) // false = auto mode
  const autoTimerRef              = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isLast  = index === fields.length - 1
  const isFirst = index === 0

  // Clear any pending auto-advance timer
  const clearAutoTimer = () => {
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current)
  }

  // Reset typing state when field changes
  useEffect(() => {
    setTypingDone(false)
  }, [index])

  // Auto-advance after typing finishes (only in auto mode)
  const handleTypingDone = useCallback(() => {
    setTypingDone(true)
    if (!manual) {
      autoTimerRef.current = setTimeout(() => {
        if (isLast) {
          onComplete?.()
        } else {
          setIndex(i => i + 1)
        }
      }, AUTO_ADVANCE_DELAY)
    }
  }, [manual, isLast, onComplete])

  // Cleanup timer on unmount
  useEffect(() => () => clearAutoTimer(), [])

  // Switch to manual mode and cancel auto-advance
  const enterManual = useCallback(() => {
    clearAutoTimer()
    setManual(true)
  }, [])

  const goNext = useCallback(() => {
    enterManual()
    if (isLast) onComplete?.()
    else setIndex(i => i + 1)
  }, [enterManual, isLast, onComplete])

  const goPrev = useCallback(() => {
    enterManual()
    if (!isFirst) setIndex(i => i - 1)
  }, [enterManual, isFirst])

  const handleSkip = useCallback(() => {
    enterManual()
    // Trigger onComplete immediately if already on last
    if (isLast) onComplete?.()
  }, [enterManual, isLast, onComplete])

  // Placeholder loading state
  useEffect(() => {
    if (isError) {
      const t = setTimeout(() => onComplete?.(), 800)
      return () => clearTimeout(t)
    }
  }, [isError, onComplete])

  if (isError) {
    return (
      <motion.div variants={fadeUp} initial="hidden" animate="visible"
        className="border border-[var(--border)] bg-[var(--surface)] p-6 md:p-10"
      >
        <span className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-mono block mb-8">
          {t('title')}
        </span>
        <p className="text-sm font-mono text-[var(--text-muted)]">
          {t('comingSoon')}
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible"
      className="border border-[var(--border)] bg-[var(--surface)] p-6 md:p-10"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <span className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-mono">
          {t(`label${index}` as 'label0' | 'label1' | 'label2' | 'label3' | 'label4')}
        </span>

        <div className="flex items-center gap-4">
          {/* Progress dots */}
          <div className="flex gap-1.5">
            {fields.map((_, i) => (
              <div key={i} className="w-1 h-1 rounded-full transition-colors duration-300"
                style={{
                  backgroundColor: i === index
                    ? 'var(--text-primary)'
                    : i < index ? 'var(--text-muted)' : 'var(--border)',
                }}
              />
            ))}
          </div>

          {/* Skip — only visible in auto mode while typing */}
          {!manual && !typingDone && (
            <button onClick={handleSkip}
              className="text-xs font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors tracking-widest uppercase"
            >
              {t('skip')}
            </button>
          )}
        </div>
      </div>

      {/* Text area */}
      <AnimatePresence mode="wait">
        <motion.div key={index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="min-h-[6rem] md:min-h-[8rem] flex items-start"
        >
          {manual ? (
            // Manual mode — full text, no animation
            <p className="text-lg md:text-[1.35rem] leading-[1.75] text-[var(--text-primary)]"
              style={{ fontFamily: 'var(--font-instrument-serif), "Instrument Serif", serif' }}
            >
              {fields[index]}
            </p>
          ) : (
            // Auto mode — typewriter
            <TypingField text={fields[index]} onDone={handleTypingDone} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation — only visible in manual mode */}
      {manual && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between mt-8 pt-6 border-t border-[var(--border)]"
        >
          <button onClick={goPrev} disabled={isFirst}
            className="min-h-[44px] min-w-[44px] flex items-center text-xs font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors tracking-widest uppercase disabled:opacity-0"
          >
            {t('back')}
          </button>

          <span className="text-xs font-mono text-[var(--text-muted)]">
            {index + 1} / {fields.length}
          </span>

          <button onClick={goNext}
            className="min-h-[44px] min-w-[44px] flex items-center justify-end text-xs font-mono text-[var(--text-primary)] hover:text-[var(--warm)] transition-colors tracking-widest uppercase"
          >
            {isLast ? t('continue') : t('next')}
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}

// ── Typing field ──────────────────────────────────────────────────────────────

interface TypingFieldProps {
  text: string
  onDone: () => void
}

function TypingField({ text, onDone }: TypingFieldProps) {
  const { displayed, done } = useTypewriter(text, true, onDone)

  return (
    <p className="text-lg md:text-[1.35rem] leading-[1.75] text-[var(--text-primary)]"
      style={{ fontFamily: 'var(--font-instrument-serif), "Instrument Serif", serif' }}
    >
      {displayed}
      {!done && <span className="cursor-blink font-mono">_</span>}
    </p>
  )
}
