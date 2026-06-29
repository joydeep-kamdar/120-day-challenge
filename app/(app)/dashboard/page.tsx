import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { challengeMembers, challenges, dailyLogs, weeklyCheckins, userProfiles, badges } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { DashboardClient } from './DashboardClient'
import { calculateStreaks } from '@/lib/streaks'
import { getWeightProgress } from '@/lib/bmi'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const userId = session.user.id

  // Get the user's first active challenge
  const membership = await db.query.challengeMembers.findFirst({
    where: eq(challengeMembers.userId, userId),
    with: { challenge: true },
  })

  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, userId),
  })

  if (!membership) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <span className="text-5xl mb-4">🔥</span>
        <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
          No challenge yet
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          Create a challenge or join one with an invite link to get started.
        </p>
        <a
          href="/challenge/new"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-orange text-white font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          Create a Challenge
        </a>
      </div>
    )
  }

  const challenge = membership.challenge

  const [myLogs, myCheckins, myBadges] = await Promise.all([
    db.query.dailyLogs.findMany({
      where: and(
        eq(dailyLogs.userId, userId),
        eq(dailyLogs.challengeId, challenge.id)
      ),
      orderBy: [desc(dailyLogs.date)],
    }),
    db.query.weeklyCheckins.findMany({
      where: and(
        eq(weeklyCheckins.userId, userId),
        eq(weeklyCheckins.challengeId, challenge.id)
      ),
      orderBy: [desc(weeklyCheckins.date)],
    }),
    db.query.badges.findMany({
      where: and(
        eq(badges.userId, userId),
        eq(badges.challengeId, challenge.id)
      ),
    }),
  ])

  const today = new Date().toISOString().split('T')[0]
  const streaks = calculateStreaks(myLogs as Parameters<typeof calculateStreaks>[0])
  const latestCheckin = myCheckins[0] ?? null
  const startWeight = profile?.startWeightKg ?? 0
  const goalWeight = profile?.goalWeightKg ?? 0
  const currentWeight = latestCheckin?.weightKg ?? startWeight
  const progressPercent = getWeightProgress(currentWeight, startWeight, goalWeight)
  const weightLost = startWeight - currentWeight
  const hasLoggedToday = myLogs.some(l => l.date === today)

  return (
    <DashboardClient
      user={{ id: userId, name: session.user.name ?? 'You', image: session.user.image ?? null }}
      challenge={challenge}
      streaks={streaks}
      latestCheckin={latestCheckin}
      profile={profile ?? null}
      progressPercent={progressPercent}
      weightLost={weightLost}
      totalWorkouts={myLogs.filter(l => l.workoutDone).length}
      badges={myBadges}
      hasLoggedToday={hasLoggedToday}
    />
  )
}
