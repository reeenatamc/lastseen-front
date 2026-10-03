export type AnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface StatusResponse {
  id: number
  status: AnalysisStatus
  error: string | null
  updated_at: string
}

export interface UploadResponse {
  analysis_id: number
  task_id: string | null
  status: string
  // Authenticated uploads: 'full' spent a credit, 'preview' means no credits
  tier?: 'full' | 'preview'
}

export interface Narrative {
  resumen: string
  dinamica: string | null
  punto_de_quiebre: string | null
  estado_actual: string | null
  reflexion: string | null
  error?: string
}

export interface TemporalOverview {
  participants: string[]
  total_messages: number
  share_per_person: Record<string, number>
  messages_per_person: Record<string, number>
  date_range: { start: string; end: string; total_days: number }
}

export interface ResponseTime {
  per_person: Record<string, { mean_seconds: number; median_seconds: number; p90_seconds: number }>
  evolution: Array<{ period: string } & Record<string, number>>
}

export interface DoubleText {
  per_person: Record<string, number>
  share: Record<string, number>
  total: number
}

export interface DelayedReplies {
  per_person: Record<string, number>
  share: Record<string, number>
  total: number
  threshold_hours: number
}

export interface InitiativeBalance {
  share: Record<string, number>
  per_person: Record<string, number>
  total_conversations: number
  abandoned_open: DoubleText
  late_reply: DoubleText
  double_text: DoubleText
  evolution: Array<{ period: string } & Record<string, number>>
  // 'low' when there are too few conversations to trust the shares
  confidence?: { level: 'low' | 'ok'; reason: string | null }
}

export interface ClosingPhase {
  detected: boolean
  start: string
  volume_ratio: number
  max_silence_days: number
  baseline_max_silence_days: number
  window_weeks: number
}

export interface ResponseDecay {
  closing_phase?: ClosingPhase | null
  trend: 'deteriorating' | 'stable' | 'improving'
  decay_score: number
  turning_point: string | null
  evolution: Array<{
    period: string
    avg_response_seconds: number | null
    message_count: number
    initiative_imbalance: number
  }>
}

export interface ConversationGap {
  start: string
  end: string
  hours: number
  days: number
}

export interface ActivityPatterns {
  by_hour: Record<string, number>
  by_weekday: Record<string, number>
  by_month: Array<{ period: string; count: number }>
}

export interface SentimentPerPerson {
  dominant: 'positive' | 'neutral' | 'negative'
  positive: number
  neutral: number
  negative: number
  avg_score: number
  charged?: ChargedTone
}

export interface ChargedTone {
  share: number
  positive: number | null
  negative: number | null
}

export interface RecentSentiment {
  window_days: number
  start: string
  shift: 'more_negative' | 'more_positive' | 'stable'
  per_person?: Record<string, unknown>
}

export interface ConflictEpisode {
  start: string
  end: string
  mentions: number
  per_person?: Record<string, number>
  categories?: Record<string, number>
  missed_calls: number
  blocked: boolean
  severity: 'high' | 'medium'
}

export interface ConflictData {
  mentions?: {
    total: number
    per_person: Record<string, number>
    per_category: Record<string, number>
    rate_per_1000: number
  }
  episodes: ConflictEpisode[]
  system_events?: {
    blocks: string[]
    unblocks: string[]
    deleted_messages: Record<string, number>
    missed_calls: { total: number; per_person: Record<string, number> }
  }
  recent?: {
    window_weeks: number
    rate_per_1000: number
    baseline_rate_per_1000: number
    ratio: number | null
  } | null
  error?: string
}

export interface EmotionalDrift {
  score: number
  direction: string
  turning_point: string | null
}

export interface Teaser {
  conflict_episodes: number | null
  turning_point_detected: boolean
  closing_phase_detected: boolean
}

export type AccessInfo =
  | { level: 'full' }
  | { level: 'preview'; locked: string[]; teaser: Teaser }

export interface CreditPack {
  key: string
  credits: number
  price_cents: number
  currency: string
}

export interface CreditBalance {
  credits: number
  is_premium: boolean
}

export interface AnalysisSummary {
  id: number
  platform: string
  original_filename: string
  status: AnalysisStatus
  created_at: string
  unlocked: boolean
}

export interface AnalysisResult {
  id: number
  platform: string
  original_filename: string
  status: AnalysisStatus
  created_at: string
  updated_at: string
  error: string | null
  // listing only: false when the analysis is a preview
  unlocked?: boolean
  // null while there is no result yet; undefined on results saved before paywall
  access?: AccessInfo | null
  result: {
    temporal: {
      overview: TemporalOverview
      response_time: ResponseTime
      // initiative_balance, response_decay and conversation_gaps are absent in a preview
      initiative_balance?: InitiativeBalance
      response_decay?: ResponseDecay
      conversation_gaps?: { top_gaps: ConversationGap[]; distribution: Record<string, number> }
      message_length: {
        per_person: Record<string, { mean_chars: number; median_chars: number }>
        evolution: Array<{ period: string } & Record<string, number>>
      }
      activity_patterns: ActivityPatterns
      delayed_replies?: DelayedReplies
    }
    sentiment?: {
      per_person: Record<string, SentimentPerPerson>
      evolution: Array<{ period: string } & Record<string, number>>
      emotional_drift: EmotionalDrift
      recent?: RecentSentiment | null
      sample_size: number
      total_text_messages: number
      error?: string
    }
    narrative?: Narrative
    conflict?: ConflictData | { error: string }
  } | null
}
