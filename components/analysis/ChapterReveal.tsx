'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { fadeUp } from '@/lib/motion'

interface ChapterRevealProps {
  children: React.ReactNode
  delay?: number          // ms before auto-reveal (0 = scroll triggered)
  scrollTriggered?: boolean
  className?: string
}

export function ChapterReveal({
  children,
  delay = 0,
  scrollTriggered = false,
  className = '',
}: ChapterRevealProps) {
  const [visible, setVisible] = useState(delay === 0 && !scrollTriggered)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (delay > 0 && !scrollTriggered) {
      const timer = setTimeout(() => setVisible(true), delay)
      return () => clearTimeout(timer)
    }
  }, [delay, scrollTriggered])

  useEffect(() => {
    if (!scrollTriggered) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) observer.observe(ref.current)

    return () => observer.disconnect()
  }, [scrollTriggered])

  return (
    <div ref={ref} className={className}>
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate={visible ? 'visible' : 'hidden'}
      >
        {children}
      </motion.div>
    </div>
  )
}
