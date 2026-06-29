'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts'

interface DataPoint {
  weekNumber: number
  bmi: number
}

export function BMIChart({ data }: { data: DataPoint[] }) {
  const chartData = data.map(d => ({ week: `W${d.weekNumber}`, bmi: d.bmi }))
  const bmis = data.map(d => d.bmi)
  const min = bmis.length ? Math.max(14, Math.floor(Math.min(...bmis)) - 2) : 14
  const max = bmis.length ? Math.min(45, Math.ceil(Math.max(...bmis)) + 2) : 45

  return (
    <div className="card-base" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#444', letterSpacing: '2px' }}>BMI</div>
        {bmis.length >= 2 && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#22c55e' }}>
            {Math.max(...bmis).toFixed(1)} → {Math.min(...bmis).toFixed(1)}
          </div>
        )}
      </div>
      {chartData.length >= 2 ? (
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="bmiGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
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
              formatter={(v) => [Number(v).toFixed(1), 'BMI']}
            />
            <ReferenceLine y={25} stroke="#f59e0b" strokeDasharray="4 4" strokeOpacity={0.5} />
            <ReferenceLine y={30} stroke="#ef4444" strokeDasharray="4 4" strokeOpacity={0.5} />
            <Area
              type="monotone"
              dataKey="bmi"
              stroke="#22c55e"
              strokeWidth={2.5}
              fill="url(#bmiGrad)"
              dot={{ fill: '#22c55e', r: 3.5, strokeWidth: 1.5, stroke: '#141414' }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sans)', fontSize: '13px', color: '#444' }}>
          Log check-ins to see BMI trend
        </div>
      )}
      <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#22c55e' }}>Normal &lt;25</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#f59e0b' }}>Overweight &lt;30</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#ef4444' }}>Obese 30+</span>
      </div>
    </div>
  )
}
