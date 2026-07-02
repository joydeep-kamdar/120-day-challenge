'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface DataPoint {
  weekNumber: number
  waistExtendedCm: number
  waistSuckedinCm: number
}

export function WaistChart({ data }: { data: DataPoint[] }) {
  const chartData = data.map((d, i) => ({
    day: `D${i + 1}`,
    extended: d.waistExtendedCm,
    suckedIn: d.waistSuckedinCm,
  }))

  const allValues = data.flatMap(d => [d.waistExtendedCm, d.waistSuckedinCm]).filter(Boolean)
  const min = allValues.length ? Math.floor(Math.min(...allValues)) - 2 : 60
  const max = allValues.length ? Math.ceil(Math.max(...allValues)) + 2 : 120

  return (
    <div className="card-base" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#444', letterSpacing: '2px' }}>WAIST cm</div>
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
              formatter={(v, name) => [`${v}cm`, name === 'extended' ? 'Belly out' : 'Sucked in']}
            />
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
        <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sans)', fontSize: '13px', color: '#444' }}>
          Log waist measurements to see progress
        </div>
      )}
    </div>
  )
}
