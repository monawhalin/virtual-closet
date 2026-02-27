import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import type { ClosetItem } from '@vc/shared'
import { clsx } from 'clsx'
import { Check } from 'lucide-react'

interface CapsuleItemPickerProps {
  open: boolean
  onClose: () => void
  allItems: ClosetItem[]
  selectedIds: string[]
  onToggle: (id: string) => void
  onSave: () => void
}

export function CapsuleItemPicker({
  open, onClose, allItems, selectedIds, onToggle, onSave
}: CapsuleItemPickerProps) {
  return (
    <Modal open={open} onClose={onClose} title="Add Items to Capsule" size="xl">
      <div className="space-y-4">
        <p className="text-sm text-stone-500">{selectedIds.length} selected</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {allItems.map(item => {
            const selected = selectedIds.includes(item.id)
            return (
              <button
                key={item.id}
                onClick={() => onToggle(item.id)}
                className={clsx(
                  'relative rounded-xl overflow-hidden border-2 transition-all aspect-square',
                  selected ? 'border-stone-900' : 'border-transparent hover:border-stone-200'
                )}
              >
                {item.images[0] ? (
                  <img
                    src={item.images[0]}
                    alt=""
                    className="w-full h-full object-cover"
                    style={{ imageOrientation: 'from-image' }}
                  />
                ) : (
                  <div className="w-full h-full bg-stone-100 flex items-center justify-center text-stone-400">👕</div>
                )}
                {selected && (
                  <div className="absolute inset-0 bg-stone-900/20 flex items-center justify-center">
                    <div className="bg-stone-900 rounded-full p-1">
                      <Check size={12} className="text-white" />
                    </div>
                  </div>
                )}
              </button>
            )
          })}
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={onSave}>Save Selection</Button>
        </div>
      </div>
    </Modal>
  )
}
