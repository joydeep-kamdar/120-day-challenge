'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { challenges, challengeMembers, userProfiles } from '@/lib/db/schema'
import { redirect } from 'next/navigation'

function makeSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function makeInviteCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

export async function createChallenge(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const userId = session.user.id
  const name = (formData.get('name') as string).trim()
  const startDate = new Date(formData.get('startDate') as string)
  const heightCm = parseFloat(formData.get('heightCm') as string)
  const startWeightKg = parseFloat(formData.get('startWeightKg') as string)
  const goalWeightKg = parseFloat(formData.get('goalWeightKg') as string)

  if (!name || isNaN(heightCm) || isNaN(startWeightKg) || isNaN(goalWeightKg)) {
    return { error: 'All fields are required' }
  }

  const slug = makeSlug(name) + '-' + Date.now().toString(36)
  const inviteCode = makeInviteCode()

  await db.transaction(async (tx) => {
    // Upsert profile
    await tx
      .insert(userProfiles)
      .values({ userId, heightCm, startWeightKg, goalWeightKg })
      .onConflictDoUpdate({
        target: userProfiles.userId,
        set: { heightCm, startWeightKg, goalWeightKg },
      })

    // Create challenge
    const [challenge] = await tx
      .insert(challenges)
      .values({ name, slug, inviteCode, startDate, createdBy: userId })
      .returning()

    // Add creator as admin
    await tx.insert(challengeMembers).values({
      challengeId: challenge.id,
      userId,
      role: 'admin',
    })
  })

  redirect('/dashboard')
}
