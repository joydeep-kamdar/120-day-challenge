import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { challengeMembers, dailyLogs } from '@/lib/db/schema'
import { eq, and, inArray, desc } from 'drizzle-orm'
import { GroupFeedClient } from './GroupFeedClient'
import { calculateStreaks } from '@/lib/streaks'
import { getActiveMembership } from '@/lib/active-challenge'

export const revalidate = 30

export default async function GroupPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const userId = session.user.id

  const { membership } = await getActiveMembership(userId)

  if (!membership) redirect('/dashboard')

  const challengeId = membership.challengeId
  const today = new Date().toISOString().split('T')[0]
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]

  // All members with user info
  const members = await db.query.challengeMembers.findMany({
    where: eq(challengeMembers.challengeId, challengeId),
    with: { user: true },
  })

  const memberIds = members.map(m => m.userId)

  // All logs for this challenge (for feed + stats)
  const allLogs = await db.query.dailyLogs.findMany({
    where: and(
      eq(dailyLogs.challengeId, challengeId),
      inArray(dailyLogs.userId, memberIds)
    ),
    orderBy: [desc(dailyLogs.date)],
    with: { user: true, reactions: true },
  })

  // Per-member stats
  const memberStats = members.map(m => {
    const logs = allLogs.filter(l => l.userId === m.userId)
    const streaks = calculateStreaks(logs as Parameters<typeof calculateStreaks>[0])
    const todayLog = logs.find(l => l.date === today)
    const thisWeekLogs = logs.filter(l => l.date >= weekAgo)
    const latestWeight = logs.find(l => l.weightKg != null)?.weightKg ?? null

    return {
      userId: m.userId,
      name: m.user.name ?? 'Member',
      image: m.user.image ?? null,
      totalLogs: logs.length,
      thisWeekCount: thisWeekLogs.length,
      loggedToday: !!todayLog,
      workedOutToday: todayLog?.workoutDone ?? false,
      currentStreak: streaks.current,
      latestWeight,
    }
  })

  // Feed: last 7 days of logs
  const feedLogs = allLogs.filter(l => l.date >= weekAgo)

  return (
    <div style={{ paddingTop: '8px' }}>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', letterSpacing: '2px', color: '#fff', lineHeight: 1 }}>
          {membership.challenge.name.toUpperCase()}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#9ca3af', letterSpacing: '2px', marginTop: '4px' }}>
          {members.length} MEMBERS · DAY 30 OF 120
        </div>
      </div>
      <GroupFeedClient
        currentUserId={userId}
        memberStats={memberStats}
        feedLogs={feedLogs as Parameters<typeof GroupFeedClient>[0]['feedLogs']}
        challengeId={challengeId}
      />
    </div>
  )
}
