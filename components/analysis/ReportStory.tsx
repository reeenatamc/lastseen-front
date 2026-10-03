'use client'

import { useMemo } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/navigation'
import { ShareCard } from '@/components/analysis/ShareCard'
import { LockedReport } from '@/components/analysis/LockedReport'
import { InlineConfirm } from '@/components/ui/InlineConfirm'
import { api } from '@/lib/api/client'
import type { AccessInfo } from '@/lib/api/types'
import { StoryShell } from './story/StoryShell'
import { buildReportScreens, type ReportData } from './story/screens'

interface ReportStoryProps {
  result: ReportData
  access?: AccessInfo | null
  /** Auth token; null for guests */
  token: string | null
  /** Present for saved analyses: enables the delete action */
  analysisId?: number
}

const TEXT_LINK =
  'inline-flex items-center min-h-[44px] text-xs font-mono text-[var(--text-detail)] underline underline-offset-2 hover:text-[var(--text-primary)] transition-colors outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]'

/** Full-screen chapters, one per screen, for full reports and previews. */
export function ReportStory({ result, access, token, analysisId }: ReportStoryProps) {
  const t = useTranslations('story')
  const tm = useTranslations('metrics')
  const tn = useTranslations('narrative')
  const tAnalysis = useTranslations('analysis')
  const tReports = useTranslations('reports')
  const locale = useLocale()
  const router = useRouter()

  const preview = access?.level === 'preview' ? access : null
  const privacy = token ? tAnalysis('footer') : tAnalysis('footerGuest')

  const screens = useMemo(() => {
    const ctx = { data: result, locale, t, tm, tn }

    if (preview) {
      const all = buildReportScreens(ctx, null, 'locked')
      const keep = all.filter(s => ['summary', 'rhythm', 'activity'].includes(s.id))
      return [
        ...keep,
        { id: 'locked', node: <LockedReport access={preview} token={token} privacy={privacy} /> },
      ]
    }

    const tail = (
      <div className="flex flex-col gap-4 w-full">
        <ShareCard result={result} />
        <div className="flex flex-wrap items-center gap-x-6">
          <Link href="/upload" className={TEXT_LINK}>
            {t('share.another')}
          </Link>
          {token && analysisId != null ? (
            <InlineConfirm
              label={tReports('deleteThis')}
              onConfirm={async () => {
                await api.deleteAnalysis(analysisId, token)
                router.push('/analyses')
              }}
            />
          ) : !token ? (
            <Link href="/auth" className={TEXT_LINK}>
              {t('share.createAccount')}
            </Link>
          ) : null}
        </div>
        <p className="story-detail">{privacy}</p>
      </div>
    )
    return buildReportScreens(ctx, tail, 'share')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, locale, preview?.level, token, analysisId, privacy, t, tm, tn])

  return <StoryShell screens={screens} signedIn={!!token} />
}
