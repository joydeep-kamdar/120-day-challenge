'use client'

import { useState, useTransition } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { CheckCircle, Scale, Ruler } from 'lucide-react'
import { calculateBmi, getBmiLabel, getBmiColor } from '@/lib/bmi'
import { saveCheckin } from '@/app/actions/checkin'
import { format } from 'date-fns'

interface Props {
  challengeId: string
  startDate: string
  heightCm: number
  weekNumber: number
}

export function CheckInForm({ challengeId, startDate, heightCm, weekNumber }: Props) {
  const [weight, setWeight] = useState('')
  const [waistExt, setWaistExt] = useState('')
  const [waistIn, setWaistIn] = useState('')
  const [saved, setSaved] = useState(false)
  const [savedBmi, setSavedBmi] = useState<number | null>(null)
  const [isPending, startTransition] = useTransition()

  const previewBmi = weight ? calculateBmi(parseFloat(weight), heightCm) : null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const w = parseFloat(weight)
    const we = parseFloat(waistExt)
    const wi = parseFloat(waistIn)

    if (!w || !we || !wi || isNaN(w) || isNaN(we) || isNaN(wi)) {
      toast.error('Fill in all measurements')
      return
    }

    startTransition(async () => {
      const result = await saveCheckin({
        challengeId,
        startDate,
        heightCm,
        weightKg: w,
        waistExtendedCm: we,
        waistSuckedinCm: wi,
        date: format(new Date(), 'yyyy-MM-dd'),
      })

      if (result.error) {
        toast.error(result.error)
        return
      }

      setSavedBmi(result.bmi ?? null)
      setSaved(true)
      toast.success('Week ' + weekNumber + ' check-in saved! 🎯')
    })
  }

  if (saved) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center text-center py-10 space-y-4"
      >
        <div className="w-20 h-20 rounded-full gradient-orange glow-orange flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
          Week {weekNumber} locked in! 🎯
        </h2>
        {savedBmi && (
          <div className="rounded-2xl bg-card border border-border px-6 py-4 space-y-1">
            <p className="text-xs text-muted-foreground">Your BMI</p>
            <p className="text-3xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: getBmiColor(savedBmi) }}>
              {savedBmi.toFixed(1)}
            </p>
            <p className="text-sm text-muted-foreground">{getBmiLabel(savedBmi)}</p>
          </div>
        )}
        <Button
          onClick={() => setSaved(false)}
          variant="outline"
          className="rounded-xl border-border"
        >
          Edit measurements
        </Button>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-2xl bg-card border border-border p-5 space-y-5">
        {/* Weight */}
        <div className="space-y-2">
          <Label htmlFor="weight" className="flex items-center gap-2 text-sm font-medium">
            <Scale className="w-4 h-4 text-brand-orange" />
            Body weight (kg)
          </Label>
          <Input
            id="weight"
            type="number"
            step="0.1"
            min="30"
            max="300"
            placeholder="e.g. 82.5"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="h-12 rounded-xl bg-secondary border-border text-lg font-semibold"
            required
            inputMode="decimal"
          />
          {previewBmi && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm font-medium"
              style={{ color: getBmiColor(previewBmi) }}
            >
              BMI: {previewBmi.toFixed(1)} — {getBmiLabel(previewBmi)}
            </motion.p>
          )}
        </div>

        {/* Waist extended */}
        <div className="space-y-2">
          <Label htmlFor="waist-ext" className="flex items-center gap-2 text-sm font-medium">
            <Ruler className="w-4 h-4 text-brand-pink" />
            Waist — belly out (cm)
          </Label>
          <Input
            id="waist-ext"
            type="number"
            step="0.1"
            min="50"
            max="200"
            placeholder="e.g. 92.0"
            value={waistExt}
            onChange={(e) => setWaistExt(e.target.value)}
            className="h-12 rounded-xl bg-secondary border-border text-lg font-semibold"
            required
            inputMode="decimal"
          />
        </div>

        {/* Waist sucked in */}
        <div className="space-y-2">
          <Label htmlFor="waist-in" className="flex items-center gap-2 text-sm font-medium">
            <Ruler className="w-4 h-4 text-brand-lime" />
            Waist — sucked in (cm)
          </Label>
          <Input
            id="waist-in"
            type="number"
            step="0.1"
            min="50"
            max="200"
            placeholder="e.g. 88.5"
            value={waistIn}
            onChange={(e) => setWaistIn(e.target.value)}
            className="h-12 rounded-xl bg-secondary border-border text-lg font-semibold"
            required
            inputMode="decimal"
          />
          <p className="text-xs text-muted-foreground">
            Measure your waist at the navel in profile — once relaxed, once sucked in
          </p>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full h-12 gradient-orange text-white font-semibold rounded-xl border-0 hover:opacity-90 transition-opacity"
      >
        {isPending ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
            Saving...
          </span>
        ) : `Save Week ${weekNumber} Check-in`}
      </Button>
    </form>
  )
}
