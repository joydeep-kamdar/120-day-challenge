'use client'

import { Area, AreaChart, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

interface DataPoint {
  weekNumber: number
  bmi: number
}

interface Props {
  data: DataPoint[]
  goalBmi?: number | null
}

export function BMIChart({ data, goalBmi }: Props) {
  const chartData = data.map((d, i) => ({ day: `D${i + 1}`, bmi: d.bmi }))
  const bmis = data.map(d => d.bmi)
  const allValues = goalBmi ? [...bmis, goalBmi] : bmis
  const min = allValues.length ? Math.max(14, Math.floor(Math.min(...allValues)) - 2) : 14
  const max = allValues.length ? Math.min(45, Math.ceil(Math.max(...allValues)) + 2) : 45

  const current = bmis[bmis.length - 1] ?? null
  const gap = current != null && goalBmi != null ? current - goalBmi : null
  const goalReached = gap != null && gap <= 0

  return (
    <div className="card-base" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#9ca3af', letterSpacing: '2px' }}>BMI</div>
        {bmis.length >= 1 && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#22c55e' }}>
            {bmis[bmis.length - 1].toFixed(1)} current
          </div>
        )}
      </div>

      {chartData.length >= 1 ? (
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="bmiGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
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
              formatter={(v) => [Number(v).toFixed(1), 'BMI']}
            />
            {/* Generic healthy-range bands */}
            <ReferenceLine y={25} stroke="#f59e0b" strokeDasharray="4 4" strokeOpacity={0.4} label={{ value: '25', position: 'insideTopRight', fill: '#f59e0b', fontSize: 9, fontFamily: 'var(--font-mono)' }} />
            <ReferenceLine y={30} stroke="#ef4444" strokeDasharray="4 4" strokeOpacity={0.4} label={{ value: '30', position: 'insideTopRight', fill: '#ef4444', fontSize: 9, fontFamily: 'var(--font-mono)' }} />
            {/* Personal goal — only shown if different enough from the bands */}
            {goalBmi != null && goalBmi !== 25 && goalBmi !== 30 && (
              <ReferenceLine
                y={goalBmi}
                stroke="#22c55e"
                strokeDasharray="5 4"
                strokeOpacity={0.85}
                label={{ value: `GOAL ${goalBmi.toFixed(1)}`, position: 'insideTopRight', fill: '#22c55e', fontSize: 9, fontFamily: 'var(--font-mono)' }}
              />
            )}
            <Area
              type="monotone"
              dataKey="bmi"
              stroke="#22c55e"
              strokeWidth={2.5}
              fill="url(#bmiGrad)"
              dot={{ fill: '#22c55e', r: 4, strokeWidth: 2, stroke: '#141414' }}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sans)', fontSize: '13px', color: '#9ca3af' }}>
          Log weight + height to see BMI trend
        </div>
      )}

      <div style={{ display: 'flex', gap: '16px', marginTop: '10px', flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#22c55e' }}>● Normal &lt;25</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#f59e0b' }}>● Overweight &lt;30</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#ef4444' }}>● Obese 30+</span>
      </div>

      {gap != null && (
        <div style={{
          marginTop: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          padding: '8px 14px',
          borderRadius: '10px',
          background: goalReached ? 'rgba(34,197,94,0.1)' : 'rgba(34,197,94,0.06)',
          border: `1px solid ${goalReached ? 'rgba(34,197,94,0.4)' : 'rgba(34,197,94,0.15)'}`,
        }}>
          <span style={{ fontSize: '14px' }}>{goalReached ? '🎯' : '⚡'}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#22c55e', letterSpacing: '1px' }}>
            {goalReached ? 'GOAL REACHED!' : `${gap.toFixed(1)} BMI points to goal`}
          </span>
        </div>
      )}
    </div>
  )
}
