'use client'

import { Area, AreaChart, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

interface DataPoint {
  weekNumber: number
  weightKg: number
}

interface Props {
  data: DataPoint[]
  goalWeightKg?: number | null
}

export function WeightChart({ data, goalWeightKg }: Props) {
  const chartData = data.map((d, i) => ({ day: `D${i + 1}`, weight: d.weightKg }))
  const weights = data.map(d => d.weightKg)
  const allValues = goalWeightKg ? [...weights, goalWeightKg] : weights
  const min = allValues.length ? Math.floor(Math.min(...allValues)) - 2 : 0
  const max = allValues.length ? Math.ceil(Math.max(...allValues)) + 2 : 100

  const current = weights[weights.length - 1] ?? null
  const gap = current != null && goalWeightKg != null ? current - goalWeightKg : null
  const goalReached = gap != null && gap <= 0

  return (
    <div className="card-base" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#9ca3af', letterSpacing: '2px' }}>WEIGHT kg</div>
        {weights.length >= 2 && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#6366f1' }}>
            {weights[0].toFixed(1)} → {weights[weights.length - 1].toFixed(1)}
          </div>
        )}
        {weights.length === 1 && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#6366f1' }}>
            {weights[0].toFixed(1)} kg today
          </div>
        )}
      </div>

      {chartData.length >= 1 ? (
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
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
              formatter={(v) => [`${v}kg`, 'Weight']}
            />
            {goalWeightKg != null && (
              <ReferenceLine
                y={goalWeightKg}
                stroke="#22c55e"
                strokeDasharray="5 4"
                strokeOpacity={0.8}
                label={{ value: `GOAL ${goalWeightKg.toFixed(1)}`, position: 'insideTopRight', fill: '#22c55e', fontSize: 9, fontFamily: 'var(--font-mono)' }}
              />
            )}
            <Area
              type="monotone"
              dataKey="weight"
              stroke="#6366f1"
              strokeWidth={2.5}
              fill="url(#wGrad)"
              dot={{ fill: '#6366f1', r: 4, strokeWidth: 2, stroke: '#141414' }}
              activeDot={{ r: 6, fill: '#6366f1' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sans)', fontSize: '13px', color: '#9ca3af' }}>
          Log your weight to see progress
        </div>
      )}

      {gap != null && (
        <div style={{
          marginTop: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          padding: '8px 14px',
          borderRadius: '10px',
          background: goalReached ? 'rgba(34,197,94,0.1)' : 'rgba(99,102,241,0.08)',
          border: `1px solid ${goalReached ? 'rgba(34,197,94,0.3)' : 'rgba(99,102,241,0.2)'}`,
        }}>
          <span style={{ fontSize: '14px' }}>{goalReached ? '🎯' : '⚡'}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: goalReached ? '#22c55e' : '#818cf8', letterSpacing: '1px' }}>
            {goalReached ? 'GOAL REACHED!' : `${gap.toFixed(1)}kg to goal`}
          </span>
        </div>
      )}
    </div>
  )
}
