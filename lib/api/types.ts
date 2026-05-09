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
}

export interface Narrative {
  resumen: string
  dinamica: string
  punto_de_quiebre: string | null
  estado_actual: string
  reflexion: string
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
}

export interface ResponseDecay {
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
}

export interface EmotionalDrift {
  score: number
  direction: string
  turning_point: string | null
}

export interface AnalysisResult {
  id: number
  platform: string
  original_filename: string
  status: AnalysisStatus
  created_at: string
  updated_at: string
  error: string | null
  result: {
    temporal: {
      overview: TemporalOverview
      response_time: ResponseTime
      initiative_balance: InitiativeBalance
      response_decay: ResponseDecay
      conversation_gaps: { top_gaps: ConversationGap[]; distribution: Record<string, number> }
      message_length: {
        per_person: Record<string, { mean_chars: number; median_chars: number }>
        evolution: Array<{ period: string } & Record<string, number>>
      }
      activity_patterns: ActivityPatterns
      delayed_replies?: DelayedReplies
    }
    sentiment: {
      per_person: Record<string, SentimentPerPerson>
      evolution: Array<{ period: string } & Record<string, number>>
      emotional_drift: EmotionalDrift
      sample_size: number
      total_text_messages: number
      error?: string
    }
    narrative: Narrative
  } | null
}
