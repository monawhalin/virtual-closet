import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import type { UserPrefs } from '@vc/shared'

export function useUserPrefs(): UserPrefs | undefined {
  return useLiveQuery(() => db.prefs.get(1), [])
}

export async function updateUserPrefs(updates: Partial<Omit<UserPrefs, 'id'>>): Promise<void> {
  await db.prefs.update(1, { ...updates, updatedAt: Date.now() })
}
