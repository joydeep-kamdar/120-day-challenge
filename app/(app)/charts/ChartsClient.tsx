'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { WeightChart } from '@/components/charts/WeightChart'
import { WaistChart } from '@/components/charts/WaistChart'
import { BMIChart } from '@/components/charts/BMIChart'
import { StreakCalendar } from '@/components/charts/StreakCalendar'
import { getStreakDatesForCalendar } from '@/lib/streaks'

interface Checkin {
  weekNumber: number
  date: string
  weightKg: number
  waistExtendedCm: number
  waistSuckedinCm: number
  bmi: number
}

interface Log {
  date: string
  workoutDone: boolean
}

interface Props {
  checkins: Checkin[]
  logs: Log[]
}

export function ChartsClient({ checkins, logs }: Props) {
  const streakDates = getStreakDatesForCalendar(logs as Parameters<typeof getStreakDatesForCalendar>[0], 60)

  if (checkins.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-4xl mb-3">📊</p>
        <p className="font-medium">No data yet</p>
        <p className="text-sm mt-1">Complete your first weekly check-in to see charts</p>
      </div>
    )
  }

  return (
    <Tabs defaultValue="weight">
      <TabsList className="w-full rounded-xl bg-secondary mb-5 grid grid-cols-4 h-10">
        <TabsTrigger value="weight" className="rounded-lg text-xs">Weight</TabsTrigger>
        <TabsTrigger value="waist" className="rounded-lg text-xs">Waist</TabsTrigger>
        <TabsTrigger value="bmi" className="rounded-lg text-xs">BMI</TabsTrigger>
        <TabsTrigger value="streak" className="rounded-lg text-xs">Streak</TabsTrigger>
      </TabsList>

      <TabsContent value="weight" className="mt-0">
        <WeightChart data={checkins} />
      </TabsContent>
      <TabsContent value="waist" className="mt-0">
        <WaistChart data={checkins} />
      </TabsContent>
      <TabsContent value="bmi" className="mt-0">
        <BMIChart data={checkins} />
      </TabsContent>
      <TabsContent value="streak" className="mt-0">
        <StreakCalendar streakDates={streakDates} />
      </TabsContent>
    </Tabs>
  )
}
