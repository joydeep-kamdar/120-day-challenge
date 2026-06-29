'use client'

import { cn } from '@/lib/utils'
import { format, subDays } from 'date-fns'

interface Props {
  streakDates: Map<string, boolean>
}

export function StreakCalendar({ streakDates }: Props) {
  const days = Array.from(streakDates.entries()).reverse()

  return (
    <div className="rounded-2xl bg-card border border-border p-4">
      <p className="font-semibold text-sm mb-4">Workout Streak (last 60 days)</p>
      <div className="grid grid-cols-10 gap-1.5">
        {days.map(([date, done]) => (
          <div
            key={date}
            title={`${date}: ${done ? 'Workout done ✅' : 'Rest day'}`}
            className={cn(
              'aspect-square rounded-md transition-colors',
              done
                ? 'glow-lime'
                : 'bg-secondary'
            )}
            style={done ? { background: 'oklch(0.86 0.27 135)' } : undefined}
          />
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
        <div className="w-3 h-3 rounded-sm bg-secondary" />
        <span>Rest</span>
        <div className="w-3 h-3 rounded-sm ml-2" style={{ background: 'oklch(0.86 0.27 135)' }} />
        <span>Workout</span>
      </div>
    </div>
  )
}
