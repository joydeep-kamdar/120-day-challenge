import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { createChallenge } from '@/app/actions/challenge'

export default async function NewChallengePage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const today = new Date().toISOString().split('T')[0]

  return (
    <div style={{ paddingTop: '8px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '36px', letterSpacing: '2px', lineHeight: 1, color: '#fff', marginBottom: '6px' }}>
          START YOUR
        </div>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '36px',
            letterSpacing: '2px',
            lineHeight: 1,
            background: 'linear-gradient(135deg,#6366f1,#ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '10px',
          }}
        >
          120 DAY CHALLENGE
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#444', letterSpacing: '3px' }}>
          SET UP YOUR SQUAD
        </div>
      </div>

      <form action={createChallenge} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* About you */}
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '3px', color: '#444', marginBottom: '4px', marginTop: '4px' }}>
          ABOUT YOU
        </div>

        <Field label="HEIGHT (CM)" name="heightCm" type="number" placeholder="175" inputMode="decimal" step="0.1" min="100" max="250" />
        <Field label="CURRENT WEIGHT (KG)" name="startWeightKg" type="number" placeholder="85.0" inputMode="decimal" step="0.1" min="30" max="300" />
        <Field label="GOAL WEIGHT (KG)" name="goalWeightKg" type="number" placeholder="75.0" inputMode="decimal" step="0.1" min="30" max="300" />

        {/* Challenge */}
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '3px', color: '#444', marginBottom: '4px', marginTop: '12px' }}>
          YOUR CHALLENGE
        </div>

        <Field label="CHALLENGE NAME" name="name" type="text" placeholder="120 Day Challenge" defaultValue="120 Day Challenge" />
        <Field label="START DATE" name="startDate" type="date" defaultValue={today} />

        {/* Submit */}
        <button
          type="submit"
          style={{
            marginTop: '8px',
            width: '100%',
            padding: '20px',
            background: 'linear-gradient(135deg,#6366f1,#ec4899)',
            borderRadius: '16px',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-display)',
            fontSize: '24px',
            letterSpacing: '2px',
            color: '#fff',
            boxShadow: '0 8px 30px rgba(99,102,241,0.35)',
          }}
        >
          CREATE CHALLENGE →
        </button>

        <p style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#333', letterSpacing: '2px', marginTop: '4px' }}>
          INVITE LINK GENERATED AUTOMATICALLY
        </p>
      </form>
    </div>
  )
}

function Field({
  label,
  name,
  type,
  placeholder,
  inputMode,
  step,
  min,
  max,
  defaultValue,
}: {
  label: string
  name: string
  type: string
  placeholder?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  step?: string
  min?: string
  max?: string
  defaultValue?: string
}) {
  return (
    <div
      style={{
        background: '#141414',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '14px',
        padding: '14px 16px',
      }}
    >
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#444', letterSpacing: '2px', marginBottom: '6px' }}>
        {label}
      </div>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        inputMode={inputMode}
        step={step}
        min={min}
        max={max}
        required
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          fontSize: '18px',
          fontWeight: 600,
          color: '#fff',
          fontFamily: 'var(--font-sans)',
          colorScheme: 'dark',
        }}
      />
    </div>
  )
}
