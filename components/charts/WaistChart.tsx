'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'

interface DataPoint {
  weekNumber: number
  waistExtendedCm: number
  waistSuckedinCm: number
}

export function WaistChart({ data }: { data: DataPoint[] }) {
  const chartData = data.map(d => ({
    week: `W${d.weekNumber}`,
    extended: d.waistExtendedCm,
    suckedIn: d.waistSuckedinCm,
  }))

  const allValues = data.flatMap(d => [d.waistExtendedCm, d.waistSuckedinCm]).filter(Boolean)
  const min = allValues.length ? Math.floor(Math.min(...allValues)) - 2 : 0
  const max = allValues.length ? Math.ceil(Math.max(...allValues)) + 2 : 120

  return (
    <div className="card-base" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#444', letterSpacing: '2px' }}>WAIST cm</div>
        {allValues.length >= 2 && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#ec4899' }}>
            belly out · sucked in
          </div>
        )}
      </div>
      {chartData.length >= 2 ? (
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={chartData}>
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
              formatter={(v, name) => [`${v}cm`, name === 'extended' ? 'Belly out' : 'Sucked in']}
            />
            <Line
              type="monotone"
              dataKey="extended"
              stroke="#ec4899"
              strokeWidth={2.5}
              dot={{ fill: '#ec4899', r: 3.5, strokeWidth: 1.5, stroke: '#141414' }}
            />
            <Line
              type="monotone"
              dataKey="suckedIn"
              stroke="#ec4899"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#ec4899', r: 3, strokeWidth: 1.5, stroke: '#141414' }}
              strokeOpacity={0.6}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sans)', fontSize: '13px', color: '#444' }}>
          Log check-ins to see progress
        </div>
      )}
    </div>
  )
}
