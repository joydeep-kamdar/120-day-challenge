import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { userProfiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { ProfileClient } from './ProfileClient'
import { getActiveMembership } from '@/lib/active-challenge'

interface Props {
  params: Promise<{ userId: string }>
}

export default async function ProfilePage({ params }: Props) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const { userId } = await params

  if (userId !== session.user.id) redirect(`/profile/${session.user.id}`)

  const [profile, { membership, allMemberships }] = await Promise.all([
    db.query.userProfiles.findFirst({ where: eq(userProfiles.userId, userId) }),
    getActiveMembership(userId),
  ])

  const challenge = membership?.challenge ?? null
  let dayNum = 1
  if (challenge?.startDate) {
    const diff = Math.floor((Date.now() - new Date(challenge.startDate).getTime()) / 86400000)
    dayNum = Math.min(120, Math.max(1, diff + 1))
  }

  const allChallenges = allMemberships.map(m => ({
    id: m.challengeId,
    name: m.challenge.name,
    startDate: m.challenge.startDate.toISOString().split('T')[0],
    dayNum: Math.min(
      m.challenge.durationDays,
      Math.max(1, Math.floor((Date.now() - new Date(m.challenge.startDate).getTime()) / 86400000) + 1)
    ),
  }))

  return (
    <ProfileClient
      user={{
        id: session.user.id,
        name: session.user.name ?? 'You',
        email: session.user.email ?? '',
        image: session.user.image ?? null,
      }}
      profile={profile ?? null}
      challenge={challenge ? { name: challenge.name, inviteCode: challenge.inviteCode, startDate: challenge.startDate.toISOString().split('T')[0] } : null}
      dayNum={dayNum}
      allChallenges={allChallenges}
      activeChallengeId={membership?.challengeId ?? null}
    />
  )
}
