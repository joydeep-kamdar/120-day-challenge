'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

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

  return (
    <div className="rounded-2xl bg-card border border-border p-4">
      <p className="font-semibold text-sm mb-4">Waist (cm)</p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData}>
          <XAxis dataKey="week" tick={{ fill: 'oklch(0.58 0.02 245)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'oklch(0.58 0.02 245)', fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
          <Tooltip
            contentStyle={{ background: 'oklch(0.14 0.025 245)', border: '1px solid oklch(0.22 0.025 245)', borderRadius: '12px', color: 'oklch(0.96 0 0)' }}
            formatter={(v, name) => [`${v}cm`, name === 'extended' ? 'Belly out' : 'Sucked in']}
          />
          <Legend formatter={(v) => v === 'extended' ? 'Belly out' : 'Sucked in'} />
          <Line type="monotone" dataKey="extended" stroke="oklch(0.62 0.27 350)" strokeWidth={2.5} dot={{ fill: 'oklch(0.62 0.27 350)', r: 4, strokeWidth: 0 }} />
          <Line type="monotone" dataKey="suckedIn" stroke="oklch(0.86 0.27 135)" strokeWidth={2.5} strokeDasharray="5 5" dot={{ fill: 'oklch(0.86 0.27 135)', r: 4, strokeWidth: 0 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
