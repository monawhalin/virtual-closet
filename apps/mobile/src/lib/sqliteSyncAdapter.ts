import * as SecureStore from 'expo-secure-store'
import type { SyncAdapter } from '@vc/ui-shared'
import type { ClosetItem, Capsule, Outfit, OutfitWearEvent, UserPrefs } from '@vc/shared'
import { db, type ItemRow } from '../db/schema'

const LAST_SYNC_KEY = 'vc_last_sync_at'

// ─── Row ↔ domain converters ─────────────────────────────────────────────────

function rowToItem(row: ItemRow): ClosetItem {
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

function itemToRow(item: ClosetItem): ItemRow {
  return {
    id: item.id,
    images: JSON.stringify(item.images),
    category: item.category,
    colors: JSON.stringify(item.colors),
    tags: JSON.stringify(item.tags),
    season: item.season ?? null,
    brand: item.brand ?? null,
    url: item.url ?? null,
    notes: item.notes ?? null,
    isFavorite: item.isFavorite ? 1 : 0,
    status: item.status,
    wearCount: item.wearCount,
    lastWornAt: item.lastWornAt ?? null,
    createdAt: item.createdAt,
    updatedAt: Date.now(),
  }
}

// ─── SyncAdapter implementation ──────────────────────────────────────────────

export const sqliteSyncAdapter: SyncAdapter = {
  // Items: push all (SQLite lacks per-row updatedAt tracking for delta sync)
  async getItemsSince(_lastSync: number): Promise<ClosetItem[]> {
    return db.getAllItems().map(rowToItem)
  },

  async upsertItems(items: ClosetItem[]): Promise<void> {
    db.bulkUpsertItems(items.map(itemToRow))
  },

  // Capsules (stub — full implementation follows the same pattern)
  async getCapsulesSince(_lastSync: number): Promise<Capsule[]> {
    return []
  },
  async upsertCapsules(_capsules: Capsule[]): Promise<void> {},

  // Outfits (stub)
  async getOutfitsSince(_lastSync: number): Promise<Outfit[]> {
    return []
  },
  async upsertOutfits(_outfits: Outfit[]): Promise<void> {},

  // Wear events (stub)
  async getWearEventsSince(_lastSync: number): Promise<OutfitWearEvent[]> {
    return []
  },
  async upsertWearEvents(_events: OutfitWearEvent[]): Promise<void> {},

  // Prefs (stub)
  async getPrefs(): Promise<UserPrefs | undefined> {
    return undefined
  },
  async upsertPrefs(_prefs: UserPrefs): Promise<void> {},

  // Sync cursor stored in SecureStore
  async getLastSyncAt(): Promise<number> {
    const stored = await SecureStore.getItemAsync(LAST_SYNC_KEY)
    return stored ? parseInt(stored, 10) : 0
  },

  async setLastSyncAt(ts: number): Promise<void> {
    await SecureStore.setItemAsync(LAST_SYNC_KEY, String(ts))
  },
}
