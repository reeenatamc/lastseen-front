'use client'

import { useCallback, useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/navigation'
import { InlineConfirm } from '@/components/ui/InlineConfirm'
import { LangToggle } from '@/components/ui/LangToggle'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useCredits } from '@/hooks/useCredits'
import { api } from '@/lib/api/client'
import type { AnalysisSummary } from '@/lib/api/types'

export default function AnalysesPage() {
  const t = useTranslations('reports')
  const locale = useLocale()
  const router = useRouter()

  const [token, setToken] = useState<string | null>(null)
  const [items, setItems] = useState<AnalysisSummary[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  const { balance } = useCredits(token)

  useEffect(() => {
    fetch('/api/auth/token')
      .then(r => r.json())
      .then(data => {
        if (data.token) setToken(data.token)
        else router.push('/auth')
      })
      .catch(() => router.push('/auth'))
  }, [router])

  const load = useCallback(async () => {
    if (!token) return
    setFailed(false)
    setItems(null)
    try {
      const list = await api.listAnalyses(token)
      setItems([...list].sort((a, b) => b.created_at.localeCompare(a.created_at)))
    } catch {
      setFailed(true)
    }
  }, [token])

  useEffect(() => {
    load()
  }, [load])

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })

  const remove = async (id: number) => {
    if (!token) return
    await api.deleteAnalysis(id, token)
    setItems(prev => (prev ? prev.filter(i => i.id !== id) : prev))
    setAnnouncement(t('deleted'))
  }

  return (
    <div className="min-h-screen">
      <div className="px-4 md:px-8 py-6 flex items-center justify-between">
        <span className="text-xs font-mono text-[var(--text-muted)] tracking-widest uppercase">
          <Link href="/" className="hover:text-[var(--text-primary)] transition-colors">
            LASTSEEN
          </Link>
          {' / '}
          <span>{t('title')}</span>
        </span>
        <div className="flex items-center gap-2 shrink-0">
          <ThemeToggle />
          <LangToggle />
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 md:px-6 pb-32 flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-mono">
            {t('title')}
          </h1>
          {balance && !balance.is_premium && (
            <span className="text-xs font-mono text-[var(--text-muted)]">
              {t('balance', { count: balance.credits })}
            </span>
          )}
        </div>

        <div aria-live="polite" className="sr-only">{announcement}</div>

        {items === null && !failed && (
          <p className="text-xs font-mono text-[var(--text-muted)]">{t('loading')}</p>
        )}

        {failed && (
          <div className="flex flex-col items-start gap-2">
            <p role="alert" className="text-xs font-mono text-[var(--destructive)]">{t('error')}</p>
            <button
              type="button"
              onClick={load}
              className="min-h-[44px] text-xs font-mono text-[var(--text-muted)] underline underline-offset-2 hover:text-[var(--text-primary)] transition-colors outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
            >
              {t('retry')}
            </button>
          </div>
        )}

        {items !== null && items.length === 0 && (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm font-mono text-[var(--text-muted)]">{t('empty')}</p>
            <Link
              href="/upload"
              className="text-xs font-mono text-[var(--text-primary)] underline underline-offset-2 hover:text-[var(--warm)] transition-colors"
            >
              {t('upload')}
            </Link>
          </div>
        )}

        {items !== null && items.length > 0 && (
          <ul className="flex flex-col gap-3">
            {items.map(item => (
              <li
                key={item.id}
                className="bg-[var(--surface)] border border-[var(--border)] p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <Link
                    href={`/analysis/${item.id}`}
                    className="text-sm font-mono text-[var(--text-primary)] hover:text-[var(--warm)] transition-colors truncate underline-offset-2 hover:underline"
                  >
                    {item.original_filename}
                  </Link>
                  <span className="text-xs font-mono text-[var(--text-muted)]">
                    {formatDate(item.created_at)}
                    {item.status !== 'completed' && (
                      <>
                        {' · '}
                        {item.status === 'failed' ? t('failed') : t('processing')}
                      </>
                    )}
                    {' · '}
                    <span style={item.unlocked ? { color: 'var(--warm)' } : undefined}>
                      {item.unlocked ? t('full') : t('preview')}
                    </span>
                  </span>
                </div>
                <InlineConfirm label={t('delete')} onConfirm={() => remove(item.id)} />
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
