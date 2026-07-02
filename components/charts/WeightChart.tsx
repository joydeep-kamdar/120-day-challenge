'use client'

import { Area, AreaChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface DataPoint {
  weekNumber: number
  weightKg: number
}

export function WeightChart({ data }: { data: DataPoint[] }) {
  const chartData = data.map((d, i) => ({ day: `D${i + 1}`, weight: d.weightKg }))
  const weights = data.map(d => d.weightKg)
  const min = weights.length ? Math.floor(Math.min(...weights)) - 2 : 0
  const max = weights.length ? Math.ceil(Math.max(...weights)) + 2 : 100

  return (
    <div className="card-base" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#444', letterSpacing: '2px' }}>WEIGHT kg</div>
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
              tick={{ fill: '#444', fontSize: 10, fontFamily: 'var(--font-mono)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[min, max]}
              tick={{ fill: '#444', fontSize: 10, fontFamily: 'var(--font-mono)' }}
              axisLine={false}
              tickLine={false}
              width={35}
            />
            <Tooltip
              contentStyle={{ background: '#141414', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '12px' }}
              formatter={(v) => [`${v}kg`, 'Weight']}
            />
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
        <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sans)', fontSize: '13px', color: '#444' }}>
          Log your weight to see progress
        </div>
      )}
    </div>
  )
}
