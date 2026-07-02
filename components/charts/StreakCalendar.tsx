'use client'

interface Props {
  streakDates: Map<string, boolean>
}

export function StreakCalendar({ streakDates }: Props) {
  const today = new Date().toISOString().split('T')[0]
  const entries = Array.from(streakDates.entries()).reverse()

  return (
    <div className="card-base" style={{ padding: '16px' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#9ca3af', letterSpacing: '2px', marginBottom: '12px' }}>
        WORKOUT CALENDAR
      </div>
      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px', marginBottom: '4px' }}>
        {['M','T','W','T','F','S','S'].map((d, i) => (
          <div key={i} style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '9px', color: '#6b7280' }}>{d}</div>
        ))}
      </div>
      {/* Calendar grid — 42 cells (6 weeks) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' }}>
        {entries.slice(0, 42).reverse().map(([date, done]) => {
          const isFuture = date > today
          const isToday = date === today
          return (
            <div
              key={date}
              title={`${date}: ${done ? 'Workout done ✅' : 'Rest day'}`}
              style={{
                width: '100%',
                paddingTop: '100%',
                position: 'relative',
                borderRadius: '6px',
                background: isFuture ? 'transparent' : done ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.04)',
                border: isToday ? '1.5px solid #6366f1' : '1px solid transparent',
              }}
            />
          )
        })}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
        <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.4)' }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#9ca3af' }}>Workout</span>
        <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'rgba(255,255,255,0.04)', marginLeft: '8px' }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#9ca3af' }}>Rest</span>
      </div>
    </div>
  )
}
