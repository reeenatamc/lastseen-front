'use client'

import { useEffect, useRef } from 'react'

interface UsePollingOptions {
  enabled: boolean
  interval: number
  onTick: () => Promise<void> | void
}

export function usePolling({ enabled, interval, onTick }: UsePollingOptions): void {
  const tickRef = useRef(onTick)
  tickRef.current = onTick

  useEffect(() => {
    if (!enabled) return

    let active = true

    const run = async () => {
      if (!active) return
      await tickRef.current()
    }

    run()
    const id = setInterval(run, interval)

    return () => {
      active = false
      clearInterval(id)
    }
  }, [enabled, interval])
}
