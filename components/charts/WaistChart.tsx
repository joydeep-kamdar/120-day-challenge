'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

interface DataPoint {
  weekNumber: number
  waistExtendedCm: number
  waistSuckedinCm: number
}

interface Props {
  data: DataPoint[]
  goalExtendedCm?: number | null
  goalSuckedinCm?: number | null
}

export function WaistChart({ data, goalExtendedCm, goalSuckedinCm }: Props) {
  const chartData = data.map((d, i) => ({
    day: `D${i + 1}`,
    extended: d.waistExtendedCm,
    suckedIn: d.waistSuckedinCm,
  }))

  const allValues = data.flatMap(d => [d.waistExtendedCm, d.waistSuckedinCm]).filter(Boolean)
  const goalValues = [goalExtendedCm, goalSuckedinCm].filter((v): v is number => v != null)
  const allWithGoals = [...allValues, ...goalValues]
  const min = allWithGoals.length ? Math.floor(Math.min(...allWithGoals)) - 2 : 60
  const max = allWithGoals.length ? Math.ceil(Math.max(...allWithGoals)) + 2 : 120

  const currentExtended = data[data.length - 1]?.waistExtendedCm ?? null
  const currentSuckedin = data[data.length - 1]?.waistSuckedinCm ?? null
  const gapExtended = currentExtended != null && goalExtendedCm != null ? currentExtended - goalExtendedCm : null
  const gapSuckedin = currentSuckedin != null && goalSuckedinCm != null ? currentSuckedin - goalSuckedinCm : null

  const hasGoal = goalExtendedCm != null || goalSuckedinCm != null
  const bestGap = gapExtended ?? gapSuckedin
  const goalReached = bestGap != null && bestGap <= 0

  return (
    <div className="card-base" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#9ca3af', letterSpacing: '2px' }}>WAIST cm</div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '16px', height: '2px', background: '#ec4899', borderRadius: '1px' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#ec4899' }}>belly out</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '16px', height: '0', borderTop: '2px dashed #6366f1' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#6366f1' }}>sucked in</span>
          </div>
        </div>
      </div>

      {chartData.length >= 1 ? (
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={chartData}>
            <XAxis
              dataKey="day"
              tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'var(--font-mono)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[min, max]}
              tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'var(--font-mono)' }}
              axisLine={false}
              tickLine={false}
              width={35}
            />
            <Tooltip
              contentStyle={{ background: '#141414', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '12px' }}
              formatter={(v, name) => [`${v}cm`, name === 'extended' ? 'Belly out' : 'Sucked in']}
            />
            {goalExtendedCm != null && (
              <ReferenceLine
                y={goalExtendedCm}
                stroke="#ec4899"
                strokeDasharray="5 4"
                strokeOpacity={0.7}
                label={{ value: `GOAL ${goalExtendedCm.toFixed(0)}`, position: 'insideTopRight', fill: '#ec4899', fontSize: 9, fontFamily: 'var(--font-mono)' }}
              />
            )}
            {goalSuckedinCm != null && (
              <ReferenceLine
                y={goalSuckedinCm}
                stroke="#6366f1"
                strokeDasharray="5 4"
                strokeOpacity={0.7}
                label={{ value: `GOAL ${goalSuckedinCm.toFixed(0)}`, position: 'insideBottomRight', fill: '#6366f1', fontSize: 9, fontFamily: 'var(--font-mono)' }}
              />
            )}
            <Line
              type="monotone"
              dataKey="extended"
              stroke="#ec4899"
              strokeWidth={2.5}
              dot={{ fill: '#ec4899', r: 4, strokeWidth: 2, stroke: '#141414' }}
              activeDot={{ r: 6, fill: '#ec4899' }}
            />
            <Line
              type="monotone"
              dataKey="suckedIn"
              stroke="#6366f1"
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={{ fill: '#6366f1', r: 3.5, strokeWidth: 2, stroke: '#141414' }}
              activeDot={{ r: 5, fill: '#6366f1' }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sans)', fontSize: '13px', color: '#9ca3af' }}>
          Log waist measurements to see progress
        </div>
      )}

      {hasGoal && bestGap != null && (
        <div style={{
          marginTop: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          padding: '8px 14px',
          borderRadius: '10px',
          background: goalReached ? 'rgba(34,197,94,0.1)' : 'rgba(236,72,153,0.08)',
          border: `1px solid ${goalReached ? 'rgba(34,197,94,0.3)' : 'rgba(236,72,153,0.2)'}`,
        }}>
          <span style={{ fontSize: '14px' }}>{goalReached ? '🎯' : '⚡'}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: goalReached ? '#22c55e' : '#f472b6', letterSpacing: '1px' }}>
            {goalReached ? 'GOAL REACHED!' : `${bestGap.toFixed(1)}cm to goal`}
          </span>
        </div>
      )}
    </div>
  )
}
