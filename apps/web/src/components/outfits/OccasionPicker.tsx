import type { Occasion } from '@vc/shared'
import { OCCASIONS } from '@vc/shared'
import { clsx } from 'clsx'

const OCCASION_EMOJI: Record<Occasion, string> = {
  casual: '☀️',
  work:   '💼',
  date:   '✨',
  formal: '🎩',
  gym:    '🏋️',
}

interface OccasionPickerProps {
  value: Occasion
  onChange: (occasion: Occasion) => void
}

export function OccasionPicker({ value, onChange }: OccasionPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {OCCASIONS.map(occ => (
        <button
          key={occ}
          onClick={() => onChange(occ)}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all',
            value === occ
              ? 'bg-stone-900 text-white border-stone-900'
              : 'border-stone-200 text-stone-600 hover:border-stone-400 bg-white'
          )}
        >
          <span>{OCCASION_EMOJI[occ]}</span>
          <span className="capitalize">{occ}</span>
        </button>
      ))}
    </div>
  )
}
