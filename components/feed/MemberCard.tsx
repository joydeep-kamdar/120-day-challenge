import Link from 'next/link'

interface Props {
  userId: string
  name: string
  image: string | null
  isCurrentUser: boolean
  totalLogs: number
  thisWeekCount: number
  loggedToday: boolean
  workedOutToday: boolean
  currentStreak: number
  latestWeight: number | null
}

export function MemberCard({
  userId, name, image, isCurrentUser,
  totalLogs, thisWeekCount, loggedToday, workedOutToday, currentStreak, latestWeight,
}: Props) {
  const initial = name.charAt(0).toUpperCase()

  const inner = (
    <div
      style={{
        background: isCurrentUser ? 'rgba(99,102,241,0.06)' : '#141414',
        border: isCurrentUser ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.06)',
        borderRadius: '16px',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
      }}
    >
      {/* Avatar */}
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt={name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(99,102,241,0.4)', flexShrink: 0 }} />
      ) : (
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(99,102,241,0.15)', border: '2px solid rgba(99,102,241,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '20px', color: '#818cf8', flexShrink: 0 }}>
          {initial}
        </div>
      )}

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 600, color: '#fff' }}>
            {name.split(' ')[0]}
          </span>
          {isCurrentUser && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '1px', color: '#6366f1', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '6px', padding: '2px 6px' }}>
              YOU
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Today status */}
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: loggedToday ? (workedOutToday ? '#22c55e' : '#f59e0b') : '#3a3a3a', letterSpacing: '1px' }}>
            {loggedToday ? (workedOutToday ? '✅ today' : '📝 today') : '💤 today'}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#9ca3af' }}>·</span>
          {/* This week */}
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#9ca3af', letterSpacing: '1px' }}>
            {thisWeekCount}/7 this week
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#9ca3af' }}>·</span>
          {/* Total */}
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#9ca3af', letterSpacing: '1px' }}>
            {totalLogs} total
          </span>
        </div>
      </div>

      {/* Right side: streak + weight (or arrow for self) */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#f59e0b', fontWeight: 600 }}>
          🔥 {currentStreak}d
        </div>
        {latestWeight && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
            {latestWeight.toFixed(1)}kg
          </div>
        )}
        {isCurrentUser && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#6366f1', marginTop: '2px' }}>
            LOG →
          </div>
        )}
      </div>
    </div>
  )

  return isCurrentUser ? (
    <Link href="/log" style={{ textDecoration: 'none' }}>
      {inner}
    </Link>
  ) : (
    <div>{inner}</div>
  )
}
