'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FeedCard } from '@/components/feed/FeedCard'
import { MemberCard } from '@/components/feed/MemberCard'

interface MemberStat {
  userId: string
  name: string
  image: string | null
  totalLogs: number
  thisWeekCount: number
  loggedToday: boolean
  workedOutToday: boolean
  currentStreak: number
  latestWeight: number | null
}

interface FeedLog {
  id: string
  userId: string
  date: string
  workoutDone: boolean
  workoutNote: string | null
  moodEmoji: string
  weightKg: number | null
  createdAt: Date
  user: { id: string; name: string | null; image: string | null }
  reactions: Array<{ id: string; fromUserId: string; emoji: string }>
}

interface Props {
  currentUserId: string
  memberStats: MemberStat[]
  feedLogs: FeedLog[]
  challengeId: string
}

const TAB_STYLE = (active: boolean) => ({
  flex: 1,
  padding: '10px 4px',
  borderRadius: '10px',
  textAlign: 'center' as const,
  fontFamily: 'var(--font-mono)',
  fontSize: '11px',
  fontWeight: 600,
  letterSpacing: '1px',
  cursor: 'pointer',
  border: 'none',
  transition: 'all 0.2s',
  background: active ? '#6366f1' : 'transparent',
  color: active ? '#fff' : '#444',
})

export function GroupFeedClient({ currentUserId, memberStats, feedLogs, challengeId }: Props) {
  const [tab, setTab] = useState<'feed' | 'crew'>('feed')

  return (
    <div>
      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '4px', background: '#141414', borderRadius: '14px', padding: '4px', marginBottom: '14px' }}>
        <button style={TAB_STYLE(tab === 'feed')} onClick={() => setTab('feed')}>FEED</button>
        <button style={TAB_STYLE(tab === 'crew')} onClick={() => setTab('crew')}>CREW</button>
      </div>

      {/* FEED */}
      {tab === 'feed' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {feedLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#444', letterSpacing: '2px' }}>
              NO ACTIVITY THIS WEEK
            </div>
          ) : (
            feedLogs.map((log, i) => (
              <motion.div key={log.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <FeedCard log={log} currentUserId={currentUserId} challengeId={challengeId} />
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* CREW */}
      {tab === 'crew' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {memberStats.map((m, i) => (
            <motion.div key={m.userId} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <MemberCard
                userId={m.userId}
                name={m.name}
                image={m.image}
                isCurrentUser={m.userId === currentUserId}
                totalLogs={m.totalLogs}
                thisWeekCount={m.thisWeekCount}
                loggedToday={m.loggedToday}
                workedOutToday={m.workedOutToday}
                currentStreak={m.currentStreak}
                latestWeight={m.latestWeight}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
