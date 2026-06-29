'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MoodPicker } from './MoodPicker'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { CheckCircle, Dumbbell } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MoodEmoji } from '@/types'
import { saveDailyLog } from '@/app/actions/log'

interface Props {
  challengeId: string
  existingLog: {
    workoutDone: boolean
    workoutNote: string | null
    moodEmoji: string
  } | null
  today: string
}

export function DailyLogForm({ challengeId, existingLog, today }: Props) {
  const [workoutDone, setWorkoutDone] = useState(existingLog?.workoutDone ?? false)
  const [note, setNote] = useState(existingLog?.workoutNote ?? '')
  const [mood, setMood] = useState<MoodEmoji | null>((existingLog?.moodEmoji as MoodEmoji) ?? null)
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!mood) {
      toast.error('Pick your mood for today!')
      return
    }

    startTransition(async () => {
      const result = await saveDailyLog({
        challengeId,
        date: today,
        workoutDone,
        workoutNote: note.trim() || null,
        moodEmoji: mood,
      })

      if (result.error) {
        toast.error(result.error)
        return
      }

      setSaved(true)
      toast.success(workoutDone ? '💪 Workout logged! Streak alive!' : "Log saved! Tomorrow's a new day.")
    })
  }

  if (saved) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center text-center py-12 space-y-4"
      >
        <div className="w-20 h-20 rounded-full gradient-orange glow-orange flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
          {workoutDone ? 'Beast mode! 🔥' : 'Day logged!'}
        </h2>
        <p className="text-muted-foreground text-sm max-w-xs">
          {workoutDone
            ? 'Your workout is in the books. The crew can see you crushed it.'
            : "Rest is part of the game. You showed up — that's what counts."}
        </p>
        <Button
          onClick={() => setSaved(false)}
          variant="outline"
          className="rounded-xl border-border mt-2"
        >
          Edit today&apos;s log
        </Button>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Workout toggle */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Did you workout today?</Label>
        <button
          type="button"
          onClick={() => setWorkoutDone(!workoutDone)}
          className={cn(
            'w-full rounded-2xl border-2 p-5 transition-all duration-200 flex items-center gap-4',
            workoutDone
              ? 'border-brand-lime bg-brand-lime/10 glow-lime'
              : 'border-border bg-card hover:border-muted-foreground/40'
          )}
        >
          <div className={cn(
            'w-14 h-14 rounded-xl flex items-center justify-center transition-all',
            workoutDone ? 'gradient-lime' : 'bg-secondary'
          )}>
            <Dumbbell className={cn('w-7 h-7', workoutDone ? 'text-white' : 'text-muted-foreground')} />
          </div>
          <div className="text-left">
            <p className="font-semibold text-lg">
              {workoutDone ? '✅ Yes, I crushed it!' : 'Tap to mark done'}
            </p>
            <p className="text-sm text-muted-foreground">
              {workoutDone ? 'Streak builder 🔥' : 'No workout today'}
            </p>
          </div>
        </button>
      </div>

      {/* Note */}
      <AnimatePresence>
        {workoutDone && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 overflow-hidden"
          >
            <Label htmlFor="note" className="text-sm font-medium">
              What did you do? <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="note"
              placeholder="5km run, leg day, HIIT... whatever you crushed"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="rounded-xl bg-secondary border-border resize-none"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mood */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">How are you feeling?</Label>
        <MoodPicker value={mood} onChange={setMood} />
      </div>

      <Button
        type="submit"
        disabled={isPending || !mood}
        className="w-full h-12 gradient-orange text-white font-semibold rounded-xl border-0 hover:opacity-90 transition-opacity"
      >
        {isPending ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
            Saving...
          </span>
        ) : existingLog ? 'Update log' : 'Save log'}
      </Button>
    </form>
  )
}
