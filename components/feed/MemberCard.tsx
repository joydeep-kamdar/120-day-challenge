import Link from 'next/link'

const USER_COLORS = ['#6366f1', '#ec4899', '#22c55e', '#f59e0b', '#3b82f6', '#a855f7']
function userColor(name: string) {
  return USER_COLORS[name.charCodeAt(0) % USER_COLORS.length]
}

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
  const color = userColor(name)
  const todayStatus = loggedToday
    ? (workedOutToday ? { icon: '✅', label: 'Worked out today', color: '#22c55e' } : { icon: '📝', label: 'Logged today', color: '#f59e0b' })
    : { icon: '💤', label: 'Not yet today', color: '#3a3a3a' }

  const inner = (
    <div
      style={{
        background: isCurrentUser ? 'rgba(99,102,241,0.07)' : '#141414',
        border: isCurrentUser ? '1.5px solid rgba(99,102,241,0.35)' : '1px solid rgba(255,255,255,0.07)',
        borderRadius: '18px',
        padding: '16px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
      }}
    >
      {/* Avatar */}
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt={name} style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: `2.5px solid ${color}55`, flexShrink: 0 }} />
      ) : (
        <div style={{
          width: '52px', height: '52px', borderRadius: '50%',
          background: color + '18',
          border: `2.5px solid ${color}55`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontSize: '22px', color,
          flexShrink: 0,
        }}>
          {initial}
        </div>
      )}

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '17px', fontWeight: 700, color: '#fff' }}>
            {name.split(' ')[0]}
          </span>
          {isCurrentUser && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '1px', color: '#6366f1', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '6px', padding: '2px 7px' }}>
              YOU
            </span>
          )}
        </div>

        {/* Today status badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
          <span style={{ fontSize: '13px' }}>{todayStatus.icon}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: todayStatus.color, letterSpacing: '0.5px' }}>
            {todayStatus.label}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#6b7280' }}>
            {thisWeekCount}/7 this week
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#4b5563' }}>·</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#6b7280' }}>
            {totalLogs} total
          </span>
        </div>
      </div>

      {/* Right: streak + weight */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: '#f59e0b', lineHeight: 1 }}>
          🔥 {currentStreak}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#f59e0b', marginTop: '1px', letterSpacing: '0.5px' }}>
          day streak
        </div>
        {latestWeight && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#9ca3af', marginTop: '5px' }}>
            {latestWeight.toFixed(1)}<span style={{ fontSize: '11px', color: '#6b7280' }}>kg</span>
          </div>
        )}
        {isCurrentUser && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#6366f1', marginTop: '4px', letterSpacing: '1px' }}>
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
