import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { challengeMembers, userProfiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { CheckInForm } from '@/components/checkin/CheckInForm'
import { getWeekNumber } from '@/lib/streaks'
import { format } from 'date-fns'

export default async function CheckInPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const userId = session.user.id

  const [membership, profile] = await Promise.all([
    db.query.challengeMembers.findFirst({
      where: eq(challengeMembers.userId, userId),
      with: { challenge: true },
    }),
    db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, userId),
    }),
  ])

  if (!membership) redirect('/dashboard')

  const startDate = membership.challenge.startDate.toISOString().split('T')[0]
  const weekNumber = getWeekNumber(startDate)

  return (
    <div className="py-2">
      <div className="mb-6">
        <p className="text-muted-foreground text-sm">Week {weekNumber}</p>
        <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
          Weekly Check-in
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {format(new Date(), 'EEEE, MMM d, yyyy')}
        </p>
      </div>
      <CheckInForm
        challengeId={membership.challengeId}
        startDate={startDate}
        heightCm={profile?.heightCm ?? 170}
        weekNumber={weekNumber}
      />
    </div>
  )
}
