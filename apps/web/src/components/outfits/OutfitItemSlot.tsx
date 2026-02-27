import { Lock, Unlock } from 'lucide-react'
import type { ClosetItem } from '@vc/shared'
import { clsx } from 'clsx'

interface OutfitItemSlotProps {
  item: ClosetItem
  role: string
  locked: boolean
  onToggleLock: () => void
}

export function OutfitItemSlot({ item, role, locked, onToggleLock }: OutfitItemSlotProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative group">
        <div className={clsx(
          'w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors',
          locked ? 'border-stone-900' : 'border-stone-100'
        )}>
          {item.images[0] ? (
            <img
              src={item.images[0]}
              alt={item.category}
              className="w-full h-full object-cover"
              style={{ imageOrientation: 'from-image' }}
            />
          ) : (
            <div className="w-full h-full bg-stone-50 flex items-center justify-center text-stone-300 text-2xl">
              👕
            </div>
          )}
        </div>
        <button
          onClick={onToggleLock}
          className={clsx(
            'absolute -top-1.5 -right-1.5 p-1 rounded-full transition-all',
            locked
              ? 'bg-stone-900 text-white'
              : 'bg-white border border-stone-200 text-stone-400 opacity-0 group-hover:opacity-100'
          )}
          title={locked ? 'Unlock item' : 'Lock item'}
        >
          {locked ? <Lock size={10} /> : <Unlock size={10} />}
        </button>
      </div>
      <span className="text-xs text-stone-400 capitalize">{role}</span>
      {item.colors[0] && (
        <span className="text-xs text-stone-400 capitalize">{item.colors[0]}</span>
      )}
    </div>
  )
}
