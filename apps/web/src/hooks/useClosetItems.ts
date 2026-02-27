import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import type { ClosetItem, FilterState } from '@vc/shared'

export function useClosetItems(filters: FilterState): ClosetItem[] | undefined {
  return useLiveQuery(
    async () => {
      let items = await db.items.where('status').equals('active').toArray()

      if (filters.category) {
        items = items.filter(i => i.category === filters.category)
      }
      if (filters.color) {
        items = items.filter(i => i.colors.includes(filters.color))
      }
      if (filters.season) {
        items = items.filter(i => i.season === filters.season)
      }
      if (filters.tag) {
        items = items.filter(i => i.tags.includes(filters.tag))
      }
      if (filters.search) {
        const q = filters.search.toLowerCase()
        items = items.filter(
          i =>
            i.tags.some(t => t.toLowerCase().includes(q)) ||
            (i.brand?.toLowerCase().includes(q) ?? false) ||
            (i.notes?.toLowerCase().includes(q) ?? false) ||
            i.category.toLowerCase().includes(q)
        )
      }

      return items.sort((a, b) => b.createdAt - a.createdAt)
    },
    [filters.category, filters.color, filters.season, filters.tag, filters.search]
  )
}

export function useAllActiveItems(): ClosetItem[] | undefined {
  return useLiveQuery(
    () => db.items.where('status').equals('active').toArray(),
    []
  )
}
