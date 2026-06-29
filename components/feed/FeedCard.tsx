'use client'

import { useState, useTransition } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { addReaction } from '@/app/actions/reactions'

const REACTIONS = [
  { emoji: '🔥', label: 'rxFire' },
  { emoji: '❤️', label: 'rxHeart' },
  { emoji: '💪', label: 'rxFlex' },
]

// Color pool — stable per-user-name initial
const USER_COLORS = ['#6366f1', '#ec4899', '#22c55e', '#f59e0b', '#3b82f6', '#a855f7']
function userColor(name: string | null) {
  const idx = (name?.charCodeAt(0) ?? 0) % USER_COLORS.length
  return USER_COLORS[idx]
}

interface Props {
  log: {
    id: string
    userId: string
    date: string
    workoutDone: boolean
    workoutNote: string | null
    moodEmoji: string
    createdAt: Date
    user: { id: string; name: string | null; image: string | null }
    reactions: Array<{ id: string; fromUserId: string; emoji: string }>
  }
  currentUserId: string
  challengeId: string
}

export function FeedCard({ log, currentUserId }: Props) {
  const [localReactions, setLocalReactions] = useState(log.reactions)
  const [isPending, startTransition] = useTransition()

  const myReaction = localReactions.find(r => r.fromUserId === currentUserId)
  const color = userColor(log.user.name)
  const initial = log.user.name?.charAt(0).toUpperCase() ?? '?'

  const relTime = (() => {
    try { return formatDistanceToNow(log.createdAt, { addSuffix: true }) } catch { return log.date }
  })()

  function handleReact(emoji: string) {
    startTransition(async () => {
      setLocalReactions(prev => {
        const filtered = prev.filter(r => r.fromUserId !== currentUserId)
        if (myReaction?.emoji === emoji) return filtered
        return [...filtered, { id: 'opt', fromUserId: currentUserId, emoji }]
      })
      await addReaction({ logId: log.id, emoji })
    })
  }

  return (
    <div className="card-base" style={{ padding: '14px', marginTop: '10px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {log.user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={log.user.image}
              alt={log.user.name ?? ''}
              style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${color}`, flexShrink: 0 }}
            />
          ) : (
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: color + '22', border: `2px solid ${color}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color,
              flexShrink: 0,
            }}>
              {initial}
            </div>
          )}
          <div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 600, color: '#fff' }}>
              {log.user.name ?? 'Someone'}
              {log.userId === currentUserId && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#444', marginLeft: '6px' }}>(you)</span>
              )}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#444' }}>{relTime}</div>
          </div>
        </div>
        <div style={{ fontSize: '22px' }}>{log.moodEmoji}</div>
      </div>

      {/* Badges */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
        {log.workoutDone && (
          <div style={{
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: '20px', padding: '3px 10px',
            fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#22c55e',
          }}>
            Workout Done ✓
          </div>
        )}
      </div>

      {/* Note */}
      {log.workoutNote && (
        <div style={{
          fontFamily: 'var(--font-sans)', fontSize: '13px', color: '#666',
          marginBottom: '10px', padding: '8px 10px',
          background: 'rgba(255,255,255,0.03)', borderRadius: '8px',
        }}>
          {log.workoutNote}
        </div>
      )}

      {/* Reactions */}
      <div style={{ display: 'flex', gap: '6px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        {REACTIONS.map(({ emoji }) => {
          const count = localReactions.filter(r => r.emoji === emoji).length
          const active = myReaction?.emoji === emoji
          return (
            <button
              key={emoji}
              onClick={() => handleReact(emoji)}
              disabled={isPending}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '5px 10px',
                background: active ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
                border: active ? '1px solid rgba(99,102,241,0.4)' : '1px solid transparent',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '13px',
                transition: 'all 0.15s',
              }}
            >
              {emoji}
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#555' }}>
                {count || ''}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
