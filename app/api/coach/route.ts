import { auth } from '@/lib/auth'
import Anthropic from '@anthropic-ai/sdk'
import { db } from '@/lib/db'
import { challengeMembers, weeklyCheckins, dailyLogs, userProfiles } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { calculateStreaks } from '@/lib/streaks'

const client = new Anthropic()

const ZARA_SYSTEM = `You are Coach Zara — a fun, flirty, energetic female fitness coach.
You're coaching a group of guys on a 120-day fitness challenge.
Your personality: warm, encouraging, playful, slightly teasing but always supportive.
You give short, punchy messages (2-4 sentences max).
Use fitness emojis naturally. Never be generic — make it personal using their stats.
You're proud of every bit of progress, no matter how small.
Never mention you're an AI. Just be Zara.`

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })

  const userId = session.user.id
  const body = await request.json()
  const userMessage: string = body.message ?? 'How am I doing?'

  // Get context
  const [membership, profile] = await Promise.all([
    db.query.challengeMembers.findFirst({
      where: eq(challengeMembers.userId, userId),
      with: { challenge: true },
    }),
    db.query.userProfiles.findFirst({ where: eq(userProfiles.userId, userId) }),
  ])

  let contextInfo = ''
  if (membership && profile) {
    const [latestCheckin, recentLogs] = await Promise.all([
      db.query.weeklyCheckins.findFirst({
        where: and(
          eq(weeklyCheckins.userId, userId),
          eq(weeklyCheckins.challengeId, membership.challengeId)
        ),
        orderBy: [desc(weeklyCheckins.weekNumber)],
      }),
      db.query.dailyLogs.findMany({
        where: and(
          eq(dailyLogs.userId, userId),
          eq(dailyLogs.challengeId, membership.challengeId)
        ),
        orderBy: [desc(dailyLogs.date)],
        limit: 14,
      }),
    ])

    const streaks = calculateStreaks(recentLogs as Parameters<typeof calculateStreaks>[0])

    contextInfo = `
User stats: start weight ${profile.startWeightKg}kg, goal ${profile.goalWeightKg}kg.
${latestCheckin ? `Latest check-in: ${latestCheckin.weightKg}kg, BMI ${latestCheckin.bmi.toFixed(1)}, week ${latestCheckin.weekNumber}.` : 'No check-ins yet.'}
Current streak: ${streaks.current} days. Longest streak: ${streaks.longest} days.
Total workouts logged: ${recentLogs.filter(l => l.workoutDone).length} in last 14 days.
`
  }

  const stream = await client.messages.stream({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    system: ZARA_SYSTEM + (contextInfo ? `\n\nContext about this user:\n${contextInfo}` : ''),
    messages: [{ role: 'user', content: userMessage }],
  })

  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          controller.enqueue(new TextEncoder().encode(chunk.delta.text))
        }
      }
      controller.close()
    },
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
