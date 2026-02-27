import { useState, useEffect } from 'react'
import type { ClosetItem } from '@vc/shared'
import { db } from '../db/schema'

function rowToItem(row: NonNullable<ReturnType<typeof db.getItem>>): ClosetItem {
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

/** Returns a single item by ID, or null if not found. */
export function useItem(id: string): ClosetItem | null {
  const [item, setItem] = useState<ClosetItem | null>(null)

  useEffect(() => {
    if (!id) return
    const row = db.getItem(id)
    setItem(row ? rowToItem(row) : null)
  }, [id])

  return item
}
