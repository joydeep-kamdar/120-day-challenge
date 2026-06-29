import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { DailyLogForm } from '@/components/log/DailyLogForm'
import { db } from '@/lib/db'
import { challengeMembers, dailyLogs, userProfiles } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { format } from 'date-fns'

export default async function LogPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const userId = session.user.id
  const today = format(new Date(), 'yyyy-MM-dd')

  const [membership, profile] = await Promise.all([
    db.query.challengeMembers.findFirst({
      where: eq(challengeMembers.userId, userId),
      with: { challenge: true },
    }),
    db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, userId),
    }),
  ])

  if (!membership) redirect('/dashboard')

  const todayLog = await db.query.dailyLogs.findFirst({
    where: and(
      eq(dailyLogs.userId, userId),
      eq(dailyLogs.challengeId, membership.challengeId),
      eq(dailyLogs.date, today)
    ),
  })

  return (
    <DailyLogForm
      challengeId={membership.challengeId}
      existingLog={todayLog ?? null}
      today={today}
      heightCm={profile?.heightCm ?? null}
    />
  )
}
