import { FIELD_RULES, rangeHint, type FieldName } from '../lib/prescription'

interface PrescriptionFieldProps {
  id: string
  field: FieldName
  value: string
  error: string | null
  onChange: (value: string) => void
  onBlur: () => void
}

export function PrescriptionField({ id, field, value, error, onChange, onBlur }: PrescriptionFieldProps) {
  const rule = FIELD_RULES[field]
  const hintId = `${id}-hint`

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {rule.label}
        {rule.unit && <span className="ml-1 font-normal text-slate-400">({rule.unit})</span>}
      </label>
      <input
        id={id}
        name={id}
        type="text"
        inputMode={rule.kind === 'axis' ? 'numeric' : 'decimal'}
        autoComplete="off"
        placeholder={rule.kind === 'axis' ? 'e.g. 90' : 'e.g. -1.25'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-invalid={error ? true : undefined}
        aria-describedby={hintId}
        className={`rounded-lg border px-3 py-2 text-slate-900 outline-none transition focus:ring-2 ${
          error
            ? 'border-red-400 bg-red-50 focus:ring-red-200'
            : 'border-slate-300 bg-white focus:border-indigo-500 focus:ring-indigo-200'
        }`}
      />
      <p id={hintId} className={`text-xs ${error ? 'text-red-600' : 'text-slate-500'}`}>
        {error ?? rangeHint(field)}
      </p>
    </div>
  )
}
