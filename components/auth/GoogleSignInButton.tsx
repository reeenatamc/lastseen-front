'use client'

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential: string }) => void
          }) => void
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void
        }
      }
    }
  }
}

const GSI_SCRIPT_SRC = 'https://accounts.google.com/gsi/client'

interface Props {
  onSuccess: () => void
  onError: (msg: string) => void
}

export function GoogleSignInButton({ onSuccess, onError }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

  useEffect(() => {
    if (!clientId || !containerRef.current) return

    const handleCredential = async (response: { credential: string }) => {
      try {
        const res = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential: response.credential }),
        })
        const data = await res.json()
        if (!res.ok) {
          onError(typeof data.error === 'string' ? data.error : 'Google sign-in failed')
          return
        }
        onSuccess()
      } catch {
        onError('Connection error during Google sign-in')
      }
    }

    const initialize = () => {
      if (!window.google || !containerRef.current) return
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredential,
      })
      window.google.accounts.id.renderButton(containerRef.current, {
        type: 'standard',
        theme: 'outline',
        text: 'continue_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: 380,
      })
    }

    if (window.google) {
      initialize()
      return
    }

    const existing = document.querySelector(
      `script[src="${GSI_SCRIPT_SRC}"]`
    ) as HTMLScriptElement | null
    if (existing) {
      existing.addEventListener('load', initialize, { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = GSI_SCRIPT_SRC
    script.async = true
    script.defer = true
    script.onload = initialize
    document.head.appendChild(script)
  }, [clientId, onError, onSuccess])

  if (!clientId) return null

  return <div ref={containerRef} className="flex justify-center" />
}
