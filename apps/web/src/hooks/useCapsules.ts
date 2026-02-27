import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import type { Capsule } from '@vc/shared'

export function useCapsules(): Capsule[] | undefined {
  return useLiveQuery(() => db.capsules.toArray(), [])
}

export function useCapsule(id: string): Capsule | undefined {
  return useLiveQuery(() => db.capsules.get(id), [id])
}
