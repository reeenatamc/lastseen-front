// ── Validation ────────────────────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean
  errors: Record<string, string>
}

export function validate(fields: Record<string, string>): ValidationResult {
  const errors: Record<string, string> = {}

  if ('email' in fields) {
    const email = fields.email.trim()
    if (!email) {
      errors.email = 'Email is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Enter a valid email address.'
    }
  }

  if ('password' in fields) {
    const password = fields.password
    if (!password) {
      errors.password = 'Password is required.'
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters.'
    }
  }

  if ('confirmPassword' in fields && 'password' in fields) {
    if (fields.confirmPassword !== fields.password) {
      errors.confirmPassword = 'Passwords do not match.'
    }
  }

  return { valid: Object.keys(errors).length === 0, errors }
}

// ── Formatting ────────────────────────────────────────────────────────────────

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
