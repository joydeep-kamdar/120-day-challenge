'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Flame, Zap, Target, Trophy, ChevronRight, Plus } from 'lucide-react'
import { getBmiLabel, getBmiColor, calculateBmi } from '@/lib/bmi'
import { getDaysRemaining, getWeekNumber } from '@/lib/streaks'
import { getBadgeDefinition } from '@/lib/badges'
import type { StreakResult } from '@/lib/streaks'
import { format } from 'date-fns'

interface Props {
  user: { id: string; name: string; image: string | null }
  challenge: {
    id: string
    name: string
    startDate: Date
    durationDays: number
  }
  streaks: StreakResult
  latestCheckin: { weightKg: number; bmi: number; date: string } | null
  profile: { heightCm: number; startWeightKg: number; goalWeightKg: number; photoUrl: string | null } | null
  progressPercent: number
  weightLost: number
  totalWorkouts: number
  badges: Array<{ badgeType: string; earnedAt: Date }>
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

export function DashboardClient({
  user,
  challenge,
  streaks,
  latestCheckin,
  profile,
  progressPercent,
  weightLost,
  totalWorkouts,
  badges,
}: Props) {
  const startDate = new Date(challenge.startDate)
  const weekNumber = getWeekNumber(startDate.toISOString().split('T')[0])
  const daysRemaining = getDaysRemaining(startDate.toISOString().split('T')[0], challenge.durationDays)
  const currentBmi = latestCheckin?.bmi ?? (profile ? calculateBmi(profile.startWeightKg, profile.heightCm) : null)

  const today = format(new Date(), 'yyyy-MM-dd')
  const hasLoggedToday = false // This would be checked against daily logs

  return (
    <div className="space-y-4 py-2">
      {/* Header */}
      <motion.div {...fadeUp} transition={{ delay: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm">Welcome back 👋</p>
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {user.name.split(' ')[0]}
            </h1>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Week {weekNumber}</p>
            <p className="text-sm font-semibold text-brand-orange">{daysRemaining}d left</p>
          </div>
        </div>
      </motion.div>

      {/* Progress bar */}
      <motion.div {...fadeUp} transition={{ delay: 0.05 }}>
        <div className="rounded-2xl bg-card border border-border p-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{challenge.name}</span>
            <span className="text-brand-orange font-semibold">{progressPercent}% to goal</span>
          </div>
          <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
            <motion.div
              className="h-full rounded-full gradient-orange"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Day {challenge.durationDays - daysRemaining}</span>
            <span>{challenge.durationDays} days</span>
          </div>
        </div>
      </motion.div>

      {/* Stats grid */}
      <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<Flame className="w-5 h-5" style={{ color: 'oklch(0.72 0.22 45)' }} />}
          label="Current Streak"
          value={`${streaks.current}d`}
          sub={`Best: ${streaks.longest}d`}
          glow="orange"
        />
        <StatCard
          icon={<Zap className="w-5 h-5" style={{ color: 'oklch(0.86 0.27 135)' }} />}
          label="Workouts"
          value={totalWorkouts.toString()}
          sub="Total done"
          glow="lime"
        />
        <StatCard
          icon={<Target className="w-5 h-5" style={{ color: 'oklch(0.62 0.27 350)' }} />}
          label="Weight Lost"
          value={`${weightLost.toFixed(1)}kg`}
          sub={`${profile?.goalWeightKg ?? '—'}kg goal`}
          glow="pink"
        />
        <StatCard
          icon={<Trophy className="w-5 h-5" style={{ color: 'oklch(0.65 0.18 250)' }} />}
          label="BMI"
          value={currentBmi?.toFixed(1) ?? '—'}
          sub={currentBmi ? getBmiLabel(currentBmi) : 'No data'}
          glow="blue"
          valueColor={currentBmi ? getBmiColor(currentBmi) : undefined}
        />
      </motion.div>

      {/* Today's log CTA */}
      <motion.div {...fadeUp} transition={{ delay: 0.15 }}>
        <Link href="/log">
          <div className={`rounded-2xl p-4 border transition-all ${
            hasLoggedToday
              ? 'border-brand-lime/30 bg-brand-lime/5'
              : 'border-brand-orange/30 gradient-card glow-orange'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Today</p>
                <p className="font-semibold">
                  {hasLoggedToday ? '✅ Logged!' : "Log today's workout"}
                </p>
                {!hasLoggedToday && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Keep the streak alive 🔥
                  </p>
                )}
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                hasLoggedToday ? 'bg-brand-lime/20' : 'gradient-orange'
              }`}>
                <Plus className={`w-5 h-5 ${hasLoggedToday ? 'text-brand-lime' : 'text-white'}`} />
              </div>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Weekly check-in */}
      <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
        <Link href="/check-in">
          <div className="rounded-2xl bg-card border border-border p-4 flex items-center justify-between hover:border-brand-pink/40 transition-colors">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Week {weekNumber}</p>
              <p className="font-semibold">Weekly Check-in</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {latestCheckin
                  ? `Last: ${latestCheckin.weightKg}kg on ${latestCheckin.date}`
                  : 'Log your measurements'}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </Link>
      </motion.div>

      {/* Badges */}
      {badges.length > 0 && (
        <motion.div {...fadeUp} transition={{ delay: 0.25 }}>
          <div className="rounded-2xl bg-card border border-border p-4 space-y-3">
            <p className="font-semibold text-sm">Your Badges</p>
            <div className="flex flex-wrap gap-2">
              {badges.slice(0, 8).map((b) => {
                const def = getBadgeDefinition(b.badgeType as Parameters<typeof getBadgeDefinition>[0])
                return (
                  <div
                    key={b.badgeType}
                    className="flex flex-col items-center gap-1 w-16"
                    title={def.description}
                  >
                    <span className="text-2xl">{def.emoji}</span>
                    <span className="text-[10px] text-muted-foreground text-center leading-tight">
                      {def.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  sub,
  glow,
  valueColor,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub: string
  glow: 'orange' | 'lime' | 'pink' | 'blue'
  valueColor?: string
}) {
  const glowClass = {
    orange: 'hover:glow-orange hover:border-brand-orange/40',
    lime: 'hover:glow-lime hover:border-brand-lime/40',
    pink: 'hover:glow-pink hover:border-brand-pink/40',
    blue: 'hover:border-brand-blue/40',
  }[glow]

  return (
    <div className={`rounded-2xl bg-card border border-border p-4 transition-all ${glowClass}`}>
      <div className="flex items-center gap-2 mb-2">{icon}<span className="text-xs text-muted-foreground">{label}</span></div>
      <p
        className="text-2xl font-bold tracking-tight"
        style={{ fontFamily: 'var(--font-heading)', color: valueColor }}
      >
        {value}
      </p>
      <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
    </div>
  )
}
