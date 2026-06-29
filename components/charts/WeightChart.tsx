'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'

interface DataPoint {
  weekNumber: number
  weightKg: number
}

export function WeightChart({ data }: { data: DataPoint[] }) {
  const chartData = data.map(d => ({ week: `W${d.weekNumber}`, weight: d.weightKg }))
  const weights = data.map(d => d.weightKg)
  const min = weights.length ? Math.floor(Math.min(...weights)) - 1 : 0
  const max = weights.length ? Math.ceil(Math.max(...weights)) + 1 : 100

  return (
    <div className="card-base" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#444', letterSpacing: '2px' }}>WEIGHT kg</div>
        {weights.length >= 2 && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#6366f1' }}>
            {Math.max(...weights).toFixed(1)} → {Math.min(...weights).toFixed(1)}
          </div>
        )}
      </div>
      {chartData.length >= 2 ? (
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="week"
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
              contentStyle={{ background: '#141414', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#fff' }}
              formatter={(v) => [`${v}kg`, 'Weight']}
            />
            <Area
              type="monotone"
              dataKey="weight"
              stroke="#6366f1"
              strokeWidth={2.5}
              fill="url(#wGrad)"
              dot={{ fill: '#6366f1', r: 3.5, strokeWidth: 1.5, stroke: '#141414' }}
              activeDot={{ r: 5, fill: '#6366f1' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sans)', fontSize: '13px', color: '#444' }}>
          Log check-ins to see progress
        </div>
      )}
    </div>
  )
}
