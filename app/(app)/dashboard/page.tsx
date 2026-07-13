import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { dailyLogs, weeklyCheckins, userProfiles, badges, users, challengeMembers } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { DashboardClient } from './DashboardClient'
import { calculateStreaks } from '@/lib/streaks'
import { getWeightProgress } from '@/lib/bmi'
import { getActiveMembership } from '@/lib/active-challenge'
import { calcOverallScore, calcWeeklyScore } from '@/lib/scoring'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const userId = session.user.id

  const { membership } = await getActiveMembership(userId)

  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, userId),
  })

  if (!membership) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: '0 24px' }}>
        <span style={{ fontSize: '48px', marginBottom: '16px' }}>🔥</span>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', letterSpacing: '2px', color: '#fff', marginBottom: '8px' }}>
          NO CHALLENGE YET
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#9ca3af', marginBottom: '24px', letterSpacing: '1px' }}>
          Create one or join with an invite link
        </div>
        <a
          href="/challenge/new"
          style={{
            padding: '16px 32px',
            background: 'linear-gradient(135deg,#6366f1,#ec4899)',
            borderRadius: '14px',
            fontFamily: 'var(--font-display)',
            fontSize: '20px',
            letterSpacing: '2px',
            color: '#fff',
            textDecoration: 'none',
          }}
        >
          CREATE A CHALLENGE
        </a>
      </div>
    )
  }

  const challenge = membership.challenge

  const today   = new Date().toISOString().split('T')[0]
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]
  const daysElapsed = Math.max(
    1,
    Math.floor((Date.now() - new Date(challenge.startDate).getTime()) / 86400000),
  )

  const [myLogs, myCheckins, myBadges, allMembers] = await Promise.all([
    db.query.dailyLogs.findMany({
      where: and(eq(dailyLogs.userId, userId), eq(dailyLogs.challengeId, challenge.id)),
      orderBy: [desc(dailyLogs.date)],
    }),
    db.query.weeklyCheckins.findMany({
      where: and(eq(weeklyCheckins.userId, userId), eq(weeklyCheckins.challengeId, challenge.id)),
      orderBy: [desc(weeklyCheckins.date)],
    }),
    db.query.badges.findMany({
      where: and(eq(badges.userId, userId), eq(badges.challengeId, challenge.id)),
    }),
    db
      .select({
        userId:        challengeMembers.userId,
        userName:      users.name,
        userImage:     users.image,
        startWeightKg: userProfiles.startWeightKg,
      })
      .from(challengeMembers)
      .leftJoin(users,         eq(users.id,         challengeMembers.userId))
      .leftJoin(userProfiles,  eq(userProfiles.userId, challengeMembers.userId))
      .where(eq(challengeMembers.challengeId, challenge.id)),
  ])

  const squadWithStats = await Promise.all(
    allMembers.map(async (member) => {
      const memberLogs = await db.query.dailyLogs.findMany({
        where: and(
          eq(dailyLogs.userId,      member.userId),
          eq(dailyLogs.challengeId, challenge.id),
        ),
        orderBy: [desc(dailyLogs.date)],
      })

      const streaks       = calculateStreaks(memberLogs as Parameters<typeof calculateStreaks>[0])
      const logsChron     = [...memberLogs].reverse()

      const startW        = member.startWeightKg ?? 0
      const latestWeightLog = memberLogs.find(l => l.weightKg != null)
      const currentW      = latestWeightLog?.weightKg ?? startW

      // Waist — use earliest and latest log that has waist data
      const firstWaistLog  = logsChron.find(l => l.waistExtendedCm != null)
      const latestWaistLog = memberLogs.find(l => l.waistExtendedCm != null)

      // ── Overall score ────────────────────────────────────────────────────
      const overall = calcOverallScore({
        startWeightKg:  startW,
        currentWeightKg: currentW,
        firstWaistCm:  firstWaistLog?.waistExtendedCm  ?? null,
        latestWaistCm: latestWaistLog?.waistExtendedCm ?? null,
        totalLogs:     memberLogs.length,
        daysElapsed,
      })

      // ── Weekly score ─────────────────────────────────────────────────────
      const thisWeekLogs = memberLogs.filter(l => l.date >= weekAgo)
      const prevLogs     = memberLogs.filter(l => l.date <  weekAgo)

      // Baselines: latest reading from before the 7-day window (fallback: start values)
      const prevWeightLog = prevLogs.find(l => l.weightKg       != null)
      const prevWaistLog  = prevLogs.find(l => l.waistExtendedCm != null)

      const thisWeekWeightLog = thisWeekLogs.find(l => l.weightKg       != null)
      const thisWeekWaistLog  = thisWeekLogs.find(l => l.waistExtendedCm != null)

      const weekly = calcWeeklyScore({
        prevWeightKg:     prevWeightLog?.weightKg       ?? (startW > 0 ? startW : null),
        thisWeekWeightKg: thisWeekWeightLog?.weightKg   ?? null,
        prevWaistCm:      prevWaistLog?.waistExtendedCm ?? null,
        thisWeekWaistCm:  thisWeekWaistLog?.waistExtendedCm ?? null,
        logsThisWeek:     thisWeekLogs.length,
      })

      return {
        userId:       member.userId,
        name:         member.userName ?? 'Member',
        image:        member.userImage ?? null,
        overall,
        weekly,
        streak:         streaks.current,
        totalWorkouts:  memberLogs.filter(l => l.workoutDone).length,
        isMe:           member.userId === userId,
        // Keep for legacy display on weight-lost hero card
        weightLost: startW - currentW,
      }
    }),
  )

  // Sort by overall score descending (dashboard default view)
  squadWithStats.sort((a, b) => b.overall.total - a.overall.total)

  const streaks       = calculateStreaks(myLogs as Parameters<typeof calculateStreaks>[0])
  const latestCheckin = myCheckins[0] ?? null
  const startWeight   = profile?.startWeightKg ?? 0
  const goalWeight    = profile?.goalWeightKg  ?? 0

  // Most recent weight reading across both daily logs and weekly check-ins, by date.
  const latestWeightLog = myLogs.find(l => l.weightKg != null)
  const currentWeight =
    latestWeightLog && (!latestCheckin || latestWeightLog.date >= latestCheckin.date)
      ? latestWeightLog.weightKg!
      : latestCheckin?.weightKg ?? startWeight

  const progressPercent = getWeightProgress(currentWeight, startWeight, goalWeight)
  const weightLost    = startWeight - currentWeight
  const hasLoggedToday = myLogs.some(l => l.date === today)

  const logsChron       = [...myLogs].reverse()
  const firstWaistLog   = logsChron.find(l => l.waistExtendedCm != null)
  const latestWaistLog  = myLogs.find(l => l.waistExtendedCm != null)
  const waistProgress   = profile?.goalWaistExtendedCm && firstWaistLog && latestWaistLog
    ? {
        startExtended:   firstWaistLog.waistExtendedCm!,
        startSuckedin:   firstWaistLog.waistSuckedinCm  ?? firstWaistLog.waistExtendedCm!,
        currentExtended: latestWaistLog.waistExtendedCm!,
        currentSuckedin: latestWaistLog.waistSuckedinCm ?? latestWaistLog.waistExtendedCm!,
        goalExtended:    profile.goalWaistExtendedCm,
        goalSuckedin:    profile.goalWaistSuckedinCm ?? profile.goalWaistExtendedCm,
      }
    : null

  return (
    <DashboardClient
      user={{ id: userId, name: session.user.name ?? 'You', image: session.user.image ?? null }}
      challenge={challenge}
      streaks={streaks}
      currentWeightKg={currentWeight}
      profile={profile ?? null}
      progressPercent={progressPercent}
      weightLost={weightLost}
      totalWorkouts={myLogs.filter(l => l.workoutDone).length}
      badges={myBadges}
      hasLoggedToday={hasLoggedToday}
      squadStandings={squadWithStats}
      waistProgress={waistProgress}
    />
  )
}
