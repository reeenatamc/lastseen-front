'use client'

import { useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Link } from '@/i18n/navigation'
import { api } from '@/lib/api/client'
import { validate } from '@/lib/utils'

type Mode = 'signin' | 'register'

interface FormState {
  email: string
  password: string
  confirmPassword: string
}

interface FormErrors {
  email?: string
  password?: string
  confirmPassword?: string
  general?: string
}

export default function AuthPage() {
  const router = useRouter()
  const t = useTranslations('auth')
  const [mode, setMode] = useState<Mode>('signin')
  const [form, setForm] = useState<FormState>({ email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)

  const update = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    setErrors(prev => ({ ...prev, [field]: undefined, general: undefined }))
  }

  const switchMode = (next: Mode) => {
    setMode(next)
    setErrors({})
    setForm({ email: '', password: '', confirmPassword: '' })
  }

  const runValidation = (): boolean => {
    const fields: Record<string, string> = { email: form.email, password: form.password }
    if (mode === 'register') fields.confirmPassword = form.confirmPassword
    const { errors: fieldErrors } = validate(fields)
    setErrors(fieldErrors)
    return Object.keys(fieldErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!runValidation()) return

    setLoading(true)
    setErrors({})

    try {
      if (mode === 'register') {
        await api.register(form.email, form.password)
      }
      await loginAndRedirect()
    } catch {
      setErrors({ general: 'Connection error. Please try again.' })
      setLoading(false)
    }
  }

  const loginAndRedirect = async () => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.email, password: form.password }),
    })

    const data = await res.json()

    if (!res.ok) {
      const detail = data.error ?? 'Incorrect credentials.'
      setErrors({ general: typeof detail === 'string' ? detail : 'Login failed.' })
      setLoading(false)
    } else {
      router.push('/upload')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[380px]">
        {/* Logo */}
        <div className="mb-8 md:mb-10 text-center">
          <Link
            href="/"
            className="text-sm font-mono tracking-widest text-[var(--text-muted)] uppercase hover:text-[var(--text-primary)] transition-colors"
          >
            LASTSEEN
          </Link>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-6 mb-8">
          {(['signin', 'register'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`min-h-[44px] flex items-end pb-1 text-sm font-mono transition-colors duration-200 ${
                mode === m
                  ? 'text-[var(--text-primary)] border-b border-[var(--text-primary)]'
                  : 'text-[var(--text-muted)] border-b border-transparent hover:text-[var(--text-primary)]'
              }`}
            >
              {m === 'signin' ? t('signin') : t('register')}
            </button>
          ))}
        </div>

        {/* Form */}
        <AnimatePresence mode="wait">
          <motion.form
            key={mode}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
            noValidate
          >
            <Input
              label={t('email')}
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={update('email')}
              error={errors.email}
              disabled={loading}
            />

            <Input
              label={t('password')}
              type="password"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              value={form.password}
              onChange={update('password')}
              error={errors.password}
              disabled={loading}
            />

            {mode === 'register' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Input
                  label={t('confirmPassword')}
                  type="password"
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={update('confirmPassword')}
                  error={errors.confirmPassword}
                  disabled={loading}
                />
              </motion.div>
            )}

            {errors.general && (
              <p className="text-xs font-mono text-[var(--destructive)]">{errors.general}</p>
            )}

            <div className="mt-2">
              <Button
                type="submit"
                variant={loading ? 'disabled' : 'primary'}
                loading={loading}
                className="w-full"
              >
                {mode === 'signin' ? t('submitSignin') : t('submitRegister')}
              </Button>
            </div>
          </motion.form>
        </AnimatePresence>

        {/* Toggle link */}
        <div className="mt-6 text-xs font-mono text-[var(--text-muted)] text-center">
          {mode === 'signin' ? (
            <button
              onClick={() => switchMode('register')}
              className="min-h-[44px] inline-flex items-center justify-center hover:text-[var(--text-primary)] transition-colors"
            >
              {t('toggleToRegister')}
            </button>
          ) : (
            <button
              onClick={() => switchMode('signin')}
              className="min-h-[44px] inline-flex items-center justify-center hover:text-[var(--text-primary)] transition-colors"
            >
              {t('toggleToSignin')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
