'use client'

import { motion } from 'framer-motion'
import { FeedCard } from '@/components/feed/FeedCard'
import { MemberCard } from '@/components/feed/MemberCard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Member {
  userId: string
  user: {
    id: string
    name: string | null
    image: string | null
    profile: { startWeightKg: number; goalWeightKg: number } | null
  }
}

interface LogWithUser {
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

interface CheckinWithUser {
  id: string
  userId: string
  weekNumber: number
  weightKg: number
  bmi: number
  date: string
  createdAt: Date
  user: { id: string; name: string | null; image: string | null }
}

interface Props {
  currentUserId: string
  members: Member[]
  recentLogs: LogWithUser[]
  recentCheckins: CheckinWithUser[]
  challengeId: string
}

export function GroupFeedClient({ currentUserId, members, recentLogs, recentCheckins, challengeId }: Props) {
  return (
    <Tabs defaultValue="feed">
      <TabsList className="w-full rounded-xl bg-secondary mb-4">
        <TabsTrigger value="feed" className="flex-1 rounded-lg">Feed</TabsTrigger>
        <TabsTrigger value="crew" className="flex-1 rounded-lg">Crew</TabsTrigger>
      </TabsList>

      <TabsContent value="feed" className="space-y-3 mt-0">
        {recentLogs.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-3xl mb-2">🏃</p>
            <p className="text-sm">No activity yet — be the first to log!</p>
          </div>
        )}
        {recentLogs.map((log, i) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <FeedCard
              log={log}
              currentUserId={currentUserId}
              challengeId={challengeId}
            />
          </motion.div>
        ))}
      </TabsContent>

      <TabsContent value="crew" className="space-y-3 mt-0">
        {members.map((m, i) => (
          <motion.div
            key={m.userId}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <MemberCard
              member={m}
              isCurrentUser={m.userId === currentUserId}
              latestCheckin={recentCheckins.find(c => c.userId === m.userId) ?? null}
            />
          </motion.div>
        ))}
      </TabsContent>
    </Tabs>
  )
}
