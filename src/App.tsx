import { useState, type SubmitEvent } from 'react'
import { PrescriptionField } from './components/PrescriptionField'
import {
  FIELDS,
  normalizeField,
  toNumbers,
  validateField,
  type Eye,
  type FieldName,
  type PrescriptionForm,
} from './lib/prescription'

const EMPTY_EYE = { sph: '', cyl: '', axis: '' }
const EMPTY_FORM: PrescriptionForm = { left: { ...EMPTY_EYE }, right: { ...EMPTY_EYE } }

const EYES: { eye: Eye; title: string; code: string }[] = [
  { eye: 'left', title: 'Left Eye', code: 'OS' },
  { eye: 'right', title: 'Right Eye', code: 'OD' },
]

type Touched = Record<Eye, Record<FieldName, boolean>>
const UNTOUCHED: Touched = {
  left: { sph: false, cyl: false, axis: false },
  right: { sph: false, cyl: false, axis: false },
}

function App() {
  const [values, setValues] = useState<PrescriptionForm>(EMPTY_FORM)
  const [touched, setTouched] = useState<Touched>(UNTOUCHED)

  const isComplete = EYES.every(({ eye }) =>
    FIELDS.every((field) => values[eye][field].trim() !== '' && validateField(field, values[eye][field]) === null),
  )

  const setValue = (eye: Eye, field: FieldName, value: string) =>
    setValues((prev) => ({ ...prev, [eye]: { ...prev[eye], [field]: value } }))

  const handleBlur = (eye: Eye, field: FieldName) => {
    setValue(eye, field, normalizeField(field, values[eye][field]))
    setTouched((prev) => ({ ...prev, [eye]: { ...prev[eye], [field]: true } }))
  }

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isComplete) return
    console.log('Prescription submitted:', {
      leftEye: toNumbers(values.left),
      rightEye: toNumbers(values.right),
    })
  }

  return (
    <main className="relative min-h-screen bg-[url('/bg-image.webp')] bg-cover bg-fixed bg-center px-4 py-10">
      <div aria-hidden className="absolute inset-0 bg-slate-100/75 backdrop-blur-[2px]" />
      <div className="relative mx-auto max-w-4xl">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-900">Eye Prescription</h1>
          <p className="mt-1 text-sm text-slate-600">
            Enter the customer's spectacle prescription for each eye.
          </p>
        </header>

        <form onSubmit={handleSubmit} noValidate className="rounded-2xl bg-white/95 p-6 shadow-lg ring-1 ring-slate-200">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:divide-x md:divide-slate-200">
            {EYES.map(({ eye, title, code }, i) => (
              <fieldset key={eye} className={`flex flex-col gap-4 ${i > 0 ? 'md:pl-8' : 'md:pr-8'}`}>
                <legend className="mb-4 text-lg font-semibold text-slate-800">
                  {title} <span className="text-sm font-normal text-slate-500">({code})</span>
                </legend>
                {FIELDS.map((field) => (
                  <PrescriptionField
                    key={field}
                    id={`${eye}-${field}`}
                    field={field}
                    value={values[eye][field]}
                    error={touched[eye][field] ? validateField(field, values[eye][field]) : null}
                    onChange={(value) => setValue(eye, field, value)}
                    onBlur={() => handleBlur(eye, field)}
                  />
                ))}
              </fieldset>
            ))}
          </div>

          <div className="mt-8 flex justify-end border-t border-slate-200 pt-6">
            <button
              type="submit"
              disabled={!isComplete}
              className="rounded-lg bg-indigo-600 px-6 py-2.5 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}

export default App
