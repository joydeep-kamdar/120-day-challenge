import { describe, it, expect } from 'vitest'
import { evaluateBadges } from '@/lib/badges'
import type { WeeklyCheckin, DailyLog } from '@/types'
import { format, subDays } from 'date-fns'

function makeCheckin(week: number, weightKg: number): WeeklyCheckin {
  return {
    id: String(week),
    userId: 'u1',
    challengeId: 'c1',
    weekNumber: week,
    date: format(subDays(new Date(), (17 - week) * 7), 'yyyy-MM-dd'),
    weightKg,
    waistExtendedCm: 90,
    waistSuckedinCm: 85,
    bmi: 25,
    createdAt: new Date().toISOString(),
  }
}

describe('evaluateBadges', () => {
  it('awards first_checkin on first check-in', () => {
    const result = evaluateBadges([], [makeCheckin(1, 85)], [], 85, 75, false)
    expect(result.newBadges).toContain('first_checkin')
    expect(result.newBadges).toContain('week_1_done')
  })

  it('does not re-award existing badges', () => {
    const result = evaluateBadges(['first_checkin', 'week_1_done'], [makeCheckin(1, 85)], [], 85, 75, false)
    expect(result.newBadges).toHaveLength(0)
  })

  it('awards weight_down_5 when 5kg lost', () => {
    const result = evaluateBadges([], [makeCheckin(4, 80)], [], 85, 75, false)
    expect(result.newBadges).toContain('weight_down_5')
  })

  it('awards goal_reached when at or below goal weight', () => {
    const result = evaluateBadges([], [makeCheckin(8, 75)], [], 85, 75, false)
    expect(result.newBadges).toContain('goal_reached')
  })

  it('awards first_shoutout when shoutout sent', () => {
    const result = evaluateBadges([], [], [], 85, 75, true)
    expect(result.newBadges).toContain('first_shoutout')
  })

  it('awards week_4_done at week 4', () => {
    const checkins = [1, 2, 3, 4].map(w => makeCheckin(w, 84))
    const result = evaluateBadges([], checkins, [], 85, 75, false)
    expect(result.newBadges).toContain('week_4_done')
  })
})
