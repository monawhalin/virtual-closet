import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import type { Outfit } from '@vc/shared'

export function useSavedOutfits(): Outfit[] | undefined {
  return useLiveQuery(
    () => db.outfits.orderBy('createdAt').reverse().toArray(),
    []
  )
}

export function useOutfit(id: string): Outfit | undefined {
  return useLiveQuery(() => db.outfits.get(id), [id])
}
