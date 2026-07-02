import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { challengeMembers, dailyLogs, weeklyCheckins, userProfiles, badges, users } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { DashboardClient } from './DashboardClient'
import { calculateStreaks } from '@/lib/streaks'
import { getWeightProgress } from '@/lib/bmi'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const userId = session.user.id

  const membership = await db.query.challengeMembers.findFirst({
    where: eq(challengeMembers.userId, userId),
    with: { challenge: true },
  })

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
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#444', marginBottom: '24px', letterSpacing: '1px' }}>
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

  // Fetch my data + all squad members in parallel
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
    // All members with their user info and profile
    db
      .select({
        userId: challengeMembers.userId,
        userName: users.name,
        userImage: users.image,
        startWeightKg: userProfiles.startWeightKg,
      })
      .from(challengeMembers)
      .leftJoin(users, eq(users.id, challengeMembers.userId))
      .leftJoin(userProfiles, eq(userProfiles.userId, challengeMembers.userId))
      .where(eq(challengeMembers.challengeId, challenge.id)),
  ])

  // Fetch latest log weight for each member
  const squadWithStats = await Promise.all(
    allMembers.map(async (member) => {
      const latestLog = await db.query.dailyLogs.findFirst({
        where: and(
          eq(dailyLogs.userId, member.userId),
          eq(dailyLogs.challengeId, challenge.id)
        ),
        orderBy: [desc(dailyLogs.date)],
      })
      const memberLogs = await db.query.dailyLogs.findMany({
        where: and(
          eq(dailyLogs.userId, member.userId),
          eq(dailyLogs.challengeId, challenge.id)
        ),
        orderBy: [desc(dailyLogs.date)],
      })
      const streaks = calculateStreaks(memberLogs as Parameters<typeof calculateStreaks>[0])
      const startW = member.startWeightKg ?? 0
      const currentW = latestLog?.weightKg ?? startW
      const weightLost = startW - currentW
      return {
        userId: member.userId,
        name: member.userName ?? 'Member',
        image: member.userImage ?? null,
        weightLost,
        streak: streaks.current,
        totalWorkouts: memberLogs.filter(l => l.workoutDone).length,
        isMe: member.userId === userId,
      }
    })
  )

  // Sort by weight lost descending
  squadWithStats.sort((a, b) => b.weightLost - a.weightLost)

  const today = new Date().toISOString().split('T')[0]
  const streaks = calculateStreaks(myLogs as Parameters<typeof calculateStreaks>[0])
  const latestCheckin = myCheckins[0] ?? null
  const startWeight = profile?.startWeightKg ?? 0
  const goalWeight = profile?.goalWeightKg ?? 0
  const currentWeight = (myLogs[0]?.weightKg) ?? startWeight
  const progressPercent = getWeightProgress(currentWeight, startWeight, goalWeight)
  const weightLost = startWeight - currentWeight
  const hasLoggedToday = myLogs.some(l => l.date === today)

  // Waist progress — derive start from earliest log that has waist data
  const logsChron = [...myLogs].reverse()
  const firstWaistLog = logsChron.find(l => l.waistExtendedCm != null)
  const latestWaistLog = myLogs.find(l => l.waistExtendedCm != null)
  const waistProgress = profile?.goalWaistExtendedCm && firstWaistLog && latestWaistLog ? {
    startExtended: firstWaistLog.waistExtendedCm!,
    startSuckedin: firstWaistLog.waistSuckedinCm ?? firstWaistLog.waistExtendedCm!,
    currentExtended: latestWaistLog.waistExtendedCm!,
    currentSuckedin: latestWaistLog.waistSuckedinCm ?? latestWaistLog.waistExtendedCm!,
    goalExtended: profile.goalWaistExtendedCm,
    goalSuckedin: profile.goalWaistSuckedinCm ?? profile.goalWaistExtendedCm,
  } : null

  return (
    <DashboardClient
      user={{ id: userId, name: session.user.name ?? 'You', image: session.user.image ?? null }}
      challenge={challenge}
      streaks={streaks}
      latestCheckin={latestCheckin}
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
