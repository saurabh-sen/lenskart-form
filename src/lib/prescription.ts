export type FieldName = 'sph' | 'cyl' | 'axis'
export type Eye = 'left' | 'right'

export type EyeValues = Record<FieldName, string>
export type PrescriptionForm = Record<Eye, EyeValues>

interface FieldRule {
  label: string
  min: number
  max: number
  step: number
  unit?: string
  /** Lens powers are written with a sign and two decimals (e.g. +1.25); axis is a whole number. */
  kind: 'power' | 'axis'
}

/**
 * Clinically plausible limits for a human spectacle prescription.
 * Adjust these to match the lens ranges your lab can actually supply.
 */
export const FIELD_RULES: Record<FieldName, FieldRule> = {
  sph: { label: 'SPH', min: -20, max: 20, step: 0.25, unit: 'D', kind: 'power' },
  cyl: { label: 'CYL', min: -6, max: 6, step: 0.25, unit: 'D', kind: 'power' },
  axis: { label: 'Axis', min: 1, max: 180, step: 1, unit: '°', kind: 'axis' },
}

export const FIELDS: FieldName[] = ['sph', 'cyl', 'axis']

const POWER_PATTERN = /^[+-]?(\d{1,3}(\.\d{0,2})?|\.\d{1,2})$/
const AXIS_PATTERN = /^\d{1,3}$/

export function formatPower(value: number): string {
  if (value === 0) return '0.00'
  return `${value > 0 ? '+' : '-'}${Math.abs(value).toFixed(2)}`
}

export function rangeHint(field: FieldName): string {
  const rule = FIELD_RULES[field]
  if (rule.kind === 'axis') return `${rule.min}–${rule.max}${rule.unit}, whole numbers`
  return `${formatPower(rule.min)} to ${formatPower(rule.max)} ${rule.unit}, steps of ${rule.step.toFixed(2)}`
}

/** Returns an error message, or null when the value is valid. */
export function validateField(field: FieldName, raw: string): string | null {
  const rule = FIELD_RULES[field]
  const value = raw.trim()

  if (value === '') return `${rule.label} is required`

  if (rule.kind === 'axis') {
    if (!AXIS_PATTERN.test(value)) return 'Axis must be a whole number'
    const axis = Number(value)
    if (axis < rule.min || axis > rule.max) return `Axis must be between ${rule.min} and ${rule.max}`
    return null
  }

  if (!POWER_PATTERN.test(value)) return `Enter a number like -1.25 or +2.00`
  const power = Number(value)
  if (power < rule.min || power > rule.max) {
    return `${rule.label} must be between ${formatPower(rule.min)} and ${formatPower(rule.max)}`
  }
  // Compare in quarter-dioptre units to avoid floating point modulo errors.
  const steps = power / rule.step
  if (Math.abs(steps - Math.round(steps)) > 1e-9) {
    return `${rule.label} must be in ${rule.step.toFixed(2)} steps (e.g. -1.25, -1.50)`
  }
  return null
}

/** Rewrites a valid value into standard optician notation, e.g. "1.5" -> "+1.50". */
export function normalizeField(field: FieldName, raw: string): string {
  const value = raw.trim()
  if (validateField(field, value) !== null) return value
  return FIELD_RULES[field].kind === 'axis' ? String(Number(value)) : formatPower(Number(value))
}

export function toNumbers(eye: EyeValues): Record<FieldName, number> {
  return { sph: Number(eye.sph), cyl: Number(eye.cyl), axis: Number(eye.axis) }
}
