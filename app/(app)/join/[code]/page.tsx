'use client'

import { useActionState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { joinChallenge } from '@/app/actions/join'

export default function JoinPage() {
  const params = useParams()
  const code = (params.code as string).toUpperCase()
  const [state, formAction, pending] = useActionState(joinChallenge, null)

  // Pre-fill the invite code into a hidden field
  return (
    <div style={{ paddingTop: '8px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔥</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', letterSpacing: '2px', color: '#fff', lineHeight: 1, marginBottom: '6px' }}>
          YOU&apos;RE INVITED
        </div>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '32px',
            letterSpacing: '2px',
            lineHeight: 1,
            background: 'linear-gradient(135deg,#6366f1,#ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '12px',
          }}
        >
          TO THE SQUAD
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#9ca3af', letterSpacing: '3px' }}>
          120 DAY CHALLENGE
        </div>
      </div>

      {/* Invite code badge */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
        <div style={{ background: 'rgba(99,102,241,.1)', border: '1px solid rgba(99,102,241,.3)', borderRadius: '12px', padding: '10px 20px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#9ca3af', letterSpacing: '2px', marginRight: '8px' }}>CODE</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '15px', color: '#6366f1', letterSpacing: '3px', fontWeight: 700 }}>{code}</span>
        </div>
      </div>

      {state?.error && (
        <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#ef4444', letterSpacing: '1px' }}>
          {state.error}
        </div>
      )}

      <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input type="hidden" name="inviteCode" value={code} />

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '3px', color: '#9ca3af', marginBottom: '4px' }}>
          YOUR STATS
        </div>

        <Field label="HEIGHT (CM)" name="heightCm" placeholder="175" />
        <Field label="CURRENT WEIGHT (KG)" name="startWeightKg" placeholder="85.0" />
        <Field label="GOAL WEIGHT (KG)" name="goalWeightKg" placeholder="75.0" />

        <button
          type="submit"
          disabled={pending}
          style={{
            marginTop: '8px',
            width: '100%',
            padding: '20px',
            background: pending ? 'rgba(99,102,241,0.4)' : 'linear-gradient(135deg,#6366f1,#ec4899)',
            borderRadius: '16px',
            border: 'none',
            cursor: pending ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-display)',
            fontSize: '24px',
            letterSpacing: '2px',
            color: '#fff',
            boxShadow: pending ? 'none' : '0 8px 30px rgba(99,102,241,0.35)',
            transition: 'all .2s',
          }}
        >
          {pending ? 'JOINING...' : 'JOIN THE SQUAD →'}
        </button>
      </form>
    </div>
  )
}

function Field({ label, name, placeholder }: { label: string; name: string; placeholder: string }) {
  return (
    <div style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '14px 16px' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#9ca3af', letterSpacing: '2px', marginBottom: '6px' }}>
        {label}
      </div>
      <input
        name={name}
        type="number"
        inputMode="decimal"
        step="0.1"
        placeholder={placeholder}
        required
        style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: '18px', fontWeight: 600, color: '#fff', fontFamily: 'var(--font-sans)' }}
      />
    </div>
  )
}
