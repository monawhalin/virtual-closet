import { useState, useEffect } from 'react'
import type { ClosetItem } from '@vc/shared'
import { db } from '../db/schema'

function rowToItem(row: ReturnType<typeof db.getAllItems>[number]): ClosetItem {
  return {
    id: row.id,
    images: JSON.parse(row.images) as string[],
    category: row.category as ClosetItem['category'],
    colors: JSON.parse(row.colors) as string[],
    tags: JSON.parse(row.tags) as string[],
    season: row.season as ClosetItem['season'] ?? undefined,
    brand: row.brand ?? undefined,
    url: row.url ?? undefined,
    notes: row.notes ?? undefined,
    isFavorite: row.isFavorite === 1,
    status: row.status as ClosetItem['status'],
    wearCount: row.wearCount,
    lastWornAt: row.lastWornAt ?? undefined,
    createdAt: row.createdAt,
  }
}

/** Returns all active closet items (for outfit generation). */
export function useAllItems(): ClosetItem[] | null {
  const [items, setItems] = useState<ClosetItem[] | null>(null)

  useEffect(() => {
    const rows = db.getAllItems()
    setItems(rows.map(rowToItem))
  }, [])

  return items
}
