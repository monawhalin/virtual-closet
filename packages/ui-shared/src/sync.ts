import type { SupabaseClient } from '@supabase/supabase-js'
import type { ClosetItem, Capsule, Outfit, OutfitWearEvent, UserPrefs } from '@vc/shared'

// ---------- Adapter interface ----------
// Each platform (web/Dexie, mobile/SQLite) implements this

export interface SyncAdapter {
  // Items
  getItemsSince(lastSync: number): Promise<ClosetItem[]>
  upsertItems(items: ClosetItem[]): Promise<void>

  // Capsules
  getCapsulesSince(lastSync: number): Promise<Capsule[]>
  upsertCapsules(capsules: Capsule[]): Promise<void>

  // Outfits
  getOutfitsSince(lastSync: number): Promise<Outfit[]>
  upsertOutfits(outfits: Outfit[]): Promise<void>

  // Wear events
  getWearEventsSince(lastSync: number): Promise<OutfitWearEvent[]>
  upsertWearEvents(events: OutfitWearEvent[]): Promise<void>

  // User prefs
  getPrefs(): Promise<UserPrefs | undefined>
  upsertPrefs(prefs: UserPrefs): Promise<void>

  // Sync cursor
  getLastSyncAt(): Promise<number>
  setLastSyncAt(ts: number): Promise<void>
}

// ---------- Remote row shapes (snake_case, with user_id + updated_at) ----------

interface RemoteItem {
  id: string
  user_id: string
  images: string
  category: string
  colors: string
  tags: string
  season: string | null
  brand: string | null
  url: string | null
  notes: string | null
  is_favorite: boolean
  status: string
  wear_count: number
  last_worn_at: number | null
  created_at: number
  updated_at: number
  deleted_at: number | null
}

interface RemoteCapsule {
  id: string
  user_id: string
  name: string
  item_ids: string
  updated_at: number
  deleted_at: number | null
}

interface RemoteOutfit {
  id: string
  user_id: string
  item_ids: string
  occasion: string
  capsule_id: string | null
  is_favorite: boolean
  created_at: number
  updated_at: number
  deleted_at: number | null
}

interface RemoteWearEvent {
  id: string
  user_id: string
  outfit_id: string
  worn_at: number
  item_ids_snapshot: string
  updated_at: number
}

interface RemotePrefs {
  user_id: string
  avoid_repeat_days: number
  prefer_favorites: boolean
  updated_at: number
}

// ---------- Converters ----------

function itemToRemote(item: ClosetItem, userId: string): RemoteItem {
  return {
    id: item.id,
    user_id: userId,
    images: JSON.stringify(item.images),
    category: item.category,
    colors: JSON.stringify(item.colors),
    tags: JSON.stringify(item.tags),
    season: item.season ?? null,
    brand: item.brand ?? null,
    url: item.url ?? null,
    notes: item.notes ?? null,
    is_favorite: item.isFavorite,
    status: item.status,
    wear_count: item.wearCount,
    last_worn_at: item.lastWornAt ?? null,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
    deleted_at: null,
  }
}

function itemFromRemote(row: RemoteItem): ClosetItem {
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
    isFavorite: row.is_favorite,
    status: row.status as ClosetItem['status'],
    wearCount: row.wear_count,
    lastWornAt: row.last_worn_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function capsuleToRemote(c: Capsule, userId: string): RemoteCapsule {
  return {
    id: c.id,
    user_id: userId,
    name: c.name,
    item_ids: JSON.stringify(c.itemIds),
    updated_at: c.updatedAt,
    deleted_at: null,
  }
}

function capsuleFromRemote(row: RemoteCapsule): Capsule {
  return {
    id: row.id,
    name: row.name,
    itemIds: JSON.parse(row.item_ids) as string[],
    updatedAt: row.updated_at,
  }
}

function outfitToRemote(o: Outfit, userId: string): RemoteOutfit {
  return {
    id: o.id,
    user_id: userId,
    item_ids: JSON.stringify(o.itemIds),
    occasion: o.occasion,
    capsule_id: o.capsuleId ?? null,
    is_favorite: o.isFavorite,
    created_at: o.createdAt,
    updated_at: o.updatedAt,
    deleted_at: null,
  }
}

function outfitFromRemote(row: RemoteOutfit): Outfit {
  return {
    id: row.id,
    itemIds: JSON.parse(row.item_ids) as string[],
    occasion: row.occasion as Outfit['occasion'],
    capsuleId: row.capsule_id ?? undefined,
    isFavorite: row.is_favorite,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function wearEventToRemote(e: OutfitWearEvent, userId: string): RemoteWearEvent {
  return {
    id: e.id,
    user_id: userId,
    outfit_id: e.outfitId,
    worn_at: e.wornAt,
    item_ids_snapshot: JSON.stringify(e.itemIdsSnapshot),
    updated_at: e.updatedAt,
  }
}

function wearEventFromRemote(row: RemoteWearEvent): OutfitWearEvent {
  return {
    id: row.id,
    outfitId: row.outfit_id,
    wornAt: row.worn_at,
    itemIdsSnapshot: JSON.parse(row.item_ids_snapshot) as string[],
    updatedAt: row.updated_at,
  }
}

function prefsToRemote(p: UserPrefs, userId: string): RemotePrefs {
  return {
    user_id: userId,
    avoid_repeat_days: p.avoidRepeatDays,
    prefer_favorites: p.preferFavorites,
    updated_at: p.updatedAt,
  }
}

function prefsFromRemote(row: RemotePrefs): UserPrefs {
  return {
    id: 1,
    avoidRepeatDays: row.avoid_repeat_days,
    preferFavorites: row.prefer_favorites,
    updatedAt: row.updated_at,
  }
}

// ---------- Main sync function ----------

export async function syncAll(
  supabase: SupabaseClient,
  adapter: SyncAdapter,
  userId: string
): Promise<void> {
  const lastSync = await adapter.getLastSyncAt()
  const syncCompletedAt = Date.now()

  // --- Items ---
  const localItems = await adapter.getItemsSince(lastSync)
  if (localItems.length > 0) {
    await supabase.from('items').upsert(localItems.map(i => itemToRemote(i, userId)))
  }
  const { data: remoteItems } = await supabase
    .from('items')
    .select('*')
    .eq('user_id', userId)
    .gt('updated_at', lastSync)
    .is('deleted_at', null)
  if (remoteItems && remoteItems.length > 0) {
    await adapter.upsertItems((remoteItems as RemoteItem[]).map(itemFromRemote))
  }

  // --- Capsules ---
  const localCapsules = await adapter.getCapsulesSince(lastSync)
  if (localCapsules.length > 0) {
    await supabase.from('capsules').upsert(localCapsules.map(c => capsuleToRemote(c, userId)))
  }
  const { data: remoteCapsules } = await supabase
    .from('capsules')
    .select('*')
    .eq('user_id', userId)
    .gt('updated_at', lastSync)
    .is('deleted_at', null)
  if (remoteCapsules && remoteCapsules.length > 0) {
    await adapter.upsertCapsules((remoteCapsules as RemoteCapsule[]).map(capsuleFromRemote))
  }

  // --- Outfits ---
  const localOutfits = await adapter.getOutfitsSince(lastSync)
  if (localOutfits.length > 0) {
    await supabase.from('outfits').upsert(localOutfits.map(o => outfitToRemote(o, userId)))
  }
  const { data: remoteOutfits } = await supabase
    .from('outfits')
    .select('*')
    .eq('user_id', userId)
    .gt('updated_at', lastSync)
    .is('deleted_at', null)
  if (remoteOutfits && remoteOutfits.length > 0) {
    await adapter.upsertOutfits((remoteOutfits as RemoteOutfit[]).map(outfitFromRemote))
  }

  // --- Wear Events ---
  const localEvents = await adapter.getWearEventsSince(lastSync)
  if (localEvents.length > 0) {
    await supabase.from('wear_events').upsert(localEvents.map(e => wearEventToRemote(e, userId)))
  }
  const { data: remoteEvents } = await supabase
    .from('wear_events')
    .select('*')
    .eq('user_id', userId)
    .gt('updated_at', lastSync)
  if (remoteEvents && remoteEvents.length > 0) {
    await adapter.upsertWearEvents((remoteEvents as RemoteWearEvent[]).map(wearEventFromRemote))
  }

  // --- User Prefs ---
  const localPrefs = await adapter.getPrefs()
  if (localPrefs) {
    await supabase.from('user_prefs').upsert(prefsToRemote(localPrefs, userId))
  }
  const { data: remotePrefsRows } = await supabase
    .from('user_prefs')
    .select('*')
    .eq('user_id', userId)
    .gt('updated_at', lastSync)
  if (remotePrefsRows && remotePrefsRows.length > 0) {
    await adapter.upsertPrefs(prefsFromRemote(remotePrefsRows[0] as RemotePrefs))
  }

  await adapter.setLastSyncAt(syncCompletedAt)
}
