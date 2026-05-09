'use client'

import { motion } from 'framer-motion'

// Mock data — anonymized, representative of a real deteriorating chat
const MOCK = {
  narrative: "La conversación empezó con reciprocidad clara. Ambos iniciaban, ambos respondían. En el tercer mes algo cambió: los tiempos de respuesta empezaron a crecer y el peso de mantener el hilo cayó sobre uno solo.",
  participants: ['A', 'B'],
  initiativeShare: { A: 0.78, B: 0.22 },
  decayScore: 0.64,
  trend: 'deteriorating',
  sentimentA: 'warm',
  sentimentB: 'distant',
}

function Bar({ value, warm }: { value: number; warm?: boolean }) {
  return (
    <div className="h-1 w-full bg-[var(--border)] overflow-hidden">
      <div
        className="h-full transition-all duration-700"
        style={{
          width: `${value * 100}%`,
          backgroundColor: warm ? 'var(--warm)' : 'var(--text-primary)',
        }}
      />
    </div>
  )
}

export function AnalysisPreview() {
  return (
    <section className="max-w-[560px] mx-auto w-full px-6 py-16">
      <p className="text-[10px] font-mono text-[var(--text-muted)] tracking-[0.25em] uppercase mb-8">
        example output
      </p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex flex-col gap-4"
      >
        {/* Narrative card */}
        <div className="border border-[var(--border)] bg-[var(--surface)] p-6">
          <p className="text-[10px] font-mono text-[var(--text-muted)] tracking-widest uppercase mb-5">
            LASTSEEN INTERPRETATION
          </p>
          <p
            className="text-base leading-[1.75] text-[var(--text-primary)]"
            style={{ fontFamily: 'var(--font-instrument-serif), "Instrument Serif", serif', fontStyle: 'italic' }}
          >
            {MOCK.narrative}
          </p>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* Initiative */}
          <div className="border border-[var(--border)] bg-[var(--surface)] p-4">
            <p className="text-[10px] font-mono text-[var(--text-muted)] tracking-widest uppercase mb-4">
              Initiative balance
            </p>
            <div className="flex flex-col gap-3">
              {MOCK.participants.map(p => (
                <div key={p} className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">{p}</span>
                  <Bar value={MOCK.initiativeShare[p as 'A' | 'B']} />
                </div>
              ))}
            </div>
          </div>

          {/* Decay */}
          <div className="border border-[var(--border)] bg-[var(--surface)] p-4">
            <p className="text-[10px] font-mono text-[var(--text-muted)] tracking-widest uppercase mb-4">
              Response decay
            </p>
            <div className="flex flex-col gap-3">
              <Bar value={MOCK.decayScore} warm />
              <span className="text-[10px] font-mono text-[var(--text-muted)]">
                worsening over time
              </span>
            </div>
          </div>
        </div>

        {/* Emotional drift */}
        <div className="border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="text-[10px] font-mono text-[var(--text-muted)] tracking-widest uppercase mb-4">
            Tone per person
          </p>
          <div className="flex gap-6">
            {[
              { name: 'A', tone: MOCK.sentimentA },
              { name: 'B', tone: MOCK.sentimentB },
            ].map(({ name, tone }) => (
              <div key={name} className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-[var(--text-muted)]">{name}</span>
                <span
                  className="text-[10px] font-mono"
                  style={{ color: tone === 'warm' ? 'var(--warm)' : 'var(--text-muted)' }}
                >
                  {tone}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Disclaimer */}
      <p className="text-[10px] font-mono text-[var(--border)] mt-6 text-center tracking-wide">
        anonymized example · not a real conversation
      </p>
    </section>
  )
}
