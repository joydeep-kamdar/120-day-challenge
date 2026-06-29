export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Challenge {
  id: string
  name: string
  slug: string
  inviteCode: string
  startDate: Date
  durationDays: number
  createdBy: string
  createdAt: Date
}

export interface User {
  id: string
  email: string
  name: string | null
  image: string | null
  createdAt: Date
}

export interface UserProfile {
  userId: string
  photoUrl: string | null
  heightCm: number
  startWeightKg: number
  goalWeightKg: number
}

export interface WeeklyCheckin {
  id: string
  userId: string
  challengeId: string
  weekNumber: number
  date: string
  weightKg: number
  waistExtendedCm: number
  waistSuckedinCm: number
  bmi: number
  createdAt: Date | string
}

export interface DailyLog {
  id: string
  userId: string
  challengeId: string
  date: string
  workoutDone: boolean
  workoutNote: string | null
  moodEmoji: MoodEmoji
  createdAt: Date | string
}

export interface Reaction {
  id: string
  fromUserId: string
  toLogId: string
  emoji: string
  createdAt: Date | string
}

export interface Shoutout {
  id: string
  fromUserId: string
  toUserId: string
  challengeId: string
  message: string
  createdAt: Date | string
}

export interface Badge {
  id: string
  userId: string
  challengeId: string
  badgeType: string
  earnedAt: Date | string
}

export type MoodEmoji = '😄' | '😊' | '😐' | '😓' | '💪' | '🔥'

export type BadgeType =
  | 'first_checkin'
  | 'week_1_done'
  | 'week_4_done'
  | 'week_8_done'
  | 'week_12_done'
  | 'challenge_complete'
  | 'streak_7'
  | 'streak_14'
  | 'streak_30'
  | 'streak_60'
  | 'weight_down_5'
  | 'weight_down_10'
  | 'goal_reached'
  | 'first_shoutout'

export type MilestoneType = 'day_30' | 'day_60' | 'day_90' | 'day_120'

export interface BadgeDefinition {
  type: BadgeType
  label: string
  emoji: string
  description: string
}
