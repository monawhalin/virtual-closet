import { db } from '../db/db'
import type { SyncAdapter } from '@vc/ui-shared'
import type { ClosetItem, Capsule, Outfit, OutfitWearEvent, UserPrefs } from '@vc/shared'

export const dexieSyncAdapter: SyncAdapter = {
  // Delta sync: only push records modified since last sync
  async getItemsSince(lastSync: number): Promise<ClosetItem[]> {
    if (lastSync === 0) return db.items.toArray()
    return db.items.where('updatedAt').above(lastSync).toArray()
  },

  async upsertItems(items: ClosetItem[]): Promise<void> {
    await db.items.bulkPut(items)
  },

  async getCapsulesSince(lastSync: number): Promise<Capsule[]> {
    if (lastSync === 0) return db.capsules.toArray()
    return db.capsules.where('updatedAt').above(lastSync).toArray()
  },

  async upsertCapsules(capsules: Capsule[]): Promise<void> {
    await db.capsules.bulkPut(capsules)
  },

  async getOutfitsSince(lastSync: number): Promise<Outfit[]> {
    if (lastSync === 0) return db.outfits.toArray()
    return db.outfits.where('updatedAt').above(lastSync).toArray()
  },

  async upsertOutfits(outfits: Outfit[]): Promise<void> {
    await db.outfits.bulkPut(outfits)
  },

  async getWearEventsSince(lastSync: number): Promise<OutfitWearEvent[]> {
    if (lastSync === 0) return db.wearEvents.toArray()
    return db.wearEvents.where('updatedAt').above(lastSync).toArray()
  },

  async upsertWearEvents(events: OutfitWearEvent[]): Promise<void> {
    await db.wearEvents.bulkPut(events)
  },

  async getPrefs(): Promise<UserPrefs | undefined> {
    return db.prefs.get(1)
  },

  async upsertPrefs(prefs: UserPrefs): Promise<void> {
    await db.prefs.put(prefs)
  },

  async getLastSyncAt(): Promise<number> {
    const stored = localStorage.getItem('vc_last_sync_at')
    return stored ? parseInt(stored, 10) : 0
  },

  async setLastSyncAt(ts: number): Promise<void> {
    localStorage.setItem('vc_last_sync_at', String(ts))
  },
}
