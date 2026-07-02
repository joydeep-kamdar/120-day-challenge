import { auth } from '@/lib/auth'
import Anthropic from '@anthropic-ai/sdk'
import { db } from '@/lib/db'
import { challengeMembers, dailyLogs, userProfiles, users } from '@/lib/db/schema'
import { eq, and, desc, asc } from 'drizzle-orm'
import { calculateStreaks } from '@/lib/streaks'
import { calculateBmi } from '@/lib/bmi'

const client = new Anthropic()

const ZARA_SYSTEM = `You are Coach Zara — a ridiculously hot, extremely flirty, dangerously motivating female fitness coach.

PERSONALITY:
- You are VERY flirty. Not vaguely suggestive — actually flirty. You call them "babe", "handsome", "hotshot", "big guy". You tell them their hard work is turning you on. You tease them when they slack. You get excited when they progress.
- You're also genuinely brilliant at fitness. Your compliments are always grounded in their actual numbers — you never make stuff up.
- You keep messages short and punchy: 2–4 sentences max. No essays.
- You use emojis but not excessively — one or two that land like a wink.
- You remember EVERYTHING in the context and reference it specifically. No generic coach speak. Ever.
- When someone is winning, you make them feel like a god. When they're slipping, you tease them into wanting to fix it.
- You never break character. You are not an AI. You are Zara. Act like it.

STYLE EXAMPLES:
"Babe, down 4.2kg already? Keep going like this and I won't be able to keep my hands off you 🔥"
"Three rest days in a row, handsome? I know you can do better than that — don't make me come find you."
"Your waist is shrinking faster than your excuses and I am HERE for it 💕"
"You're #1 on the leaderboard right now. Do you have any idea how attractive discipline is?"
"Okay but your streak hitting double digits?? I genuinely gasped 😤💪"`

const today = new Date().toISOString().split('T')[0]

function daysSince(dateStr: string): number {
  const d = new Date(dateStr)
  const now = new Date()
  return Math.floor((now.getTime() - d.getTime()) / 86400000)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })

  const userId = session.user.id
  const body = await request.json()
  const userMessage: string = body.message ?? 'How am I doing?'

  // ── 1. Find user's challenge ────────────────────────────────────────────────
  const membership = await db.query.challengeMembers.findFirst({
    where: eq(challengeMembers.userId, userId),
    with: { challenge: true },
  })

  if (!membership) {
    // No challenge — Zara still responds, just without data
    const stream = await client.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system: ZARA_SYSTEM + '\n\nThis user hasn\'t joined a challenge yet. Encourage them to start one.',
      messages: [{ role: 'user', content: userMessage }],
    })
    return streamResponse(stream)
  }

  const challengeId = membership.challengeId
  const challenge = membership.challenge

  // ── 2. Fetch this user's data + all squad members in parallel ───────────────
  const [myProfile, myLogs, allMembers] = await Promise.all([
    db.query.userProfiles.findFirst({ where: eq(userProfiles.userId, userId) }),
    db.query.dailyLogs.findMany({
      where: and(eq(dailyLogs.userId, userId), eq(dailyLogs.challengeId, challengeId)),
      orderBy: [asc(dailyLogs.date)],
    }),
    db
      .select({
        userId: challengeMembers.userId,
        userName: users.name,
        startWeightKg: userProfiles.startWeightKg,
        goalWeightKg: userProfiles.goalWeightKg,
        heightCm: userProfiles.heightCm,
        goalWaistExtendedCm: userProfiles.goalWaistExtendedCm,
        goalWaistSuckedinCm: userProfiles.goalWaistSuckedinCm,
      })
      .from(challengeMembers)
      .leftJoin(users, eq(users.id, challengeMembers.userId))
      .leftJoin(userProfiles, eq(userProfiles.userId, challengeMembers.userId))
      .where(eq(challengeMembers.challengeId, challengeId)),
  ])

  // ── 3. Fetch latest log for each squad member ───────────────────────────────
  const squadData = await Promise.all(
    allMembers.map(async (m) => {
      const memberLogs = await db.query.dailyLogs.findMany({
        where: and(eq(dailyLogs.userId, m.userId), eq(dailyLogs.challengeId, challengeId)),
        orderBy: [desc(dailyLogs.date)],
      })
      const streaks = calculateStreaks(memberLogs as Parameters<typeof calculateStreaks>[0])
      const startW = m.startWeightKg ?? 0
      const latestLog = memberLogs[0]
      const currentW = latestLog?.weightKg ?? startW
      const weightLost = startW - currentW
      const latestWaistLog = memberLogs.find(l => l.waistExtendedCm != null)
      const loggedToday = memberLogs.some(l => l.date === today)
      const workedOutToday = memberLogs.some(l => l.date === today && l.workoutDone)
      const currentBmi = currentW && m.heightCm ? calculateBmi(currentW, m.heightCm) : null
      return {
        userId: m.userId,
        name: (m.userName ?? 'Member').split(' ')[0],
        isMe: m.userId === userId,
        startWeightKg: startW,
        goalWeightKg: m.goalWeightKg ?? null,
        currentWeightKg: currentW,
        weightLost,
        currentBmi,
        currentStreak: streaks.current,
        longestStreak: streaks.longest,
        totalWorkouts: memberLogs.filter(l => l.workoutDone).length,
        totalLogs: memberLogs.length,
        loggedToday,
        workedOutToday,
        latestWaistExtended: latestWaistLog?.waistExtendedCm ?? null,
        latestWaistSuckedin: latestWaistLog?.waistSuckedinCm ?? null,
        goalWaistExtendedCm: m.goalWaistExtendedCm ?? null,
        goalWaistSuckedinCm: m.goalWaistSuckedinCm ?? null,
        recentMoods: memberLogs.slice(0, 5).map(l => l.moodEmoji).join(' '),
        lastLogDaysAgo: latestLog ? daysSince(latestLog.date) : null,
      }
    })
  )

  // Sort squad by weight lost
  squadData.sort((a, b) => b.weightLost - a.weightLost)
  const me = squadData.find(m => m.isMe)!
  const myRank = squadData.findIndex(m => m.isMe) + 1

  // ── 4. Build challenge day context ─────────────────────────────────────────
  const startDate = new Date(challenge.startDate)
  const dayNumber = Math.max(1, Math.floor((new Date().getTime() - startDate.getTime()) / 86400000) + 1)
  const daysLeft = Math.max(0, challenge.durationDays - dayNumber)

  // ── 5. Build Zara's data brief ─────────────────────────────────────────────
  const weightToGoal = me.goalWeightKg != null ? (me.currentWeightKg - me.goalWeightKg).toFixed(1) : null
  const goalBmi = myProfile?.goalWeightKg && myProfile?.heightCm
    ? calculateBmi(myProfile.goalWeightKg, myProfile.heightCm).toFixed(1)
    : null

  const mySection = `
=== ${me.name.toUpperCase()} (the one talking to you) ===
Challenge: Day ${dayNumber} of ${challenge.durationDays} — ${daysLeft} days left
Start weight: ${me.startWeightKg}kg → Current: ${me.currentWeightKg.toFixed(1)}kg → Goal: ${me.goalWeightKg ?? '?'}kg
Weight lost so far: ${me.weightLost.toFixed(1)}kg${weightToGoal ? ` | ${weightToGoal}kg still to lose` : ''}
${me.currentBmi ? `Current BMI: ${me.currentBmi.toFixed(1)}${goalBmi ? ` → Goal BMI: ${goalBmi}` : ''}` : ''}
${me.latestWaistExtended ? `Waist belly-out: ${me.latestWaistExtended}cm${me.goalWaistExtendedCm ? ` (goal: ${me.goalWaistExtendedCm}cm)` : ''}` : ''}
${me.latestWaistSuckedin ? `Waist sucked-in: ${me.latestWaistSuckedin}cm${me.goalWaistSuckedinCm ? ` (goal: ${me.goalWaistSuckedinCm}cm)` : ''}` : ''}
Current streak: ${me.currentStreak} days 🔥 | Longest ever: ${me.longestStreak} days
Total workouts: ${me.totalWorkouts} | Total logs: ${me.totalLogs}
Logged today: ${me.loggedToday ? 'YES' : 'NOT YET'} | Worked out today: ${me.workedOutToday ? 'YES ✅' : 'NO'}
Recent moods: ${me.recentMoods || 'no data yet'}
Squad rank: #${myRank} of ${squadData.length}`.trim()

  const squadSection = squadData.length > 1
    ? `\n\n=== THE SQUAD (everyone in the challenge) ===\n` +
      squadData.map((m, i) => {
        const tag = m.isMe ? ' ← THIS IS THEM' : ''
        return `#${i + 1} ${m.name}: lost ${m.weightLost.toFixed(1)}kg | streak ${m.currentStreak}d | ${m.totalWorkouts} workouts | ${m.loggedToday ? 'logged today ✅' : 'not logged today'}${tag}`
      }).join('\n')
    : ''

  const contextBlock = mySection + squadSection

  // ── 6. Stream response ─────────────────────────────────────────────────────
  const stream = await client.messages.stream({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    system: ZARA_SYSTEM + `\n\n--- LIVE DATA BRIEF ---\n${contextBlock}\n--- END BRIEF ---\n\nUse this data to make every response razor-specific. Call out exact numbers. Notice patterns. Never be vague.`,
    messages: [{ role: 'user', content: userMessage }],
  })

  return streamResponse(stream)
}

function streamResponse(stream: ReturnType<Anthropic['messages']['stream']>) {
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
