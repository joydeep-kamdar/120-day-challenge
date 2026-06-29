import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { challengeMembers, dailyLogs, weeklyCheckins, users, userProfiles, reactions } from '@/lib/db/schema'
import { eq, and, desc, inArray } from 'drizzle-orm'
import { GroupFeedClient } from './GroupFeedClient'

export const revalidate = 30

export default async function GroupPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const userId = session.user.id

  const membership = await db.query.challengeMembers.findFirst({
    where: eq(challengeMembers.userId, userId),
    with: { challenge: true },
  })

  if (!membership) redirect('/dashboard')

  const challengeId = membership.challengeId

  // Get all members of this challenge
  const members = await db.query.challengeMembers.findMany({
    where: eq(challengeMembers.challengeId, challengeId),
    with: {
      user: {
        with: { profile: true },
      },
    },
  })

  const memberIds = members.map((m) => m.userId)

  // Get recent daily logs with reactions
  const recentLogs = await db.query.dailyLogs.findMany({
    where: and(
      eq(dailyLogs.challengeId, challengeId),
      inArray(dailyLogs.userId, memberIds)
    ),
    orderBy: [desc(dailyLogs.createdAt)],
    limit: 30,
    with: {
      user: true,
      reactions: true,
    },
  })

  // Get recent check-ins
  const recentCheckins = await db.query.weeklyCheckins.findMany({
    where: and(
      eq(weeklyCheckins.challengeId, challengeId),
      inArray(weeklyCheckins.userId, memberIds)
    ),
    orderBy: [desc(weeklyCheckins.createdAt)],
    limit: 10,
    with: { user: true },
  })

  return (
    <div className="py-2">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
          The Crew
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {members.length} members · {membership.challenge.name}
        </p>
      </div>
      <GroupFeedClient
        currentUserId={userId}
        members={members}
        recentLogs={recentLogs}
        recentCheckins={recentCheckins}
        challengeId={challengeId}
      />
    </div>
  )
}
