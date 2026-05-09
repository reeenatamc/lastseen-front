'use client'

import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-mono"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`
          w-full bg-[var(--surface)] border px-4 py-3 text-sm font-mono
          text-[var(--text-primary)] placeholder-[var(--text-muted)]
          outline-none transition-colors duration-200
          ${error
            ? 'border-[var(--destructive)] focus:border-[var(--destructive)]'
            : 'border-[var(--border)] focus:border-[var(--text-muted)]'
          }
          ${className}
        `}
        {...props}
      />
      {error && (
        <span className="text-xs text-[var(--destructive)] font-mono">{error}</span>
      )}
    </div>
  )
}
