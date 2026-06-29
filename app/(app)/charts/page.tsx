import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { challengeMembers, dailyLogs } from '@/lib/db/schema'
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

  const logs = await db.query.dailyLogs.findMany({
    where: and(
      eq(dailyLogs.userId, userId),
      eq(dailyLogs.challengeId, membership.challengeId)
    ),
    orderBy: [asc(dailyLogs.date)],
  })

  return <ChartsClient logs={logs} />
}
