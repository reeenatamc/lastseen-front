'use client'

import { useCallback, useEffect, useState } from 'react'
import { api } from '@/lib/api/client'
import type { CreditBalance, CreditPack } from '@/lib/api/types'

interface UseCreditsReturn {
  balance: CreditBalance | null
  packs: CreditPack[] | null
  /** True when the last balance request failed */
  failed: boolean
  reload: () => Promise<void>
}

/** Credit balance and purchasable packs for an authenticated user. */
export function useCredits(token: string | null): UseCreditsReturn {
  const [balance, setBalance] = useState<CreditBalance | null>(null)
  const [packs, setPacks] = useState<CreditPack[] | null>(null)
  const [failed, setFailed] = useState(false)

  const reload = useCallback(async () => {
    if (!token) return
    setFailed(false)
    try {
      setBalance(await api.getCredits(token))
    } catch {
      setFailed(true)
    }
  }, [token])

  useEffect(() => {
    if (!token) return
    reload()
    api.getPacks().then(setPacks).catch(() => setPacks([]))
  }, [token, reload])

  return { balance, packs, failed, reload }
}
