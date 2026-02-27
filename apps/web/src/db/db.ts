import Dexie, { type EntityTable } from 'dexie'
import type {
  ClosetItem,
  Capsule,
  Outfit,
  OutfitWearEvent,
  UserPrefs,
} from '@vc/shared'

class VirtualClosetDB extends Dexie {
  items!: EntityTable<ClosetItem, 'id'>
  capsules!: EntityTable<Capsule, 'id'>
  outfits!: EntityTable<Outfit, 'id'>
  wearEvents!: EntityTable<OutfitWearEvent, 'id'>
  prefs!: EntityTable<UserPrefs, 'id'>

  constructor() {
    super('VirtualClosetDB')

    // v1 — original schema (no updatedAt)
    this.version(1).stores({
      items: 'id, category, status, isFavorite, wearCount, lastWornAt, createdAt, *tags, *colors',
      capsules: 'id',
      outfits: 'id, occasion, isFavorite, capsuleId, createdAt',
      wearEvents: 'id, outfitId, wornAt',
      prefs: 'id',
    })

    // v2 — adds updatedAt index to all mutable tables for delta sync
    this.version(2).stores({
      items: 'id, category, status, isFavorite, wearCount, lastWornAt, createdAt, updatedAt, *tags, *colors',
      capsules: 'id, updatedAt',
      outfits: 'id, occasion, isFavorite, capsuleId, createdAt, updatedAt',
      wearEvents: 'id, outfitId, wornAt, updatedAt',
      prefs: 'id',
    }).upgrade(tx => {
      // Backfill updatedAt = createdAt (or Date.now() for tables without createdAt)
      const now = Date.now()
      return Promise.all([
        tx.table('items').toCollection().modify(item => {
          item.updatedAt = item.createdAt ?? now
        }),
        tx.table('capsules').toCollection().modify(capsule => {
          capsule.updatedAt = now
        }),
        tx.table('outfits').toCollection().modify(outfit => {
          outfit.updatedAt = outfit.createdAt ?? now
        }),
        tx.table('wearEvents').toCollection().modify(event => {
          event.updatedAt = event.wornAt ?? now
        }),
        tx.table('prefs').toCollection().modify(prefs => {
          prefs.updatedAt = now
        }),
      ])
    })

    // Initialize singleton user prefs on first open
    this.on('ready', async () => {
      const existing = await this.prefs.get(1)
      if (!existing) {
        await this.prefs.put({
          id: 1,
          avoidRepeatDays: 7,
          preferFavorites: false,
          updatedAt: Date.now(),
        })
      }
    })
  }
}

export const db = new VirtualClosetDB()
