'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MoodPicker } from './MoodPicker'
import { toast } from 'sonner'
import { calculateBmi } from '@/lib/bmi'
import { useRouter } from 'next/navigation'
import type { MoodEmoji } from '@/types'
import { saveDailyLog } from '@/app/actions/log'

const MOODS: MoodEmoji[] = ['😤', '💪', '🔥', '😊', '😅', '⚡', '🤙', '😴']

interface Props {
  challengeId: string
  existingLog: {
    workoutDone: boolean
    workoutNote: string | null
    moodEmoji: string
    weightKg?: number | null
    waistExtendedCm?: number | null
    waistSuckedinCm?: number | null
  } | null
  today: string
  heightCm: number | null
}

export function DailyLogForm({ challengeId, existingLog, today, heightCm }: Props) {
  const router = useRouter()
  const [workoutDone, setWorkoutDone] = useState(existingLog?.workoutDone ?? false)
  const [note, setNote] = useState(existingLog?.workoutNote ?? '')
  const [mood, setMood] = useState<MoodEmoji | null>((existingLog?.moodEmoji as MoodEmoji) ?? null)
  const [weight, setWeight] = useState(existingLog?.weightKg?.toString() ?? '')
  const [waistExt, setWaistExt] = useState(existingLog?.waistExtendedCm?.toString() ?? '')
  const [waistIn, setWaistIn] = useState(existingLog?.waistSuckedinCm?.toString() ?? '')
  const [isPending, startTransition] = useTransition()

  const parsedWeight = parseFloat(weight)
  const liveBmi = parsedWeight > 0 && heightCm ? calculateBmi(parsedWeight, heightCm) : null

  const todayStr = new Date(today + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  }).toUpperCase()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!mood) {
      toast.error('Pick your mood first!')
      return
    }

    startTransition(async () => {
      const result = await saveDailyLog({
        challengeId,
        date: today,
        workoutDone,
        workoutNote: note.trim() || null,
        moodEmoji: mood,
        weightKg: parsedWeight > 0 ? parsedWeight : null,
        waistExtendedCm: parseFloat(waistExt) > 0 ? parseFloat(waistExt) : null,
        waistSuckedinCm: parseFloat(waistIn) > 0 ? parseFloat(waistIn) : null,
        heightCm,
      })

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success(workoutDone ? 'Crushed it! 💪' : 'Check-in saved!')
      router.push('/dashboard')
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Header */}
      <div style={{ textAlign: 'center', padding: '20px 0 4px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '34px', letterSpacing: '2px', color: '#fff' }}>
          TODAY&apos;S LOG
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#9ca3af', letterSpacing: '2px' }}>
          {todayStr}
        </div>
      </div>

      {/* HOW YOU FEELING? */}
      <div className="slabel">HOW YOU FEELING?</div>
      <div className="card-base" style={{ display: 'flex', gap: '8px', justifyContent: 'space-between', padding: '14px' }}>
        {MOODS.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMood(m)}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              cursor: 'pointer',
              background: mood === m ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.05)',
              border: mood === m ? '2px solid #6366f1' : '2px solid transparent',
              transform: mood === m ? 'scale(1.15)' : 'scale(1)',
              transition: 'all 0.2s',
              flexShrink: 0,
            }}
          >
            {m}
          </button>
        ))}
      </div>

      {/* WORKOUT */}
      <div className="slabel">WORKOUT</div>
      <button
        type="button"
        onClick={() => setWorkoutDone(!workoutDone)}
        style={{
          width: '100%',
          padding: '20px',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          fontSize: '17px',
          fontWeight: 700,
          fontFamily: 'var(--font-sans)',
          cursor: 'pointer',
          border: 'none',
          transition: 'all 0.2s',
          background: workoutDone ? 'linear-gradient(135deg,#22c55e,#16a34a)' : 'rgba(255,255,255,0.06)',
          color: workoutDone ? '#fff' : '#555',
          boxShadow: workoutDone ? '0 0 25px rgba(34,197,94,0.35)' : 'none',
        }}
      >
        <span style={{ fontSize: '22px' }}>{workoutDone ? '✅' : '○'}</span>
        <span>{workoutDone ? 'WORKOUT COMPLETE!' : 'TAP TO LOG WORKOUT'}</span>
      </button>

      <AnimatePresence>
        {workoutDone && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div
              className="card-base"
              style={{ border: '1px solid rgba(34,197,94,0.2)', padding: '14px', marginTop: '10px' }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#9ca3af', letterSpacing: '2px', marginBottom: '8px' }}>
                WORKOUT NOTE
              </div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What did you crush today?"
                style={{
                  width: '100%',
                  fontSize: '15px',
                  resize: 'none',
                  height: '56px',
                  lineHeight: 1.5,
                  color: '#fff',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontFamily: 'var(--font-sans)',
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MEASUREMENTS */}
      <div className="slabel">MEASUREMENTS</div>
      <div className="card-base" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#9ca3af', letterSpacing: '2px', marginBottom: '6px' }}>
            WEIGHT kg {liveBmi && <span style={{ color: '#6366f1' }}>· BMI {liveBmi.toFixed(1)}</span>}
          </div>
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="e.g. 84.5"
            style={{ fontSize: '20px', fontWeight: 600, width: '100%', color: '#fff', background: 'transparent', border: 'none', outline: 'none' }}
          />
        </div>
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#9ca3af', letterSpacing: '2px', marginBottom: '6px' }}>
            WAIST EXTENDED cm
          </div>
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            value={waistExt}
            onChange={(e) => setWaistExt(e.target.value)}
            placeholder="e.g. 92.0"
            style={{ fontSize: '20px', fontWeight: 600, width: '100%', color: '#fff', background: 'transparent', border: 'none', outline: 'none' }}
          />
        </div>
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#9ca3af', letterSpacing: '2px', marginBottom: '6px' }}>
            WAIST SUCKED IN cm
          </div>
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            value={waistIn}
            onChange={(e) => setWaistIn(e.target.value)}
            placeholder="e.g. 88.0"
            style={{ fontSize: '20px', fontWeight: 600, width: '100%', color: '#fff', background: 'transparent', border: 'none', outline: 'none' }}
          />
        </div>
      </div>

      {/* SAVE */}
      <button
        type="submit"
        disabled={isPending || !mood}
        style={{
          marginTop: '16px',
          width: '100%',
          padding: '18px',
          background: isPending || !mood ? 'rgba(99,102,241,0.3)' : 'linear-gradient(135deg,#6366f1,#ec4899)',
          borderRadius: '14px',
          textAlign: 'center',
          cursor: isPending || !mood ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--font-display)',
          fontSize: '22px',
          letterSpacing: '2px',
          color: '#fff',
          boxShadow: isPending || !mood ? 'none' : '0 8px 30px rgba(99,102,241,0.3)',
          border: 'none',
          transition: 'all 0.2s',
        }}
      >
        {isPending ? 'SAVING...' : 'SAVE LOG ✓'}
      </button>

      <div style={{ height: '32px' }} />
    </form>
  )
}
