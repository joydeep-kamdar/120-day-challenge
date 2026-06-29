'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { weeklyCheckins, challengeMembers } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import { calculateBmi } from '@/lib/bmi'
import { getWeekNumber } from '@/lib/streaks'

interface SaveCheckinInput {
  challengeId: string
  startDate: string
  weightKg: number
  waistExtendedCm: number
  waistSuckedinCm: number
  heightCm: number
  date: string
}

export async function saveCheckin(input: SaveCheckinInput) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Not authenticated' }

  const userId = session.user.id
  const weekNumber = getWeekNumber(input.startDate)
  const bmi = calculateBmi(input.weightKg, input.heightCm)

  try {
    const existing = await db.query.weeklyCheckins.findFirst({
      where: and(
        eq(weeklyCheckins.userId, userId),
        eq(weeklyCheckins.challengeId, input.challengeId),
        eq(weeklyCheckins.weekNumber, weekNumber)
      ),
    })

    if (existing) {
      await db
        .update(weeklyCheckins)
        .set({
          weightKg: input.weightKg,
          waistExtendedCm: input.waistExtendedCm,
          waistSuckedinCm: input.waistSuckedinCm,
          bmi,
          date: input.date,
        })
        .where(eq(weeklyCheckins.id, existing.id))
    } else {
      await db.insert(weeklyCheckins).values({
        userId,
        challengeId: input.challengeId,
        weekNumber,
        date: input.date,
        weightKg: input.weightKg,
        waistExtendedCm: input.waistExtendedCm,
        waistSuckedinCm: input.waistSuckedinCm,
        bmi,
      })
    }

    return { success: true, bmi }
  } catch (err) {
    console.error('saveCheckin error:', err)
    return { error: 'Failed to save check-in' }
  }
}
