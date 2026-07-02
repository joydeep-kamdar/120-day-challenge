import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { challengeMembers, dailyLogs } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'

export type MembershipWithChallenge = Awaited<ReturnType<typeof getActiveMembership>>['membership']
export type AllMemberships = Awaited<ReturnType<typeof getActiveMembership>>['allMemberships']

export async function getActiveMembership(userId: string) {
  const allMemberships = await db.query.challengeMembers.findMany({
    where: eq(challengeMembers.userId, userId),
    with: { challenge: true },
    orderBy: [desc(challengeMembers.joinedAt)],
  })

  if (allMemberships.length === 0) {
    return { membership: null, allMemberships: [] }
  }

  if (allMemberships.length === 1) {
    return { membership: allMemberships[0], allMemberships }
  }

  // Multiple challenges — honour explicit cookie preference first
  const cookieStore = await cookies()
  const preferred = cookieStore.get('active_challenge_id')?.value

  if (preferred) {
    const match = allMemberships.find(m => m.challengeId === preferred)
    if (match) return { membership: match, allMemberships }
  }

  // No valid preference — find the challenge with the most recent log activity
  const recency = await Promise.all(
    allMemberships.map(async (m) => {
      const latest = await db.query.dailyLogs.findFirst({
        where: and(
          eq(dailyLogs.userId, userId),
          eq(dailyLogs.challengeId, m.challengeId)
        ),
        orderBy: [desc(dailyLogs.date)],
      })
      return {
        membership: m,
        latestDate: latest?.date ?? m.joinedAt.toISOString().split('T')[0],
      }
    })
  )

  recency.sort((a, b) => b.latestDate.localeCompare(a.latestDate))
  return { membership: recency[0].membership, allMemberships }
}
