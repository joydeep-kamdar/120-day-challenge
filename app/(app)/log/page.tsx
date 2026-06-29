import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { DailyLogForm } from '@/components/log/DailyLogForm'
import { db } from '@/lib/db'
import { challengeMembers, dailyLogs } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { format } from 'date-fns'

export default async function LogPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const userId = session.user.id
  const today = format(new Date(), 'yyyy-MM-dd')

  const membership = await db.query.challengeMembers.findFirst({
    where: eq(challengeMembers.userId, userId),
    with: { challenge: true },
  })

  if (!membership) redirect('/dashboard')

  const todayLog = await db.query.dailyLogs.findFirst({
    where: and(
      eq(dailyLogs.userId, userId),
      eq(dailyLogs.challengeId, membership.challengeId),
      eq(dailyLogs.date, today)
    ),
  })

  return (
    <div className="py-2">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
          Daily Log
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {format(new Date(), 'EEEE, MMM d')}
        </p>
      </div>
      <DailyLogForm
        challengeId={membership.challengeId}
        existingLog={todayLog ?? null}
        today={today}
      />
    </div>
  )
}
