'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

interface DataPoint {
  weekNumber: number
  weightKg: number
}

export function WeightChart({ data }: { data: DataPoint[] }) {
  const chartData = data.map(d => ({ week: `W${d.weekNumber}`, weight: d.weightKg }))
  const min = Math.min(...data.map(d => d.weightKg)) - 2
  const max = Math.max(...data.map(d => d.weightKg)) + 2

  return (
    <div className="rounded-2xl bg-card border border-border p-4">
      <p className="font-semibold text-sm mb-4">Weight (kg)</p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData}>
          <XAxis dataKey="week" tick={{ fill: 'oklch(0.58 0.02 245)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis domain={[min, max]} tick={{ fill: 'oklch(0.58 0.02 245)', fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
          <Tooltip
            contentStyle={{ background: 'oklch(0.14 0.025 245)', border: '1px solid oklch(0.22 0.025 245)', borderRadius: '12px', color: 'oklch(0.96 0 0)' }}
            formatter={(v: number) => [`${v}kg`, 'Weight']}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="oklch(0.72 0.22 45)"
            strokeWidth={2.5}
            dot={{ fill: 'oklch(0.72 0.22 45)', r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: 'oklch(0.72 0.22 45)' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
