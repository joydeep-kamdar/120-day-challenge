import { auth } from '@/lib/auth'
import Link from 'next/link'
import { getActiveMembership } from '@/lib/active-challenge'

export async function TopBar() {
  const session = await auth()

  let challengeName = '120 DAY CHALLENGE'
  let dayNum = 1
  let durationDays = 120

  if (session?.user?.id) {
    const { membership } = await getActiveMembership(session.user.id)
    if (membership?.challenge?.startDate) {
      const c = membership.challenge
      challengeName = c.name.toUpperCase()
      durationDays = c.durationDays
      const diff = Math.floor((Date.now() - new Date(c.startDate).getTime()) / 86400000)
      dayNum = Math.min(durationDays, Math.max(1, diff + 1))
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
      <Link href="/dashboard" style={{ textDecoration: 'none', minWidth: 0, flex: 1, marginRight: '12px' }}>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '22px',
            letterSpacing: '2px',
            background: 'linear-gradient(135deg,#6366f1,#ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {challengeName}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            color: '#9ca3af',
            letterSpacing: '2px',
          }}
        >
          DAY {dayNum} OF {durationDays}
        </div>
      </Link>

      <Link href={`/profile/${session?.user?.id ?? ''}`} style={{ flexShrink: 0 }}>
        {session?.user?.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={session.user.image}
            alt={session.user.name ?? 'Profile'}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid rgba(99,102,241,0.45)',
            }}
          />
        ) : (
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'rgba(99,102,241,0.15)',
              border: '2px solid rgba(99,102,241,0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-display)',
              fontSize: '18px',
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
