'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { challenges, challengeMembers, userProfiles } from '@/lib/db/schema'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'

export async function switchActiveChallenge(challengeId: string) {
  const session = await auth()
  if (!session?.user?.id) return

  // Verify the user is actually a member before honouring the switch
  const membership = await db.query.challengeMembers.findFirst({
    where: eq(challengeMembers.userId, session.user.id),
  })
  if (!membership) return

  const cookieStore = await cookies()
  cookieStore.set('active_challenge_id', challengeId, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

function makeSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function makeInviteCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

export async function createChallenge(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const userId = session.user.id
  const name = (formData.get('name') as string | null)?.trim() ?? ''
  const startDate = new Date(formData.get('startDate') as string)
  const heightCm = parseFloat(formData.get('heightCm') as string)
  const startWeightKg = parseFloat(formData.get('startWeightKg') as string)
  const goalWeightKg = parseFloat(formData.get('goalWeightKg') as string)

  if (!name || isNaN(heightCm) || isNaN(startWeightKg) || isNaN(goalWeightKg)) {
    return { error: 'All fields are required' }
  }

  const slug = makeSlug(name) + '-' + Date.now().toString(36)
  const inviteCode = makeInviteCode()

  await db
    .insert(userProfiles)
    .values({ userId, heightCm, startWeightKg, goalWeightKg })
    .onConflictDoUpdate({
      target: userProfiles.userId,
      set: { heightCm, startWeightKg, goalWeightKg },
    })

  const [challenge] = await db
    .insert(challenges)
    .values({ name, slug, inviteCode, startDate, createdBy: userId })
    .returning()

  await db.insert(challengeMembers).values({
    challengeId: challenge.id,
    userId,
    role: 'admin',
  })

  redirect('/dashboard')
}
