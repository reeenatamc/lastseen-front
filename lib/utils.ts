// ── Validation ────────────────────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean
  /** Values are keys of the `errors.validation` messages section */
  errors: Record<string, string>
}

export function validate(fields: Record<string, string>): ValidationResult {
  const errors: Record<string, string> = {}

  if ('email' in fields) {
    const email = fields.email.trim()
    if (!email) {
      errors.email = 'emailRequired'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'emailInvalid'
    }
  }

  if ('password' in fields) {
    const password = fields.password
    if (!password) {
      errors.password = 'passwordRequired'
    } else if (password.length < 8) {
      errors.password = 'passwordShort'
    }
  }

  if ('confirmPassword' in fields && 'password' in fields) {
    if (fields.confirmPassword !== fields.password) {
      errors.confirmPassword = 'passwordMismatch'
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
