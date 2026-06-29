import type { DailyLog } from '@/types'
import { format, parseISO, differenceInDays, subDays } from 'date-fns'

export interface StreakResult {
  current: number
  longest: number
}

export function calculateStreaks(logs: DailyLog[]): StreakResult {
  const workoutDates = new Set(
    logs.filter((l) => l.workoutDone).map((l) => l.date)
  )

  if (workoutDates.size === 0) return { current: 0, longest: 0 }

  const today = format(new Date(), 'yyyy-MM-dd')
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')

  const sorted = Array.from(workoutDates).sort().reverse()

  let current = 0
  if (workoutDates.has(today) || workoutDates.has(yesterday)) {
    const startFrom = workoutDates.has(today) ? today : yesterday
    let checkDate = parseISO(startFrom)
    while (workoutDates.has(format(checkDate, 'yyyy-MM-dd'))) {
      current++
      checkDate = subDays(checkDate, 1)
    }
  }

  let longest = 0
  let streak = 1
  for (let i = 1; i < sorted.length; i++) {
    const prev = parseISO(sorted[i - 1])
    const curr = parseISO(sorted[i])
    if (differenceInDays(prev, curr) === 1) {
      streak++
      longest = Math.max(longest, streak)
    } else {
      streak = 1
    }
  }
  longest = Math.max(longest, streak, current)

  return { current, longest }
}

export function getStreakDatesForCalendar(
  logs: DailyLog[],
  days = 30
): Map<string, boolean> {
  const result = new Map<string, boolean>()
  const workoutDates = new Set(
    logs.filter((l) => l.workoutDone).map((l) => l.date)
  )
  for (let i = 0; i < days; i++) {
    const date = format(subDays(new Date(), i), 'yyyy-MM-dd')
    result.set(date, workoutDates.has(date))
  }
  return result
}

export function getWeekNumber(startDate: string): number {
  const start = parseISO(startDate)
  const today = new Date()
  const diff = differenceInDays(today, start)
  return Math.floor(diff / 7) + 1
}

export function getDaysRemaining(startDate: string, durationDays: number): number {
  const start = parseISO(startDate)
  const end = new Date(start.getTime() + durationDays * 24 * 60 * 60 * 1000)
  const remaining = differenceInDays(end, new Date())
  return Math.max(0, remaining)
}
