import { db } from '../db/db'
import type { Outfit } from '@vc/shared'

export async function markOutfitWorn(outfit: Outfit, date?: Date): Promise<void> {
  const wornAt = date ? date.getTime() : Date.now()

  await db.transaction('rw', [db.items, db.wearEvents], async () => {
    // Increment wearCount and update lastWornAt for every item in the outfit
    await Promise.all(
      outfit.itemIds.map(id =>
        db.items.where('id').equals(id).modify(item => {
          item.wearCount += 1
          item.lastWornAt = wornAt
          item.updatedAt = wornAt
        })
      )
    )

    // Record the wear event
    await db.wearEvents.add({
      id: crypto.randomUUID(),
      outfitId: outfit.id,
      wornAt,
      itemIdsSnapshot: [...outfit.itemIds],
      updatedAt: wornAt,
    })
  })
}

export function formatLastWorn(lastWornAt?: number): string {
  if (!lastWornAt) return 'Never worn'
  const days = Math.floor((Date.now() - lastWornAt) / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Worn today'
  if (days === 1) return 'Worn yesterday'
  if (days < 7) return `Worn ${days} days ago`
  if (days < 30) return `Worn ${Math.floor(days / 7)} week${days >= 14 ? 's' : ''} ago`
  if (days < 365) return `Worn ${Math.floor(days / 30)} month${days >= 60 ? 's' : ''} ago`
  return `Worn over a year ago`
}
