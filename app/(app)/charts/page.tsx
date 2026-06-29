import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { challengeMembers, weeklyCheckins, dailyLogs } from '@/lib/db/schema'
import { eq, and, asc } from 'drizzle-orm'
import { ChartsClient } from './ChartsClient'

export default async function ChartsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const userId = session.user.id

  const membership = await db.query.challengeMembers.findFirst({
    where: eq(challengeMembers.userId, userId),
  })

  if (!membership) redirect('/dashboard')

  const [checkins, logs] = await Promise.all([
    db.query.weeklyCheckins.findMany({
      where: and(
        eq(weeklyCheckins.userId, userId),
        eq(weeklyCheckins.challengeId, membership.challengeId)
      ),
      orderBy: [asc(weeklyCheckins.weekNumber)],
    }),
    db.query.dailyLogs.findMany({
      where: and(
        eq(dailyLogs.userId, userId),
        eq(dailyLogs.challengeId, membership.challengeId)
      ),
      orderBy: [asc(dailyLogs.date)],
    }),
  ])

  return (
    <div className="py-2">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
          Your Progress
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {checkins.length} check-ins · {logs.filter(l => l.workoutDone).length} workouts
        </p>
      </div>
      <ChartsClient checkins={checkins} logs={logs} />
    </div>
  )
}
