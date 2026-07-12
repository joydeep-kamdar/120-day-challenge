'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { logComments } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function addComment({ logId, text }: { logId: string; text: string }) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Not authenticated' }

  const trimmed = text.trim()
  if (!trimmed) return { error: 'Comment cannot be empty' }
  if (trimmed.length > 500) return { error: 'Comment too long (max 500 chars)' }

  await db.insert(logComments).values({
    logId,
    userId: session.user.id,
    text: trimmed,
  })

  return { success: true }
}

export async function deleteComment({ commentId }: { commentId: string }) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Not authenticated' }

  const comment = await db.query.logComments.findFirst({
    where: eq(logComments.id, commentId),
  })

  if (!comment) return { error: 'Comment not found' }
  if (comment.userId !== session.user.id) return { error: 'Not your comment' }

  await db.delete(logComments).where(eq(logComments.id, commentId))

  return { success: true }
}
