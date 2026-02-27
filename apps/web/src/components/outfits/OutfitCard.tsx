import { CheckCircle, Save } from 'lucide-react'
import type { GeneratedOutfit, ClosetItem, Occasion } from '@vc/shared'
import { OutfitItemSlot } from './OutfitItemSlot'
import { useUIStore } from '../../store/uiStore'
import { db } from '../../db/db'
import { markOutfitWorn } from '../../lib/wearTracking'

interface OutfitCardProps {
  outfit: GeneratedOutfit
  occasion: string
  onSaved?: () => void
}

function getSlots(outfit: GeneratedOutfit): Array<{ item: ClosetItem; role: string }> {
  const slots: Array<{ item: ClosetItem; role: string }> = []
  if (outfit.dress) slots.push({ item: outfit.dress, role: 'dress' })
  if (outfit.jumpsuit) slots.push({ item: outfit.jumpsuit, role: 'jumpsuit' })
  if (outfit.top) slots.push({ item: outfit.top, role: 'top' })
  if (outfit.bottom) slots.push({ item: outfit.bottom, role: 'bottom' })
  slots.push({ item: outfit.shoes, role: 'shoes' })
  if (outfit.outerwear) slots.push({ item: outfit.outerwear, role: 'outerwear' })
  if (outfit.accessory) slots.push({ item: outfit.accessory, role: 'accessory' })
  return slots
}

export function OutfitCard({ outfit, occasion, onSaved }: OutfitCardProps) {
  const { lockedItemIds, toggleLock, addToast } = useUIStore()

  const slots = getSlots(outfit)
  const itemIds = slots.map(s => s.item.id)
  const occ = occasion as Occasion

  async function handleSave() {
    try {
      const now = Date.now()
      await db.outfits.add({
        id: crypto.randomUUID(),
        itemIds,
        occasion: occ,
        isFavorite: false,
        createdAt: now,
        updatedAt: now,
      })
      addToast('Outfit saved')
      onSaved?.()
    } catch {
      addToast('Failed to save outfit', 'error')
    }
  }

  async function handleMarkWorn() {
    try {
      const savedId = crypto.randomUUID()
      const wornNow = Date.now()
      const outfitRecord = {
        id: savedId,
        itemIds,
        occasion: occ,
        isFavorite: false,
        createdAt: wornNow,
        updatedAt: wornNow,
      }
      await db.outfits.add(outfitRecord)
      await markOutfitWorn(outfitRecord)
      addToast('Marked as worn!')
    } catch {
      addToast('Failed to mark as worn', 'error')
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-100 p-4 space-y-4 hover:shadow-sm transition-shadow">
      {/* Items */}
      <div className="flex flex-wrap gap-3 justify-center">
        {slots.map(({ item, role }) => (
          <OutfitItemSlot
            key={`${item.id}-${role}`}
            item={item}
            role={role}
            locked={lockedItemIds.includes(item.id)}
            onToggleLock={() => toggleLock(item.id)}
          />
        ))}
      </div>

      {/* Rationale */}
      {outfit.rationale.length > 0 && (
        <div className="bg-stone-50 rounded-xl px-3 py-2">
          {outfit.rationale.map((line, i) => (
            <p key={i} className="text-xs text-stone-500">{line}</p>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 justify-end">
        <button
          onClick={handleMarkWorn}
          className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 px-2.5 py-1.5 rounded-lg hover:bg-stone-100 transition-colors"
        >
          <CheckCircle size={13} /> Worn today
        </button>
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 px-2.5 py-1.5 rounded-lg hover:bg-stone-100 transition-colors"
        >
          <Save size={13} /> Save
        </button>
      </div>
    </div>
  )
}
