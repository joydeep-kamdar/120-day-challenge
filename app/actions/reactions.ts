'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { reactions } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'

export async function addReaction({ logId, emoji }: { logId: string; emoji: string }) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Not authenticated' }

  const userId = session.user.id

  const existing = await db.query.reactions.findFirst({
    where: and(eq(reactions.fromUserId, userId), eq(reactions.toLogId, logId)),
  })

  if (existing) {
    if (existing.emoji === emoji) {
      await db.delete(reactions).where(eq(reactions.id, existing.id))
    } else {
      await db.update(reactions).set({ emoji }).where(eq(reactions.id, existing.id))
    }
  } else {
    await db.insert(reactions).values({ fromUserId: userId, toLogId: logId, emoji })
  }

  return { success: true }
}
