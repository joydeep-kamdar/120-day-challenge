'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { dailyLogs } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import type { MoodEmoji } from '@/types'

interface SaveLogInput {
  challengeId: string
  date: string
  workoutDone: boolean
  workoutNote: string | null
  moodEmoji: MoodEmoji
}

export async function saveDailyLog(input: SaveLogInput) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Not authenticated' }

  const userId = session.user.id

  try {
    const existing = await db.query.dailyLogs.findFirst({
      where: and(
        eq(dailyLogs.userId, userId),
        eq(dailyLogs.challengeId, input.challengeId),
        eq(dailyLogs.date, input.date)
      ),
    })

    if (existing) {
      await db
        .update(dailyLogs)
        .set({
          workoutDone: input.workoutDone,
          workoutNote: input.workoutNote,
          moodEmoji: input.moodEmoji,
        })
        .where(eq(dailyLogs.id, existing.id))
    } else {
      await db.insert(dailyLogs).values({
        userId,
        challengeId: input.challengeId,
        date: input.date,
        workoutDone: input.workoutDone,
        workoutNote: input.workoutNote,
        moodEmoji: input.moodEmoji,
      })
    }

    return { success: true }
  } catch (err) {
    console.error('saveDailyLog error:', err)
    return { error: 'Failed to save log' }
  }
}
