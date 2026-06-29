'use client'

import { useState } from 'react'
import { WeightChart } from '@/components/charts/WeightChart'
import { WaistChart } from '@/components/charts/WaistChart'
import { BMIChart } from '@/components/charts/BMIChart'
import { StreakCalendar } from '@/components/charts/StreakCalendar'
import { getStreakDatesForCalendar } from '@/lib/streaks'

interface Log {
  date: string
  workoutDone: boolean
  weightKg?: number | null
  waistExtendedCm?: number | null
  waistSuckedinCm?: number | null
  bmi?: number | null
}

interface Props {
  logs: Log[]
}

const TABS = ['Weight', 'Waist', 'BMI', 'Streak'] as const
type Tab = typeof TABS[number]

export function ChartsClient({ logs }: Props) {
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
      {tab === 'Weight' && <WeightChart data={weightData} />}
      {tab === 'Waist' && <WaistChart data={waistData} />}
      {tab === 'BMI' && <BMIChart data={bmiData} />}
      {tab === 'Streak' && <StreakCalendar streakDates={streakDates} />}

      {/* MY STATS grid */}
      <div className="slabel">MY STATS</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div className="card-base" style={{ padding: '14px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#444', letterSpacing: '1px' }}>LOGS</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: '#fff', marginTop: '2px' }}>{logs.length}</div>
        </div>
        <div className="card-base" style={{ padding: '14px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#444', letterSpacing: '1px' }}>WORKOUTS</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: '#22c55e', marginTop: '2px' }}>{workoutsTotal}</div>
        </div>
        {weightData.length >= 2 && (
          <>
            <div className="card-base" style={{ padding: '14px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#444', letterSpacing: '1px' }}>STARTED</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: '#fff', marginTop: '2px' }}>
                {weightData[0].weightKg.toFixed(1)}kg
              </div>
            </div>
            <div className="card-base" style={{ padding: '14px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#444', letterSpacing: '1px' }}>CURRENT</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: '#6366f1', marginTop: '2px' }}>
                {weightData[weightData.length - 1].weightKg.toFixed(1)}kg
              </div>
            </div>
          </>
        )}
      </div>

      <div style={{ height: '32px' }} />
    </div>
  )
}
