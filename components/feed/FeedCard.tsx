'use client'

import { useState, useTransition } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { addReaction } from '@/app/actions/reactions'
import { addComment } from '@/app/actions/comments'

const REACTIONS = [
  { emoji: '🔥', label: 'Fire' },
  { emoji: '❤️', label: 'Heart' },
  { emoji: '💪', label: 'Flex' },
]

const USER_COLORS = ['#6366f1', '#ec4899', '#22c55e', '#f59e0b', '#3b82f6', '#a855f7']
function userColor(name: string | null) {
  const idx = (name?.charCodeAt(0) ?? 0) % USER_COLORS.length
  return USER_COLORS[idx]
}

interface Comment {
  id: string
  userId: string
  text: string
  createdAt: Date
  user: { name: string | null; image: string | null }
}

interface Props {
  log: {
    id: string
    userId: string
    date: string
    workoutDone: boolean
    workoutNote: string | null
    moodEmoji: string
    weightKg: number | null
    waistExtendedCm: number | null
    waistSuckedinCm: number | null
    createdAt: Date
    user: { id: string; name: string | null; image: string | null }
    reactions: Array<{ id: string; fromUserId: string; emoji: string }>
    comments: Comment[]
  }
  currentUserId: string
  challengeId: string
}

export function FeedCard({ log, currentUserId }: Props) {
  const [localReactions, setLocalReactions] = useState(log.reactions)
  const [localComments, setLocalComments] = useState<Comment[]>(log.comments)
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [isPending, startTransition] = useTransition()
  const [isCommenting, startCommentTransition] = useTransition()

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

  function handleComment(e: React.FormEvent) {
    e.preventDefault()
    if (!commentText.trim()) return
    const text = commentText.trim()
    setCommentText('')
    startCommentTransition(async () => {
      const optimistic: Comment = {
        id: `opt-${Date.now()}`,
        userId: currentUserId,
        text,
        createdAt: new Date(),
        user: { name: 'You', image: null },
      }
      setLocalComments(prev => [...prev, optimistic])
      await addComment({ logId: log.id, text })
    })
  }

  const totalComments = localComments.length

  return (
    <div style={{ background: '#141414', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '16px 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {log.user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={log.user.image}
              alt={log.user.name ?? ''}
              style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: `2.5px solid ${color}`, flexShrink: 0 }}
            />
          ) : (
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%',
              background: color + '22', border: `2.5px solid ${color}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontSize: '18px', color,
              flexShrink: 0,
            }}>
              {initial}
            </div>
          )}
          <div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: '17px', fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
              {log.user.name ?? 'Someone'}
              {log.userId === currentUserId && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#9ca3af', marginLeft: '7px', fontWeight: 400 }}>(you)</span>
              )}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{relTime}</div>
          </div>
        </div>
        <div style={{ fontSize: '28px' }}>{log.moodEmoji}</div>
      </div>

      {/* Status badges */}
      <div style={{ padding: '0 16px 12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {log.workoutDone && (
          <div style={{
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)',
            borderRadius: '20px', padding: '5px 12px',
            fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#22c55e', letterSpacing: '0.5px',
          }}>
            💪 Workout Done
          </div>
        )}
        {!log.workoutDone && (
          <div style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '20px', padding: '5px 12px',
            fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#4b5563', letterSpacing: '0.5px',
          }}>
            📝 Rest day
          </div>
        )}
      </div>

      {/* Workout note */}
      {log.workoutNote && (
        <div style={{ margin: '0 16px 12px', fontFamily: 'var(--font-sans)', fontSize: '15px', color: '#d1d5db', lineHeight: 1.5, padding: '10px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px' }}>
          &ldquo;{log.workoutNote}&rdquo;
        </div>
      )}

      {/* Measurements */}
      {(log.weightKg || log.waistExtendedCm || log.waistSuckedinCm) && (
        <div style={{ margin: '0 16px 12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {log.weightKg && (
            <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px', padding: '8px 14px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: '#818cf8', lineHeight: 1 }}>
                {log.weightKg.toFixed(1)}<span style={{ fontSize: '14px', color: '#6366f1', marginLeft: '3px' }}>kg</span>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#6366f1', letterSpacing: '1px', marginTop: '3px' }}>WEIGHT</div>
            </div>
          )}
          {log.waistExtendedCm && (
            <div style={{ background: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.2)', borderRadius: '12px', padding: '8px 14px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: '#f472b6', lineHeight: 1 }}>
                {log.waistExtendedCm.toFixed(1)}<span style={{ fontSize: '14px', color: '#ec4899', marginLeft: '3px' }}>cm</span>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#ec4899', letterSpacing: '1px', marginTop: '3px' }}>WAIST OUT</div>
            </div>
          )}
          {log.waistSuckedinCm && (
            <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '12px', padding: '8px 14px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: '#a5b4fc', lineHeight: 1 }}>
                {log.waistSuckedinCm.toFixed(1)}<span style={{ fontSize: '14px', color: '#818cf8', marginLeft: '3px' }}>cm</span>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#818cf8', letterSpacing: '1px', marginTop: '3px' }}>WAIST IN</div>
            </div>
          )}
        </div>
      )}

      {/* Reactions + Comment button */}
      <div style={{ padding: '10px 16px 12px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        {REACTIONS.map(({ emoji }) => {
          const count = localReactions.filter(r => r.emoji === emoji).length
          const active = myReaction?.emoji === emoji
          return (
            <button
              key={emoji}
              onClick={() => handleReact(emoji)}
              disabled={isPending}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '7px 12px',
                background: active ? 'rgba(99,102,241,0.18)' : 'rgba(255,255,255,0.05)',
                border: active ? '1px solid rgba(99,102,241,0.45)' : '1px solid rgba(255,255,255,0.07)',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '16px',
                transition: 'all 0.15s',
              }}
            >
              {emoji}
              {count > 0 && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: active ? '#818cf8' : '#9ca3af' }}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
        <button
          onClick={() => setShowComments(v => !v)}
          style={{
            marginLeft: 'auto',
            display: 'flex', alignItems: 'center', gap: '5px',
            padding: '7px 12px',
            background: showComments ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.04)',
            border: showComments ? '1px solid rgba(99,102,241,0.35)' : '1px solid rgba(255,255,255,0.07)',
            borderRadius: '20px',
            cursor: 'pointer',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: showComments ? '#818cf8' : '#9ca3af',
            letterSpacing: '0.5px',
            transition: 'all 0.15s',
          }}
        >
          💬 {totalComments > 0 ? totalComments : 'Comment'}
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          {localComments.length > 0 && (
            <div style={{ padding: '12px 16px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {localComments.map((c) => (
                <div key={c.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
                    background: userColor(c.user.name) + '22',
                    border: `2px solid ${userColor(c.user.name)}55`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-display)', fontSize: '13px', color: userColor(c.user.name),
                  }}>
                    {c.user.name?.charAt(0).toUpperCase() ?? '?'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 600, color: '#d1d5db' }}>
                      {c.userId === currentUserId ? 'You' : (c.user.name?.split(' ')[0] ?? 'Member')}
                    </span>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: '#e5e7eb', marginLeft: '8px' }}>{c.text}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Comment input */}
          <form onSubmit={handleComment} style={{ padding: '12px 16px 14px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="text"
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              maxLength={500}
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '20px',
                padding: '9px 16px',
                fontSize: '15px',
                color: '#fff',
                fontFamily: 'var(--font-sans)',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={isCommenting || !commentText.trim()}
              style={{
                background: commentText.trim() ? 'linear-gradient(135deg,#6366f1,#ec4899)' : 'rgba(255,255,255,0.06)',
                border: 'none',
                borderRadius: '20px',
                padding: '9px 18px',
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                fontWeight: 600,
                color: commentText.trim() ? '#fff' : '#555',
                cursor: commentText.trim() ? 'pointer' : 'not-allowed',
                letterSpacing: '0.5px',
                transition: 'all 0.15s',
                flexShrink: 0,
              }}
            >
              POST
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
