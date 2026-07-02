'use client'

import { useState } from 'react'
import { WeightChart } from '@/components/charts/WeightChart'
import { WaistChart } from '@/components/charts/WaistChart'
import { BMIChart } from '@/components/charts/BMIChart'
import { StreakCalendar } from '@/components/charts/StreakCalendar'
import { getStreakDatesForCalendar, calculateStreaks } from '@/lib/streaks'

interface Log {
  date: string
  workoutDone: boolean
  weightKg?: number | null
  waistExtendedCm?: number | null
  waistSuckedinCm?: number | null
  bmi?: number | null
}

interface Goals {
  weightKg: number | null
  waistExtendedCm: number | null
  waistSuckedinCm: number | null
  bmi: number | null
}

interface Props {
  logs: Log[]
  goals: Goals
}

const TABS = ['Weight', 'Waist', 'BMI', 'Streak'] as const
type Tab = typeof TABS[number]

export function ChartsClient({ logs, goals }: Props) {
  const [tab, setTab] = useState<Tab>('Weight')

  const streakDates = getStreakDatesForCalendar(
    logs as Parameters<typeof getStreakDatesForCalendar>[0],
    42
  )

  const logsWithWeight = logs.filter(l => l.weightKg != null)
  const logsWithWaist = logs.filter(l => l.waistExtendedCm != null)
  const logsWithBmi = logs.filter(l => l.bmi != null)

  // Map to chart format using sequential index as week number proxy
  const weightData = logsWithWeight.map((l, i) => ({
    weekNumber: i + 1,
    weightKg: l.weightKg!,
  }))
  const waistData = logsWithWaist.map((l, i) => ({
    weekNumber: i + 1,
    waistExtendedCm: l.waistExtendedCm!,
    waistSuckedinCm: l.waistSuckedinCm ?? l.waistExtendedCm!,
  }))
  const bmiData = logsWithBmi.map((l, i) => ({
    weekNumber: i + 1,
    bmi: l.bmi!,
  }))

  const workoutsTotal = logs.filter(l => l.workoutDone).length
  const streaks = calculateStreaks(logs as Parameters<typeof calculateStreaks>[0])

  // Derived first/last values per metric
  const firstWeight = weightData[0]?.weightKg ?? null
  const lastWeight  = weightData[weightData.length - 1]?.weightKg ?? null
  const firstWaistExt  = waistData[0]?.waistExtendedCm ?? null
  const lastWaistExt   = waistData[waistData.length - 1]?.waistExtendedCm ?? null
  const firstWaistIn   = waistData[0]?.waistSuckedinCm ?? null
  const lastWaistIn    = waistData[waistData.length - 1]?.waistSuckedinCm ?? null
  const firstBmi = bmiData[0]?.bmi ?? null
  const lastBmi  = bmiData[bmiData.length - 1]?.bmi ?? null

  return (
    <div>
      {/* Tab bar — matches design prototype */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          marginTop: '16px',
          background: '#141414',
          borderRadius: '14px',
          padding: '4px',
          marginBottom: '12px',
        }}
      >
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1,
              padding: '10px 4px',
              borderRadius: '10px',
              textAlign: 'center',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '1px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: tab === t ? '#6366f1' : 'transparent',
              color: tab === t ? '#fff' : '#444',
              border: 'none',
            }}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'Weight' && <WeightChart data={weightData} goalWeightKg={goals.weightKg} />}
      {tab === 'Waist' && <WaistChart data={waistData} goalExtendedCm={goals.waistExtendedCm} goalSuckedinCm={goals.waistSuckedinCm} />}
      {tab === 'BMI' && <BMIChart data={bmiData} goalBmi={goals.bmi} />}
      {tab === 'Streak' && <StreakCalendar streakDates={streakDates} />}

      {/* MY STATS — tab-contextual */}
      <div className="slabel">MY STATS</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>

        {tab === 'Weight' && (
          <>
            <StatCard label="STARTED" value={firstWeight != null ? `${firstWeight.toFixed(1)}kg` : '—'} color="#fff" />
            <StatCard label="CURRENT" value={lastWeight != null ? `${lastWeight.toFixed(1)}kg` : '—'} color="#6366f1" />
            {firstWeight != null && lastWeight != null && (
              <>
                <StatCard label="LOST" value={`${(firstWeight - lastWeight).toFixed(1)}kg`} color="#22c55e" />
                <StatCard label="LOGS" value={String(weightData.length)} color="#fff" />
              </>
            )}
          </>
        )}

        {tab === 'Waist' && (
          <>
            <StatCard label="STARTED OUT" value={firstWaistExt != null ? `${firstWaistExt.toFixed(1)}cm` : '—'} color="#fff" />
            <StatCard label="CURRENT OUT" value={lastWaistExt != null ? `${lastWaistExt.toFixed(1)}cm` : '—'} color="#ec4899" />
            <StatCard label="STARTED IN" value={firstWaistIn != null ? `${firstWaistIn.toFixed(1)}cm` : '—'} color="#fff" />
            <StatCard label="CURRENT IN" value={lastWaistIn != null ? `${lastWaistIn.toFixed(1)}cm` : '—'} color="#6366f1" />
          </>
        )}

        {tab === 'BMI' && (
          <>
            <StatCard label="STARTED" value={firstBmi != null ? firstBmi.toFixed(1) : '—'} color="#fff" />
            <StatCard label="CURRENT" value={lastBmi != null ? lastBmi.toFixed(1) : '—'} color="#22c55e" />
            {firstBmi != null && lastBmi != null && (
              <>
                <StatCard label="CHANGE" value={`${(lastBmi - firstBmi) > 0 ? '+' : ''}${(lastBmi - firstBmi).toFixed(1)}`} color={(lastBmi - firstBmi) < 0 ? '#22c55e' : '#ef4444'} />
                <StatCard label="LOGS" value={String(bmiData.length)} color="#fff" />
              </>
            )}
          </>
        )}

        {tab === 'Streak' && (
          <>
            <StatCard label="LOGS" value={String(logs.length)} color="#fff" />
            <StatCard label="WORKOUTS" value={String(workoutsTotal)} color="#22c55e" />
            <StatCard label="STREAK" value={`${streaks.current}d`} color="#f59e0b" />
            <StatCard label="BEST STREAK" value={`${streaks.longest}d`} color="#6366f1" />
          </>
        )}

      </div>

      <div style={{ height: '32px' }} />
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="card-base" style={{ padding: '14px' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#9ca3af', letterSpacing: '1px' }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '26px', color, marginTop: '2px', lineHeight: 1.1 }}>{value}</div>
    </div>
  )
}
