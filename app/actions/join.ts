'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { challengeMembers, challenges, userProfiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'

export async function joinChallenge(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const userId = session.user.id
  const inviteCode = formData.get('inviteCode') as string
  const heightCm = parseFloat(formData.get('heightCm') as string)
  const startWeightKg = parseFloat(formData.get('startWeightKg') as string)
  const goalWeightKg = parseFloat(formData.get('goalWeightKg') as string)

  if (isNaN(heightCm) || isNaN(startWeightKg) || isNaN(goalWeightKg)) {
    return { error: 'All fields are required' }
  }

  const challenge = await db.query.challenges.findFirst({
    where: eq(challenges.inviteCode, inviteCode),
  })

  if (!challenge) return { error: 'Invalid invite code' }

  // Upsert profile
  await db
    .insert(userProfiles)
    .values({ userId, heightCm, startWeightKg, goalWeightKg })
    .onConflictDoUpdate({
      target: userProfiles.userId,
      set: { heightCm, startWeightKg, goalWeightKg },
    })

  // Add as member (ignore if already a member)
  await db
    .insert(challengeMembers)
    .values({ challengeId: challenge.id, userId, role: 'member' })
    .onConflictDoNothing()

  redirect('/dashboard')
}
