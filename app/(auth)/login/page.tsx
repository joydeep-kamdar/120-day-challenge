'use client'

import { Suspense, useState } from 'react'
import { signIn } from 'next-auth/react'
import { toast } from 'sonner'
import { useSearchParams } from 'next/navigation'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const searchParams = useSearchParams()
  const isVerify = searchParams.get('verify') === 'true'

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)

    const result = await signIn('resend', {
      email: email.trim().toLowerCase(),
      redirect: false,
      callbackUrl: '/dashboard',
    })

    setLoading(false)

    if (result?.error) {
      toast.error('Something went wrong. Try again.')
      return
    }

    setSent(true)
  }

  if (isVerify || sent) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px' }}>
        <div style={{ fontSize: '52px', marginBottom: '16px' }}>📬</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', letterSpacing: '2px', color: '#fff', marginBottom: '8px' }}>
          CHECK YOUR INBOX
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#3a3a3a', letterSpacing: '3px', marginBottom: '24px' }}>
          MAGIC LINK SENT
        </div>
        <div
          style={{
            background: '#141414',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '20px',
          }}
        >
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: '#9ca3af', lineHeight: 1.6 }}>
            We sent a magic link to{' '}
            <strong style={{ color: '#fff' }}>{email || 'your email'}</strong>.
            <br />Click it and you&apos;re in. No password needed.
          </div>
        </div>
        <button
          onClick={() => setSent(false)}
          style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#444', letterSpacing: '1px', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          USE A DIFFERENT EMAIL
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: '52px 24px 28px', textAlign: 'center' }}>
      <div
        style={{
          background: 'radial-gradient(ellipse at 50% 0%,rgba(99,102,241,.18) 0%,transparent 65%)',
          paddingBottom: '32px',
          marginBottom: '16px',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '52px',
            lineHeight: 1,
            letterSpacing: '3px',
            background: 'linear-gradient(135deg,#6366f1,#ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          120 DAY
        </div>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '52px',
            lineHeight: 1,
            letterSpacing: '3px',
            color: '#fff',
            marginBottom: '10px',
          }}
        >
          CHALLENGE
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#3a3a3a', letterSpacing: '4px' }}>
          THE SQUAD AWAITS
        </div>
      </div>

      <form onSubmit={handleLogin}>
        <div
          style={{
            background: '#141414',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.06)',
            padding: '14px 16px',
            marginBottom: '12px',
            textAlign: 'left',
          }}
        >
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#444', letterSpacing: '2px', marginBottom: '6px' }}>
            YOUR EMAIL
          </div>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              fontSize: '17px',
              fontWeight: 600,
              color: '#fff',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontFamily: 'var(--font-sans)',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !email.trim()}
          style={{
            width: '100%',
            padding: '18px',
            background: loading || !email.trim()
              ? 'rgba(99,102,241,0.3)'
              : 'linear-gradient(135deg,#6366f1,#ec4899)',
            borderRadius: '14px',
            textAlign: 'center',
            cursor: loading || !email.trim() ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-display)',
            fontSize: '22px',
            letterSpacing: '2px',
            color: '#fff',
            boxShadow: loading || !email.trim() ? 'none' : '0 8px 30px rgba(99,102,241,0.35)',
            border: 'none',
            transition: 'all 0.2s',
          }}
        >
          {loading ? 'SENDING LINK...' : 'GET MAGIC LINK →'}
        </button>
      </form>

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#2a2a2a', letterSpacing: '2px', marginTop: '20px' }}>
        NO PASSWORD NEEDED
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', letterSpacing: '2px', color: '#444' }}>
          LOADING...
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
