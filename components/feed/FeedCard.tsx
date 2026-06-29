'use client'

import { useState, useTransition } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { addReaction } from '@/app/actions/reactions'

const QUICK_REACTIONS = ['🔥', '💪', '👊', '🎯', '⚡']

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

export function FeedCard({ log, currentUserId, challengeId }: Props) {
  const [localReactions, setLocalReactions] = useState(log.reactions)
  const [isPending, startTransition] = useTransition()

  const reactionCounts = QUICK_REACTIONS.reduce<Record<string, number>>((acc, emoji) => {
    acc[emoji] = localReactions.filter(r => r.emoji === emoji).length
    return acc
  }, {})

  const myReaction = localReactions.find(r => r.fromUserId === currentUserId)

  function handleReact(emoji: string) {
    startTransition(async () => {
      const optimistic = { id: 'temp', fromUserId: currentUserId, emoji }
      setLocalReactions(prev => {
        const filtered = prev.filter(r => r.fromUserId !== currentUserId)
        if (myReaction?.emoji === emoji) return filtered
        return [...filtered, optimistic]
      })

      await addReaction({ logId: log.id, emoji })
    })
  }

  return (
    <div className="rounded-2xl bg-card border border-border p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Avatar user={log.user} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">
            {log.user.name ?? 'Someone'}
            {log.userId === currentUserId && (
              <span className="ml-1 text-xs text-muted-foreground">(you)</span>
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(log.createdAt, { addSuffix: true })}
          </p>
        </div>
        <span className="text-2xl">{log.moodEmoji}</span>
      </div>

      {/* Content */}
      <div className={cn(
        'rounded-xl p-3 text-sm',
        log.workoutDone ? 'bg-brand-lime/10 border border-brand-lime/20' : 'bg-secondary'
      )}>
        {log.workoutDone ? (
          <div className="space-y-1">
            <p className="font-semibold text-brand-lime">✅ Workout done!</p>
            {log.workoutNote && (
              <p className="text-muted-foreground">{log.workoutNote}</p>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground">Rest day</p>
        )}
      </div>

      {/* Reactions */}
      <div className="flex items-center gap-2 flex-wrap">
        {QUICK_REACTIONS.map(emoji => {
          const count = reactionCounts[emoji] ?? 0
          const isActive = myReaction?.emoji === emoji
          return (
            <button
              key={emoji}
              onClick={() => handleReact(emoji)}
              disabled={isPending}
              className={cn(
                'flex items-center gap-1 px-2.5 py-1 rounded-full text-sm border transition-all',
                isActive
                  ? 'border-brand-orange bg-brand-orange/15 scale-105'
                  : count > 0
                  ? 'border-border bg-secondary'
                  : 'border-transparent hover:border-border hover:bg-secondary'
              )}
            >
              <span>{emoji}</span>
              {count > 0 && <span className="text-xs text-muted-foreground">{count}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Avatar({ user }: { user: { name: string | null; image: string | null } }) {
  if (user.image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={user.image} alt={user.name ?? ''} className="w-9 h-9 rounded-full object-cover border border-border flex-shrink-0" />
    )
  }
  return (
    <div className="w-9 h-9 rounded-full gradient-orange flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
      {user.name?.charAt(0).toUpperCase() ?? '?'}
    </div>
  )
}
