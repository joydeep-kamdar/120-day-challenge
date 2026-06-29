import type { BadgeDefinition, BadgeType, DailyLog, WeeklyCheckin } from '@/types'
import { calculateStreaks } from './streaks'

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  { type: 'first_checkin', emoji: '🌟', label: 'First Step', description: 'Completed your first check-in' },
  { type: 'week_1_done', emoji: '🔥', label: 'Week 1 Warrior', description: 'Survived week 1' },
  { type: 'week_4_done', emoji: '💪', label: '1 Month Strong', description: 'Completed 4 weeks' },
  { type: 'week_8_done', emoji: '⚡', label: 'Halfway Hero', description: 'Completed 8 weeks' },
  { type: 'week_12_done', emoji: '🏆', label: '3 Month Legend', description: 'Completed 12 weeks' },
  { type: 'challenge_complete', emoji: '👑', label: 'Challenge Champion', description: 'Completed the full 120 days' },
  { type: 'streak_7', emoji: '7️⃣', label: '7-Day Streak', description: '7 days in a row' },
  { type: 'streak_14', emoji: '🔥', label: '2 Week Grind', description: '14 days in a row' },
  { type: 'streak_30', emoji: '💎', label: '30-Day Diamond', description: '30 days straight' },
  { type: 'streak_60', emoji: '🌈', label: '60-Day Legend', description: '60 consecutive days' },
  { type: 'weight_down_5', emoji: '📉', label: 'Down 5kg', description: 'Lost your first 5kg' },
  { type: 'weight_down_10', emoji: '🎯', label: 'Down 10kg', description: 'Lost 10kg total' },
  { type: 'goal_reached', emoji: '🥇', label: 'Goal Crusher', description: 'Hit your goal weight' },
  { type: 'first_shoutout', emoji: '📣', label: 'Hype Man', description: 'Sent your first shoutout' },
]

export function getBadgeDefinition(type: BadgeType): BadgeDefinition {
  return BADGE_DEFINITIONS.find((b) => b.type === type) ?? {
    type,
    emoji: '🏅',
    label: type,
    description: '',
  }
}

export interface BadgeEvalResult {
  newBadges: BadgeType[]
}

export function evaluateBadges(
  existingBadges: BadgeType[],
  checkins: WeeklyCheckin[],
  dailyLogs: DailyLog[],
  startWeight: number,
  goalWeight: number,
  hasShoutout: boolean
): BadgeEvalResult {
  const earned = new Set(existingBadges)
  const newBadges: BadgeType[] = []

  function award(type: BadgeType) {
    if (!earned.has(type)) {
      earned.add(type)
      newBadges.push(type)
    }
  }

  if (checkins.length >= 1) award('first_checkin')

  const maxWeek = checkins.length > 0
    ? Math.max(...checkins.map((c) => c.weekNumber))
    : 0
  if (maxWeek >= 1) award('week_1_done')
  if (maxWeek >= 4) award('week_4_done')
  if (maxWeek >= 8) award('week_8_done')
  if (maxWeek >= 12) award('week_12_done')
  if (maxWeek >= 17) award('challenge_complete')

  const { current, longest } = calculateStreaks(dailyLogs)
  const maxStreak = Math.max(current, longest)
  if (maxStreak >= 7) award('streak_7')
  if (maxStreak >= 14) award('streak_14')
  if (maxStreak >= 30) award('streak_30')
  if (maxStreak >= 60) award('streak_60')

  const latestCheckin = checkins.at(-1)
  if (latestCheckin) {
    const lost = startWeight - latestCheckin.weightKg
    if (lost >= 5) award('weight_down_5')
    if (lost >= 10) award('weight_down_10')
    if (latestCheckin.weightKg <= goalWeight) award('goal_reached')
  }

  if (hasShoutout) award('first_shoutout')

  return { newBadges }
}
