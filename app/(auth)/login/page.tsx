'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'

function LoginForm() {
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard'

  async function handleGoogleSignIn() {
    setLoading(true)
    await signIn('google', { callbackUrl })
  }

  return (
    <div style={{ padding: '52px 24px 28px', textAlign: 'center' }}>
      <div
        style={{
          background: 'radial-gradient(ellipse at 50% 0%,rgba(99,102,241,.18) 0%,transparent 65%)',
          paddingBottom: '32px',
          marginBottom: '32px',
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

      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        style={{
          width: '100%',
          padding: '18px 24px',
          background: loading ? 'rgba(255,255,255,0.04)' : '#fff',
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          cursor: loading ? 'not-allowed' : 'pointer',
          border: 'none',
          transition: 'all 0.2s',
          opacity: loading ? 0.6 : 1,
        }}
      >
        {!loading && (
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            <path fill="none" d="M0 0h48v48H0z"/>
          </svg>
        )}
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '16px',
            fontWeight: 600,
            color: loading ? '#888' : '#1a1a1a',
          }}
        >
          {loading ? 'Signing in...' : 'Continue with Google'}
        </span>
      </button>

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#2a2a2a', letterSpacing: '2px', marginTop: '24px' }}>
        SQUAD MEMBERS ONLY
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
