import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { challengeMembers, userProfiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { ProfileClient } from './ProfileClient'

interface Props {
  params: Promise<{ userId: string }>
}

export default async function ProfilePage({ params }: Props) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const { userId } = await params

  // Only allow viewing your own profile for now
  if (userId !== session.user.id) redirect(`/profile/${session.user.id}`)

  const [profile, membership] = await Promise.all([
    db.query.userProfiles.findFirst({ where: eq(userProfiles.userId, userId) }),
    db.query.challengeMembers.findFirst({
      where: eq(challengeMembers.userId, userId),
      with: { challenge: true },
    }),
  ])

  const challenge = membership?.challenge ?? null
  let dayNum = 1
  if (challenge?.startDate) {
    const diff = Math.floor((Date.now() - new Date(challenge.startDate).getTime()) / 86400000)
    dayNum = Math.min(120, Math.max(1, diff + 1))
  }

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
    />
  )
}
