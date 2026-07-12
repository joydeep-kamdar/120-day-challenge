import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  real,
  primaryKey,
  unique,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import type { AdapterAccountType } from 'next-auth/adapters'

// ─── Auth.js required tables ────────────────────────────────────────────────

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').unique().notNull(),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  image: text('image'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
})

export const accounts = pgTable('accounts', {
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').$type<AdapterAccountType>().notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
}, (t) => [primaryKey({ columns: [t.provider, t.providerAccountId] })])

export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
})

export const verificationTokens = pgTable('verification_tokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
}, (t) => [primaryKey({ columns: [t.identifier, t.token] })])

// ─── App tables ──────────────────────────────────────────────────────────────

export const userProfiles = pgTable('user_profiles', {
  userId: text('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  photoUrl: text('photo_url'),
  heightCm: real('height_cm').notNull().default(170),
  startWeightKg: real('start_weight_kg').notNull(),
  goalWeightKg: real('goal_weight_kg').notNull(),
  goalWaistExtendedCm: real('goal_waist_extended_cm'),
  goalWaistSuckedinCm: real('goal_waist_suckedin_cm'),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
})

export const challenges = pgTable('challenges', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  inviteCode: text('invite_code').notNull().unique(),
  startDate: timestamp('start_date', { mode: 'date' }).notNull(),
  durationDays: integer('duration_days').notNull().default(120),
  createdBy: text('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
})

export const challengeMembers = pgTable('challenge_members', {
  challengeId: text('challenge_id').notNull().references(() => challenges.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: text('role', { enum: ['admin', 'member'] }).notNull().default('member'),
  joinedAt: timestamp('joined_at', { mode: 'date' }).defaultNow().notNull(),
}, (t) => [primaryKey({ columns: [t.challengeId, t.userId] })])

export const weeklyCheckins = pgTable('weekly_checkins', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  challengeId: text('challenge_id').notNull().references(() => challenges.id, { onDelete: 'cascade' }),
  weekNumber: integer('week_number').notNull(),
  date: text('date').notNull(),
  weightKg: real('weight_kg').notNull(),
  waistExtendedCm: real('waist_extended_cm').notNull(),
  waistSuckedinCm: real('waist_suckedin_cm').notNull(),
  bmi: real('bmi').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
}, (t) => [unique().on(t.userId, t.challengeId, t.weekNumber)])

export const dailyLogs = pgTable('daily_logs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  challengeId: text('challenge_id').notNull().references(() => challenges.id, { onDelete: 'cascade' }),
  date: text('date').notNull(),
  workoutDone: boolean('workout_done').notNull().default(false),
  workoutNote: text('workout_note'),
  moodEmoji: text('mood_emoji').notNull(),
  // Optional daily measurements (combined into one log per the design)
  weightKg: real('weight_kg'),
  waistExtendedCm: real('waist_extended_cm'),
  waistSuckedinCm: real('waist_suckedin_cm'),
  bmi: real('bmi'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
}, (t) => [unique().on(t.userId, t.challengeId, t.date)])

export const reactions = pgTable('reactions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  fromUserId: text('from_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  toLogId: text('to_log_id').notNull().references(() => dailyLogs.id, { onDelete: 'cascade' }),
  emoji: text('emoji').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
}, (t) => [unique().on(t.fromUserId, t.toLogId)])

export const logComments = pgTable('log_comments', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  logId: text('log_id').notNull().references(() => dailyLogs.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  text: text('text').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
})

export const shoutouts = pgTable('shoutouts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  fromUserId: text('from_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  toUserId: text('to_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  challengeId: text('challenge_id').notNull().references(() => challenges.id, { onDelete: 'cascade' }),
  message: text('message').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
})

export const badges = pgTable('badges', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  challengeId: text('challenge_id').notNull().references(() => challenges.id, { onDelete: 'cascade' }),
  badgeType: text('badge_type').notNull(),
  earnedAt: timestamp('earned_at', { mode: 'date' }).defaultNow().notNull(),
}, (t) => [unique().on(t.userId, t.challengeId, t.badgeType)])

export const milestones = pgTable('milestones', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  challengeId: text('challenge_id').notNull().references(() => challenges.id, { onDelete: 'cascade' }),
  milestoneType: text('milestone_type', { enum: ['day_30', 'day_60', 'day_90', 'day_120'] }).notNull(),
  revealed: boolean('revealed').notNull().default(false),
  rewardMessage: text('reward_message'),
  unlockedAt: timestamp('unlocked_at', { mode: 'date' }).defaultNow().notNull(),
}, (t) => [unique().on(t.userId, t.challengeId, t.milestoneType)])

// ─── Relations ───────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, { fields: [users.id], references: [userProfiles.userId] }),
  challengeMembers: many(challengeMembers),
  checkins: many(weeklyCheckins),
  dailyLogs: many(dailyLogs),
  badges: many(badges),
}))

export const challengesRelations = relations(challenges, ({ many }) => ({
  members: many(challengeMembers),
  checkins: many(weeklyCheckins),
  dailyLogs: many(dailyLogs),
}))

export const challengeMembersRelations = relations(challengeMembers, ({ one }) => ({
  user: one(users, { fields: [challengeMembers.userId], references: [users.id] }),
  challenge: one(challenges, { fields: [challengeMembers.challengeId], references: [challenges.id] }),
}))

export const reactionsRelations = relations(reactions, ({ one }) => ({
  fromUser: one(users, { fields: [reactions.fromUserId], references: [users.id] }),
  log: one(dailyLogs, { fields: [reactions.toLogId], references: [dailyLogs.id] }),
}))

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, { fields: [userProfiles.userId], references: [users.id] }),
}))

export const dailyLogsRelations = relations(dailyLogs, ({ one, many }) => ({
  user: one(users, { fields: [dailyLogs.userId], references: [users.id] }),
  reactions: many(reactions),
  comments: many(logComments),
}))

export const logCommentsRelations = relations(logComments, ({ one }) => ({
  log: one(dailyLogs, { fields: [logComments.logId], references: [dailyLogs.id] }),
  user: one(users, { fields: [logComments.userId], references: [users.id] }),
}))

export const weeklyCheckinsRelations = relations(weeklyCheckins, ({ one }) => ({
  user: one(users, { fields: [weeklyCheckins.userId], references: [users.id] }),
}))
