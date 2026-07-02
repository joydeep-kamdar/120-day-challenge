'use client'

import { useActionState, useState } from 'react'
import { updateProfile } from '@/app/actions/profile'
import { signOut } from 'next-auth/react'

interface Props {
  user: { id: string; name: string; email: string; image: string | null }
  profile: { heightCm: number; startWeightKg: number; goalWeightKg: number } | null
  challenge: { name: string; inviteCode: string; startDate: string } | null
  dayNum: number
}

export function ProfileClient({ user, profile, challenge, dayNum }: Props) {
  const [state, formAction, pending] = useActionState(updateProfile, null)
  const [copied, setCopied] = useState(false)

  const inviteUrl = challenge
    ? `${window?.location?.origin ?? ''}/join/${challenge.inviteCode}`
    : null

  async function copyInvite() {
    if (!inviteUrl) return
    await navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ paddingTop: '8px', paddingBottom: '16px' }}>

      {/* Avatar + name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image}
            alt={user.name}
            style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(99,102,241,0.5)' }}
          />
        ) : (
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(99,102,241,0.15)', border: '2px solid rgba(99,102,241,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '28px', color: '#818cf8' }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', letterSpacing: '1px', color: '#fff', lineHeight: 1 }}>
            {user.name.toUpperCase()}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#444', letterSpacing: '1px', marginTop: '4px' }}>
            {user.email}
          </div>
          {challenge && (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#6366f1', letterSpacing: '1px', marginTop: '4px' }}>
              DAY {dayNum} OF 120
            </div>
          )}
        </div>
      </div>

      {/* Challenge invite */}
      {challenge && (
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '3px', color: '#444', marginBottom: '8px' }}>
            INVITE YOUR SQUAD
          </div>
          <button
            onClick={copyInvite}
            style={{
              width: '100%',
              padding: '16px',
              background: '#141414',
              border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              gap: '12px',
            }}
          >
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#6366f1', letterSpacing: '1px', textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              /join/{challenge.inviteCode}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: copied ? '#22c55e' : '#555', letterSpacing: '1px', flexShrink: 0 }}>
              {copied ? 'COPIED ✓' : 'COPY'}
            </div>
          </button>
        </div>
      )}

      {/* Stats form */}
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '3px', color: '#444', marginBottom: '12px' }}>
        YOUR STATS
      </div>

      {state?.success && (
        <div style={{ background: 'rgba(34,197,94,.1)', border: '1px solid rgba(34,197,94,.3)', borderRadius: '12px', padding: '12px 16px', marginBottom: '12px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#22c55e', letterSpacing: '1px' }}>
          SAVED ✓
        </div>
      )}
      {state?.error && (
        <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: '12px', padding: '12px 16px', marginBottom: '12px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#ef4444', letterSpacing: '1px' }}>
          {state.error}
        </div>
      )}

      <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <Field label="HEIGHT (CM)" name="heightCm" defaultValue={profile?.heightCm?.toString() ?? ''} placeholder="175" />
        <Field label="START WEIGHT (KG)" name="startWeightKg" defaultValue={profile?.startWeightKg?.toString() ?? ''} placeholder="85.0" />
        <Field label="GOAL WEIGHT (KG)" name="goalWeightKg" defaultValue={profile?.goalWeightKg?.toString() ?? ''} placeholder="75.0" />

        <button
          type="submit"
          disabled={pending}
          style={{
            marginTop: '4px',
            width: '100%',
            padding: '16px',
            background: pending ? 'rgba(99,102,241,0.4)' : 'linear-gradient(135deg,#6366f1,#ec4899)',
            borderRadius: '14px',
            border: 'none',
            cursor: pending ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-display)',
            fontSize: '20px',
            letterSpacing: '2px',
            color: '#fff',
            transition: 'all .2s',
          }}
        >
          {pending ? 'SAVING...' : 'SAVE CHANGES'}
        </button>
      </form>

      {/* Sign out */}
      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        style={{
          marginTop: '32px',
          width: '100%',
          padding: '14px',
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '14px',
          cursor: 'pointer',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          letterSpacing: '2px',
          color: '#444',
        }}
      >
        SIGN OUT
      </button>
    </div>
  )
}

function Field({ label, name, defaultValue, placeholder }: { label: string; name: string; defaultValue: string; placeholder: string }) {
  return (
    <div style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '14px 16px' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#444', letterSpacing: '2px', marginBottom: '6px' }}>
        {label}
      </div>
      <input
        name={name}
        type="number"
        inputMode="decimal"
        step="0.1"
        defaultValue={defaultValue}
        placeholder={placeholder}
        required
        style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: '18px', fontWeight: 600, color: '#fff', fontFamily: 'var(--font-sans)' }}
      />
    </div>
  )
}
