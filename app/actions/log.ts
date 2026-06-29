'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { dailyLogs } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import { calculateBmi } from '@/lib/bmi'
import type { MoodEmoji } from '@/types'

interface SaveLogInput {
  challengeId: string
  date: string
  workoutDone: boolean
  workoutNote: string | null
  moodEmoji: MoodEmoji
  // Optional measurements
  weightKg?: number | null
  waistExtendedCm?: number | null
  waistSuckedinCm?: number | null
  heightCm?: number | null
}

export async function saveDailyLog(input: SaveLogInput) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Not authenticated' }

  const userId = session.user.id

  const bmi =
    input.weightKg && input.heightCm
      ? calculateBmi(input.weightKg, input.heightCm)
      : null

  const values = {
    workoutDone: input.workoutDone,
    workoutNote: input.workoutNote,
    moodEmoji: input.moodEmoji,
    weightKg: input.weightKg ?? null,
    waistExtendedCm: input.waistExtendedCm ?? null,
    waistSuckedinCm: input.waistSuckedinCm ?? null,
    bmi: bmi ?? null,
  }

  try {
    const existing = await db.query.dailyLogs.findFirst({
      where: and(
        eq(dailyLogs.userId, userId),
        eq(dailyLogs.challengeId, input.challengeId),
        eq(dailyLogs.date, input.date)
      ),
    })

    if (existing) {
      await db.update(dailyLogs).set(values).where(eq(dailyLogs.id, existing.id))
    } else {
      await db.insert(dailyLogs).values({
        userId,
        challengeId: input.challengeId,
        date: input.date,
        ...values,
      })
    }

    return { success: true }
  } catch (err) {
    console.error('saveDailyLog error:', err)
    return { error: 'Failed to save log' }
  }
}
