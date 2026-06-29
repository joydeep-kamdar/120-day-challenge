import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { challengeMembers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import Link from 'next/link'

export async function TopBar() {
  const session = await auth()

  let dayNum = 1
  if (session?.user?.id) {
    const membership = await db.query.challengeMembers.findFirst({
      where: eq(challengeMembers.userId, session.user.id),
      with: { challenge: true },
    })
    if (membership?.challenge?.startDate) {
      const start = new Date(membership.challenge.startDate)
      const diff = Math.floor((Date.now() - start.getTime()) / 86400000)
      dayNum = Math.min(120, Math.max(1, diff + 1))
    }
  }

  const initial = session?.user?.name?.charAt(0).toUpperCase() ?? '?'

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px 10px',
        background: 'rgba(10,10,10,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        maxWidth: '430px',
        margin: '0 auto',
      }}
    >
      <Link href="/dashboard" style={{ textDecoration: 'none' }}>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '19px',
            letterSpacing: '2px',
            background: 'linear-gradient(135deg,#6366f1,#ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          120 DAY CHALLENGE
        </div>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            color: '#3a3a3a',
            letterSpacing: '2px',
          }}
        >
          DAY {dayNum} OF 120
        </div>
      </Link>

      <Link href={`/profile/${session?.user?.id ?? ''}`}>
        {session?.user?.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={session.user.image}
            alt={session.user.name ?? 'Profile'}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid rgba(99,102,241,0.4)',
            }}
          />
        ) : (
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'rgba(99,102,241,0.15)',
              border: '2px solid rgba(99,102,241,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-display)',
              fontSize: '16px',
              fontWeight: '700',
              color: '#818cf8',
            }}
          >
            {initial}
          </div>
        )}
      </Link>
    </header>
  )
}
