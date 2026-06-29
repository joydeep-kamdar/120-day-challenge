import { describe, it, expect } from 'vitest'
import { calculateStreaks, getWeekNumber } from '@/lib/streaks'
import { format, subDays } from 'date-fns'
import type { DailyLog } from '@/types'

function makeLog(daysAgo: number, workoutDone = true): DailyLog {
  return {
    id: String(daysAgo),
    userId: 'u1',
    challengeId: 'c1',
    date: format(subDays(new Date(), daysAgo), 'yyyy-MM-dd'),
    workoutDone,
    workoutNote: null,
    moodEmoji: '💪',
    createdAt: new Date().toISOString(),
  }
}

describe('calculateStreaks', () => {
  it('returns zero streaks for empty logs', () => {
    expect(calculateStreaks([])).toEqual({ current: 0, longest: 0 })
  })

  it('returns zero streaks when no workouts done', () => {
    const logs = [makeLog(0, false), makeLog(1, false)]
    expect(calculateStreaks(logs)).toEqual({ current: 0, longest: 0 })
  })

  it('counts current streak from today', () => {
    const logs = [makeLog(0), makeLog(1), makeLog(2)]
    const result = calculateStreaks(logs)
    expect(result.current).toBe(3)
    expect(result.longest).toBe(3)
  })

  it('counts current streak from yesterday', () => {
    const logs = [makeLog(1), makeLog(2), makeLog(3)]
    const result = calculateStreaks(logs)
    expect(result.current).toBe(3)
  })

  it('breaks streak on gap', () => {
    // Logged today and 3 days ago (gap on day 1 and 2)
    const logs = [makeLog(0), makeLog(3), makeLog(4)]
    const result = calculateStreaks(logs)
    expect(result.current).toBe(1)
    expect(result.longest).toBe(2)
  })

  it('returns 0 current if last workout was 2+ days ago', () => {
    const logs = [makeLog(2), makeLog(3)]
    expect(calculateStreaks(logs).current).toBe(0)
  })
})

describe('getWeekNumber', () => {
  it('returns week 1 on start date', () => {
    const today = format(new Date(), 'yyyy-MM-dd')
    expect(getWeekNumber(today)).toBe(1)
  })

  it('returns week 2 after 7 days', () => {
    const startDate = format(subDays(new Date(), 7), 'yyyy-MM-dd')
    expect(getWeekNumber(startDate)).toBe(2)
  })

  it('returns week 3 after 14 days', () => {
    const startDate = format(subDays(new Date(), 14), 'yyyy-MM-dd')
    expect(getWeekNumber(startDate)).toBe(3)
  })
})
