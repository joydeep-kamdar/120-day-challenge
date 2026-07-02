import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { dailyLogs, userProfiles } from '@/lib/db/schema'
import { eq, and, asc } from 'drizzle-orm'
import { ChartsClient } from './ChartsClient'
import { calculateBmi } from '@/lib/bmi'
import { getActiveMembership } from '@/lib/active-challenge'

export default async function ChartsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const userId = session.user.id

  const [{ membership }, profile] = await Promise.all([
    getActiveMembership(userId),
    db.query.userProfiles.findFirst({ where: eq(userProfiles.userId, userId) }),
  ])

  if (!membership) redirect('/dashboard')

  const logs = await db.query.dailyLogs.findMany({
    where: and(
      eq(dailyLogs.userId, userId),
      eq(dailyLogs.challengeId, membership.challengeId)
    ),
    orderBy: [asc(dailyLogs.date)],
  })

  const goalBmi =
    profile?.goalWeightKg && profile?.heightCm
      ? calculateBmi(profile.goalWeightKg, profile.heightCm)
      : null

  return (
    <ChartsClient
      logs={logs}
      goals={{
        weightKg: profile?.goalWeightKg ?? null,
        waistExtendedCm: profile?.goalWaistExtendedCm ?? null,
        waistSuckedinCm: profile?.goalWaistSuckedinCm ?? null,
        bmi: goalBmi,
      }}
    />
  )
}
