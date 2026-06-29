'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Flame, Mail, ArrowRight, CheckCircle } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

export default function LoginPage() {
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
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-orange glow-orange mb-4">
            <Flame className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            <span className="text-gradient-orange">120 Day</span>
            <br />Challenge
          </h1>
        </div>
        <div className="rounded-2xl border border-brand-lime/30 bg-card p-6 text-center space-y-3">
          <CheckCircle className="w-10 h-10 mx-auto" style={{ color: 'oklch(0.86 0.27 135)' }} />
          <h2 className="font-semibold text-lg">Check your inbox!</h2>
          <p className="text-muted-foreground text-sm">
            We sent a magic link to <strong className="text-foreground">{email || 'your email'}</strong>.
            Click it and you&apos;re in.
          </p>
          <button
            onClick={() => setSent(false)}
            className="text-xs text-muted-foreground underline underline-offset-2 mt-2"
          >
            Use a different email
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-orange glow-orange mb-4">
          <Flame className="w-8 h-8 text-white" />
        </div>
        <h1
          className="text-3xl font-bold tracking-tight"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          <span className="text-gradient-orange">120 Day</span>
          <br />
          Challenge
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Your crew. Your goals. Let&apos;s get it. 💪
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-secondary border-border h-12 rounded-xl"
                required
                autoComplete="email"
                inputMode="email"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full h-12 text-white font-semibold rounded-xl border-0 text-base hover:opacity-90 transition-opacity gradient-orange glow-orange"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                Sending link...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Get magic link
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          No password needed — we&apos;ll email you a secure one-click link.
        </p>
      </form>
    </div>
  )
}
