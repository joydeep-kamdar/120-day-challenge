'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function JoinLandingPage() {
  const [code, setCode] = useState('')
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = code.trim().toUpperCase()
    if (trimmed) router.push(`/join/${trimmed}`)
  }

  return (
    <div style={{ paddingTop: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '48px 0 0' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔗</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', letterSpacing: '2px', color: '#fff', lineHeight: 1, marginBottom: '6px' }}>
        JOIN A CHALLENGE
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#9ca3af', letterSpacing: '2px', marginBottom: '32px' }}>
        ENTER YOUR INVITE CODE BELOW
      </div>

      <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          placeholder="e.g. ABC123"
          maxLength={8}
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          style={{
            width: '100%',
            padding: '20px',
            background: '#141414',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            fontSize: '28px',
            fontFamily: 'var(--font-display)',
            letterSpacing: '6px',
            color: '#fff',
            textAlign: 'center',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={code.trim().length < 4}
          style={{
            width: '100%',
            padding: '16px',
            background: code.trim().length >= 4
              ? 'linear-gradient(135deg,#6366f1,#ec4899)'
              : 'rgba(255,255,255,0.06)',
            borderRadius: '14px',
            border: 'none',
            cursor: code.trim().length >= 4 ? 'pointer' : 'not-allowed',
            fontFamily: 'var(--font-display)',
            fontSize: '22px',
            letterSpacing: '2px',
            color: '#fff',
            transition: 'all 0.2s',
          }}
        >
          LET&apos;S GO 🔥
        </button>
      </form>
    </div>
  )
}
