'use client'

import { cn } from '@/lib/utils'
import type { MoodEmoji } from '@/types'

const MOODS: { emoji: MoodEmoji; label: string }[] = [
  { emoji: '🔥', label: 'On fire' },
  { emoji: '💪', label: 'Strong' },
  { emoji: '😄', label: 'Great' },
  { emoji: '😊', label: 'Good' },
  { emoji: '😐', label: 'Meh' },
  { emoji: '😓', label: 'Tough day' },
]

interface MoodPickerProps {
  value: MoodEmoji | null
  onChange: (mood: MoodEmoji) => void
}

export function MoodPicker({ value, onChange }: MoodPickerProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {MOODS.map(({ emoji, label }) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onChange(emoji)}
          className={cn(
            'flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all',
            value === emoji
              ? 'border-brand-orange bg-brand-orange/10 scale-105'
              : 'border-border bg-card hover:border-muted-foreground/40'
          )}
        >
          <span className="text-3xl leading-none">{emoji}</span>
          <span className="text-[11px] text-muted-foreground font-medium">{label}</span>
        </button>
      ))}
    </div>
  )
}
