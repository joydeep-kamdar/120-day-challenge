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

  const members = await db.query.challengeMembers.findMany({
    where: eq(challengeMembers.challengeId, challengeId),
    with: { user: true },
  })

  const memberIds = members.map(m => m.userId)

  const allLogs = await db.query.dailyLogs.findMany({
    where: and(
      eq(dailyLogs.challengeId, challengeId),
      inArray(dailyLogs.userId, memberIds)
    ),
    orderBy: [desc(dailyLogs.date), desc(dailyLogs.createdAt)],
    with: {
      user: true,
      reactions: true,
      comments: {
        with: { user: true },
        orderBy: (c, { asc }) => [asc(c.createdAt)],
      },
    },
  })

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

  const feedLogs = allLogs
    .filter(l => l.date >= weekAgo)
    .map(l => ({
      id: l.id,
      userId: l.userId,
      date: l.date,
      workoutDone: l.workoutDone,
      workoutNote: l.workoutNote,
      moodEmoji: l.moodEmoji,
      weightKg: l.weightKg,
      waistExtendedCm: l.waistExtendedCm,
      waistSuckedinCm: l.waistSuckedinCm,
      createdAt: l.createdAt,
      user: l.user,
      reactions: l.reactions,
      comments: (l.comments ?? []).map(c => ({
        id: c.id,
        userId: c.userId,
        text: c.text,
        createdAt: c.createdAt,
        user: { name: c.user.name, image: c.user.image },
      })),
    }))

  return (
    <div style={{ paddingTop: '8px' }}>
      <div style={{ marginBottom: '22px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', letterSpacing: '2px', color: '#fff', lineHeight: 1 }}>
          {membership.challenge.name.toUpperCase()}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#9ca3af', letterSpacing: '2px', marginTop: '5px' }}>
          {members.length} MEMBERS
        </div>
      </div>
      <GroupFeedClient
        currentUserId={userId}
        memberStats={memberStats}
        feedLogs={feedLogs}
        challengeId={challengeId}
      />
    </div>
  )
}
