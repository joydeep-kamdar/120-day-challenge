'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { userProfiles } from '@/lib/db/schema'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function updateProfile(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const userId = session.user.id
  const heightCm = parseFloat(formData.get('heightCm') as string)
  const startWeightKg = parseFloat(formData.get('startWeightKg') as string)
  const goalWeightKg = parseFloat(formData.get('goalWeightKg') as string)

  if (isNaN(heightCm) || isNaN(startWeightKg) || isNaN(goalWeightKg)) {
    return { error: 'All fields are required' }
  }

  await db
    .insert(userProfiles)
    .values({ userId, heightCm, startWeightKg, goalWeightKg })
    .onConflictDoUpdate({
      target: userProfiles.userId,
      set: { heightCm, startWeightKg, goalWeightKg },
    })

  revalidatePath('/dashboard')
  return { success: true }
}
