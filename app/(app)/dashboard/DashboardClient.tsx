'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { calculateBmi, getBmiLabel, getBmiColor } from '@/lib/bmi'
import { getDaysRemaining } from '@/lib/streaks'
import { getBadgeDefinition } from '@/lib/badges'
import type { StreakResult } from '@/lib/streaks'

interface SquadMember {
  userId: string
  name: string
  image: string | null
  weightLost: number
  streak: number
  totalWorkouts: number
  isMe: boolean
}

interface WaistProgress {
  startExtended: number
  startSuckedin: number
  currentExtended: number
  currentSuckedin: number
  goalExtended: number
  goalSuckedin: number
}

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
  hasLoggedToday: boolean
  squadStandings: SquadMember[]
  waistProgress: WaistProgress | null
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
  hasLoggedToday,
  squadStandings,
  waistProgress,
}: Props) {
  const startDate = new Date(challenge.startDate)
  const startW = profile?.startWeightKg ?? 0
  const goalW = profile?.goalWeightKg ?? 0
  const curW = latestCheckin?.weightKg ?? startW
  const heightCm = profile?.heightCm ?? 0
  const bmiVal = heightCm > 0 ? calculateBmi(curW, heightCm) : null
  const bmiColor = bmiVal ? getBmiColor(bmiVal) : '#9ca3af'
  const wChange = curW - startW
  const goalDiff = curW - goalW
  const wChangeStr = wChange <= 0 ? `${wChange.toFixed(1)}kg` : `+${wChange.toFixed(1)}kg`
  const wChangeColor = wChange <= 0 ? '#22c55e' : '#ef4444'
  const daysRemaining = getDaysRemaining(startDate.toISOString().split('T')[0], challenge.durationDays)
  const todayPrompt = hasLoggedToday ? 'Workout logged!' : "Log today's check-in"
  const todaySub = hasLoggedToday ? 'Tap to update' : 'Weight · Waist · Workout · Mood'
  const todayIcon = hasLoggedToday ? '✅' : '📋'

  const goalBarStyle = {
    height: '6px',
    borderRadius: '3px',
    width: `${progressPercent}%`,
    background: 'linear-gradient(90deg,#6366f1,#ec4899)',
    transition: 'width 1s ease',
    minWidth: progressPercent > 0 ? '4px' : '0',
  }

  return (
    <div>
      {/* Weight hero card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg,#141414,#1a1320)',
            border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: '20px',
            padding: '20px',
            marginTop: '16px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '100px',
              height: '100px',
              background: 'radial-gradient(ellipse,rgba(99,102,241,0.2),transparent 70%)',
              pointerEvents: 'none',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#444', letterSpacing: '2px', marginBottom: '4px' }}>
                CURRENT WEIGHT
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '62px', lineHeight: 1, color: '#fff', letterSpacing: '-1px' }}>
                {curW.toFixed(1)}<span style={{ fontSize: '26px', color: '#444', marginLeft: '4px' }}>kg</span>
              </div>
            </div>
            <div style={{ textAlign: 'right', paddingBottom: '8px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600, color: wChangeColor }}>
                {wChangeStr}
              </div>
              {bmiVal && (
                <>
                  <div style={{
                    background: bmiColor + '1a',
                    border: `1px solid ${bmiColor}4d`,
                    borderRadius: '20px',
                    padding: '4px 10px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: bmiColor,
                    marginTop: '6px',
                    display: 'inline-block',
                  }}>
                    BMI {bmiVal.toFixed(1)}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#555', marginTop: '4px' }}>
                    {getBmiLabel(bmiVal)}
                  </div>
                </>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#444' }}>START {startW.toFixed(1)}kg</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#6366f1' }}>GOAL {goalW.toFixed(1)}kg</div>
          </div>
          <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
            <motion.div
              style={goalBarStyle}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
            />
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#444', marginTop: '5px', textAlign: 'right' }}>
            {goalDiff <= 0 ? 'Goal reached! 🎉' : `${goalDiff.toFixed(1)}kg to go`}
          </div>

          {/* Waist progress — only shown when goals are set */}
          {waistProgress && (
            <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              {/* Belly out */}
              <div style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#ec4899' }}>
                    WAIST OUT &nbsp;{waistProgress.currentExtended.toFixed(1)}cm
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#444' }}>
                    GOAL {waistProgress.goalExtended.toFixed(1)}cm
                  </div>
                </div>
                <div style={{ height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: '3px', background: '#ec4899',
                    width: `${Math.min(100, Math.max(0, ((waistProgress.startExtended - waistProgress.currentExtended) / (waistProgress.startExtended - waistProgress.goalExtended)) * 100))}%`,
                    transition: 'width 0.8s ease',
                  }} />
                </div>
              </div>
              {/* Sucked in */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#6366f1' }}>
                    WAIST IN &nbsp;{waistProgress.currentSuckedin.toFixed(1)}cm
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#444' }}>
                    GOAL {waistProgress.goalSuckedin.toFixed(1)}cm
                  </div>
                </div>
                <div style={{ height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: '3px', background: '#6366f1',
                    width: `${Math.min(100, Math.max(0, ((waistProgress.startSuckedin - waistProgress.currentSuckedin) / (waistProgress.startSuckedin - waistProgress.goalSuckedin)) * 100))}%`,
                    transition: 'width 0.8s ease',
                  }} />
                </div>
              </div>
            </div>
          )}

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '16px',
            paddingTop: '14px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}>
            <span style={{ fontSize: '20px' }}>🔥</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: '#f59e0b' }}>
              {streaks.current} DAY STREAK
            </span>
          </div>
        </div>
      </motion.div>

      {/* TODAY */}
      <div className="slabel">TODAY</div>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Link href="/log" style={{ textDecoration: 'none' }}>
          <div
            className="card-base"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '26px' }}>{todayIcon}</div>
              <div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 600, color: '#fff' }}>
                  {todayPrompt}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#444', marginTop: '2px' }}>
                  {todaySub}
                </div>
              </div>
            </div>
            <div style={{ color: '#333', fontSize: '18px' }}>→</div>
          </div>
        </Link>
      </motion.div>

      {/* BADGES */}
      {badges.length > 0 && (
        <>
          <div className="slabel">BADGES</div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}
          >
            {badges.slice(0, 8).map((b) => {
              const def = getBadgeDefinition(b.badgeType as Parameters<typeof getBadgeDefinition>[0])
              return (
                <div
                  key={b.badgeType}
                  style={{
                    background: 'rgba(99,102,241,0.12)',
                    border: '1px solid rgba(99,102,241,0.25)',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    minWidth: '72px',
                  }}
                >
                  <div style={{ fontSize: '22px' }}>{def.emoji}</div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 600, color: '#fff', marginTop: '4px' }}>
                    {def.label}
                  </div>
                </div>
              )
            })}
          </motion.div>
        </>
      )}

      {/* SQUAD STANDINGS */}
      <div className="slabel">SQUAD STANDINGS</div>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {squadStandings.slice(0, 3).map((member, i) => {
            const medals = ['🥇', '🥈', '🥉']
            const initial = member.name.charAt(0).toUpperCase()
            return (
              <div
                key={member.userId}
                className="card-base"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  border: member.isMe ? '1px solid rgba(99,102,241,0.35)' : undefined,
                  background: member.isMe ? 'rgba(99,102,241,0.06)' : undefined,
                }}
              >
                <div style={{ fontSize: '18px', width: '26px', textAlign: 'center' }}>{medals[i] ?? `#${i + 1}`}</div>
                {member.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={member.image} alt={member.name} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(99,102,241,0.4)', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(99,102,241,0.15)', border: '2px solid #6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '14px', color: '#818cf8', flexShrink: 0 }}>
                    {initial}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 600, color: '#fff' }}>
                    {member.name.split(' ')[0]}{member.isMe ? ' (you)' : ''}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#444' }}>
                    🔥 {member.streak}d · {member.totalWorkouts} workouts
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: member.weightLost > 0 ? '#22c55e' : '#555' }}>
                  {member.weightLost > 0 ? `-${member.weightLost.toFixed(1)}` : '0.0'}kg
                </div>
              </div>
            )
          })}
        </div>
        <div style={{ marginTop: '10px', textAlign: 'center' }}>
          <Link href="/group" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#6366f1', letterSpacing: '1px', textDecoration: 'none' }}>
            SEE FULL LEADERBOARD →
          </Link>
        </div>
      </motion.div>

      {/* Bottom spacer */}
      <div style={{ height: '32px' }} />
    </div>
  )
}
