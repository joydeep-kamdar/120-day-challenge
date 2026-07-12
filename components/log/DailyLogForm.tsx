'use client'

import { useState, useTransition, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { calculateBmi } from '@/lib/bmi'
import { useRouter } from 'next/navigation'
import type { MoodEmoji } from '@/types'
import { saveDailyLog } from '@/app/actions/log'

const MOODS: MoodEmoji[] = ['😤', '💪', '🔥', '😊', '😅', '⚡', '🤙', '😴']

type WeightUnit = 'kg' | 'lbs'
type WaistUnit = 'cm' | 'in'

const LBS_TO_KG = 0.45359237
const IN_TO_CM = 2.54

function toKg(val: number, unit: WeightUnit) {
  return unit === 'lbs' ? val * LBS_TO_KG : val
}
function toCm(val: number, unit: WaistUnit) {
  return unit === 'in' ? val * IN_TO_CM : val
}

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

function UnitToggle({
  value,
  options,
  onChange,
}: {
  value: string
  options: [string, string]
  onChange: (v: string) => void
}) {
  return (
    <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '3px', gap: '3px', flexShrink: 0 }}>
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          style={{
            padding: '4px 12px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.5px',
            transition: 'all 0.15s',
            background: value === opt ? '#6366f1' : 'transparent',
            color: value === opt ? '#fff' : '#6b7280',
          }}
        >
          {opt.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

export function DailyLogForm({ challengeId, existingLog, today, heightCm }: Props) {
  const router = useRouter()
  const [workoutDone, setWorkoutDone] = useState(existingLog?.workoutDone ?? false)
  const [note, setNote] = useState(existingLog?.workoutNote ?? '')
  const [mood, setMood] = useState<MoodEmoji | null>((existingLog?.moodEmoji as MoodEmoji) ?? null)
  const [weight, setWeight] = useState(existingLog?.weightKg?.toString() ?? '')
  const [waistExt, setWaistExt] = useState(existingLog?.waistExtendedCm?.toString() ?? '')
  const [waistIn, setWaistIn] = useState(existingLog?.waistSuckedinCm?.toString() ?? '')
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('kg')
  const [waistUnit, setWaistUnit] = useState<WaistUnit>('cm')
  const [isPending, startTransition] = useTransition()

  // Restore unit preferences from localStorage
  useEffect(() => {
    const savedWeightUnit = localStorage.getItem('pref_weight_unit') as WeightUnit | null
    const savedWaistUnit = localStorage.getItem('pref_waist_unit') as WaistUnit | null
    if (savedWeightUnit === 'kg' || savedWeightUnit === 'lbs') setWeightUnit(savedWeightUnit)
    if (savedWaistUnit === 'cm' || savedWaistUnit === 'in') setWaistUnit(savedWaistUnit)
  }, [])

  function handleWeightUnit(u: string) {
    const next = u as WeightUnit
    localStorage.setItem('pref_weight_unit', next)
    // Convert existing value to new unit
    if (weight) {
      const parsed = parseFloat(weight)
      if (!isNaN(parsed)) {
        const kg = toKg(parsed, weightUnit)
        setWeight(next === 'lbs' ? (kg / LBS_TO_KG).toFixed(1) : kg.toFixed(1))
      }
    }
    setWeightUnit(next)
  }

  function handleWaistUnit(u: string) {
    const next = u as WaistUnit
    localStorage.setItem('pref_waist_unit', next)
    // Convert existing waist values
    if (waistExt) {
      const parsed = parseFloat(waistExt)
      if (!isNaN(parsed)) {
        const cm = toCm(parsed, waistUnit)
        setWaistExt(next === 'in' ? (cm / IN_TO_CM).toFixed(1) : cm.toFixed(1))
      }
    }
    if (waistIn) {
      const parsed = parseFloat(waistIn)
      if (!isNaN(parsed)) {
        const cm = toCm(parsed, waistUnit)
        setWaistIn(next === 'in' ? (cm / IN_TO_CM).toFixed(1) : cm.toFixed(1))
      }
    }
    setWaistUnit(next)
  }

  const parsedWeight = parseFloat(weight)
  const weightInKg = parsedWeight > 0 ? toKg(parsedWeight, weightUnit) : 0
  const liveBmi = weightInKg > 0 && heightCm ? calculateBmi(weightInKg, heightCm) : null

  const todayStr = new Date(today + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  }).toUpperCase()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!mood) {
      toast.error('Pick your mood first!')
      return
    }

    const parsedWaistExt = parseFloat(waistExt)
    const parsedWaistIn = parseFloat(waistIn)

    startTransition(async () => {
      const result = await saveDailyLog({
        challengeId,
        date: today,
        workoutDone,
        workoutNote: note.trim() || null,
        moodEmoji: mood,
        weightKg: weightInKg > 0 ? weightInKg : null,
        waistExtendedCm: parsedWaistExt > 0 ? toCm(parsedWaistExt, waistUnit) : null,
        waistSuckedinCm: parsedWaistIn > 0 ? toCm(parsedWaistIn, waistUnit) : null,
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

  const weightPlaceholder = weightUnit === 'kg' ? 'e.g. 84.5' : 'e.g. 186.4'
  const waistExtPlaceholder = waistUnit === 'cm' ? 'e.g. 92.0' : 'e.g. 36.2'
  const waistInPlaceholder = waistUnit === 'cm' ? 'e.g. 88.0' : 'e.g. 34.6'

  return (
    <form onSubmit={handleSubmit}>
      {/* Header */}
      <div style={{ textAlign: 'center', padding: '24px 0 8px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '42px', letterSpacing: '3px', color: '#fff', lineHeight: 1 }}>
          TODAY&apos;S LOG
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#6b7280', letterSpacing: '2px', marginTop: '6px' }}>
          {todayStr}
        </div>
      </div>

      {/* HOW YOU FEELING? */}
      <div className="slabel">HOW YOU FEELING?</div>
      <div className="card-base" style={{ display: 'flex', gap: '6px', justifyContent: 'space-between', padding: '16px' }}>
        {MOODS.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMood(m)}
            style={{
              flex: 1,
              height: '52px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              cursor: 'pointer',
              background: mood === m ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.05)',
              border: mood === m ? '2px solid #6366f1' : '2px solid transparent',
              transform: mood === m ? 'scale(1.12)' : 'scale(1)',
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
          padding: '22px 20px',
          borderRadius: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '14px',
          fontSize: '18px',
          fontWeight: 700,
          fontFamily: 'var(--font-sans)',
          cursor: 'pointer',
          border: 'none',
          transition: 'all 0.2s',
          background: workoutDone ? 'linear-gradient(135deg,#22c55e,#16a34a)' : 'rgba(255,255,255,0.06)',
          color: workoutDone ? '#fff' : '#555',
          boxShadow: workoutDone ? '0 0 30px rgba(34,197,94,0.3)' : 'none',
        }}
      >
        <span style={{ fontSize: '26px' }}>{workoutDone ? '✅' : '○'}</span>
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
              style={{ border: '1px solid rgba(34,197,94,0.2)', padding: '16px', marginTop: '12px' }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#9ca3af', letterSpacing: '2px', marginBottom: '10px' }}>
                WORKOUT NOTE
              </div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What did you crush today?"
                style={{
                  width: '100%',
                  fontSize: '16px',
                  resize: 'none',
                  height: '64px',
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
      <div className="card-base" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

        {/* Weight */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#9ca3af', letterSpacing: '2px' }}>
              WEIGHT
              {liveBmi && <span style={{ color: '#6366f1', marginLeft: '8px' }}>· BMI {liveBmi.toFixed(1)}</span>}
            </div>
            <UnitToggle value={weightUnit} options={['kg', 'lbs']} onChange={handleWeightUnit} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder={weightPlaceholder}
              style={{ fontSize: '32px', fontWeight: 700, flex: 1, color: '#fff', background: 'transparent', border: 'none', outline: 'none' }}
            />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', color: '#6b7280', marginBottom: '4px' }}>{weightUnit}</span>
          </div>
          {weightUnit === 'lbs' && weightInKg > 0 && (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#4b5563', marginTop: '4px' }}>
              = {weightInKg.toFixed(1)} kg stored
            </div>
          )}
        </div>

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

        {/* Waist unit toggle — shared for both waist fields */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#9ca3af', letterSpacing: '2px' }}>WAIST</div>
          <UnitToggle value={waistUnit} options={['cm', 'in']} onChange={handleWaistUnit} />
        </div>

        {/* Waist Extended */}
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#ec4899', letterSpacing: '1.5px', marginBottom: '8px' }}>
            BELLY OUT (relaxed)
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              value={waistExt}
              onChange={(e) => setWaistExt(e.target.value)}
              placeholder={waistExtPlaceholder}
              style={{ fontSize: '32px', fontWeight: 700, flex: 1, color: '#fff', background: 'transparent', border: 'none', outline: 'none' }}
            />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', color: '#6b7280', marginBottom: '4px' }}>{waistUnit}</span>
          </div>
          {waistUnit === 'in' && parseFloat(waistExt) > 0 && (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#4b5563', marginTop: '4px' }}>
              = {toCm(parseFloat(waistExt), 'in').toFixed(1)} cm stored
            </div>
          )}
        </div>

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

        {/* Waist Sucked In */}
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#818cf8', letterSpacing: '1.5px', marginBottom: '8px' }}>
            BELLY IN (sucked in)
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              value={waistIn}
              onChange={(e) => setWaistIn(e.target.value)}
              placeholder={waistInPlaceholder}
              style={{ fontSize: '32px', fontWeight: 700, flex: 1, color: '#fff', background: 'transparent', border: 'none', outline: 'none' }}
            />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', color: '#6b7280', marginBottom: '4px' }}>{waistUnit}</span>
          </div>
          {waistUnit === 'in' && parseFloat(waistIn) > 0 && (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#4b5563', marginTop: '4px' }}>
              = {toCm(parseFloat(waistIn), 'in').toFixed(1)} cm stored
            </div>
          )}
        </div>
      </div>

      {/* SAVE */}
      <button
        type="submit"
        disabled={isPending || !mood}
        style={{
          marginTop: '20px',
          width: '100%',
          padding: '22px',
          background: isPending || !mood ? 'rgba(99,102,241,0.25)' : 'linear-gradient(135deg,#6366f1,#ec4899)',
          borderRadius: '18px',
          textAlign: 'center',
          cursor: isPending || !mood ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--font-display)',
          fontSize: '26px',
          letterSpacing: '3px',
          color: isPending || !mood ? '#555' : '#fff',
          boxShadow: isPending || !mood ? 'none' : '0 10px 35px rgba(99,102,241,0.35)',
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
