import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { getBmiLabel, getBmiColor } from '@/lib/bmi'

interface Props {
  member: {
    userId: string
    user: {
      id: string
      name: string | null
      image: string | null
      profile: { startWeightKg: number; goalWeightKg: number } | null
    }
  }
  isCurrentUser: boolean
  latestCheckin: { weightKg: number; bmi: number; weekNumber: number } | null
}

export function MemberCard({ member, isCurrentUser, latestCheckin }: Props) {
  return (
    <Link href={`/profile/${member.userId}`}>
      <div className="rounded-2xl bg-card border border-border p-4 flex items-center gap-3 hover:border-brand-orange/30 transition-colors">
        {/* Avatar */}
        {member.user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={member.user.image}
            alt={member.user.name ?? ''}
            className="w-12 h-12 rounded-full object-cover border border-border flex-shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-full gradient-orange flex items-center justify-center text-white font-bold flex-shrink-0">
            {member.user.name?.charAt(0).toUpperCase() ?? '?'}
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold truncate">{member.user.name ?? 'Anonymous'}</p>
            {isCurrentUser && (
              <span className="text-xs bg-brand-orange/20 text-brand-orange px-1.5 py-0.5 rounded-full">you</span>
            )}
          </div>
          {latestCheckin ? (
            <p className="text-sm text-muted-foreground">
              {latestCheckin.weightKg}kg ·{' '}
              <span style={{ color: getBmiColor(latestCheckin.bmi) }}>
                BMI {latestCheckin.bmi.toFixed(1)}
              </span>
              {' · '}Week {latestCheckin.weekNumber}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">No check-in yet</p>
          )}
        </div>

        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      </div>
    </Link>
  )
}
