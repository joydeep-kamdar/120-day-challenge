'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea } from 'recharts'

interface DataPoint {
  weekNumber: number
  bmi: number
}

export function BMIChart({ data }: { data: DataPoint[] }) {
  const chartData = data.map(d => ({ week: `W${d.weekNumber}`, bmi: d.bmi }))

  return (
    <div className="rounded-2xl bg-card border border-border p-4">
      <p className="font-semibold text-sm mb-1">BMI Trend</p>
      <div className="flex gap-3 mb-4 text-xs text-muted-foreground">
        <span><span className="inline-block w-2 h-2 rounded-full bg-blue-400 mr-1" />Under 18.5</span>
        <span><span className="inline-block w-2 h-2 rounded-full bg-green-400 mr-1" />18.5–25</span>
        <span><span className="inline-block w-2 h-2 rounded-full bg-orange-400 mr-1" />25–30</span>
        <span><span className="inline-block w-2 h-2 rounded-full bg-red-400 mr-1" />30+</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData}>
          <ReferenceArea y1={18.5} y2={25} fill="oklch(0.86 0.27 135 / 0.08)" />
          <XAxis dataKey="week" tick={{ fill: 'oklch(0.58 0.02 245)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis domain={[15, 40]} tick={{ fill: 'oklch(0.58 0.02 245)', fontSize: 11 }} axisLine={false} tickLine={false} width={35} />
          <Tooltip
            contentStyle={{ background: 'oklch(0.14 0.025 245)', border: '1px solid oklch(0.22 0.025 245)', borderRadius: '12px', color: 'oklch(0.96 0 0)' }}
            formatter={(v) => [Number(v).toFixed(1), 'BMI']}
          />
          <ReferenceLine y={18.5} stroke="oklch(0.6 0.18 250)" strokeDasharray="4 4" strokeOpacity={0.5} />
          <ReferenceLine y={25} stroke="oklch(0.72 0.22 45)" strokeDasharray="4 4" strokeOpacity={0.5} />
          <ReferenceLine y={30} stroke="oklch(0.6 0.22 25)" strokeDasharray="4 4" strokeOpacity={0.5} />
          <Line
            type="monotone"
            dataKey="bmi"
            stroke="oklch(0.65 0.18 250)"
            strokeWidth={2.5}
            dot={{ fill: 'oklch(0.65 0.18 250)', r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
