import * as SQLite from 'expo-sqlite'

// Open (or create) the database synchronously
const database = SQLite.openDatabaseSync('virtual_closet.db')

// ─── Bootstrap schema ────────────────────────────────────────────────────────

database.execSync(`
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS items (
    id            TEXT PRIMARY KEY,
    images        TEXT NOT NULL DEFAULT '[]',
    category      TEXT NOT NULL DEFAULT 'top',
    colors        TEXT NOT NULL DEFAULT '[]',
    tags          TEXT NOT NULL DEFAULT '[]',
    season        TEXT,
    brand         TEXT,
    url           TEXT,
    notes         TEXT,
    isFavorite    INTEGER NOT NULL DEFAULT 0,
    status        TEXT NOT NULL DEFAULT 'active',
    wearCount     INTEGER NOT NULL DEFAULT 0,
    lastWornAt    INTEGER,
    createdAt     INTEGER NOT NULL,
    updatedAt     INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
  );

  CREATE TABLE IF NOT EXISTS capsules (
    id        TEXT PRIMARY KEY,
    name      TEXT NOT NULL,
    itemIds   TEXT NOT NULL DEFAULT '[]',
    updatedAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
  );

  CREATE TABLE IF NOT EXISTS outfits (
    id          TEXT PRIMARY KEY,
    itemIds     TEXT NOT NULL DEFAULT '[]',
    occasion    TEXT NOT NULL,
    capsuleId   TEXT,
    isFavorite  INTEGER NOT NULL DEFAULT 0,
    createdAt   INTEGER NOT NULL,
    updatedAt   INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
  );

  CREATE TABLE IF NOT EXISTS wear_events (
    id               TEXT PRIMARY KEY,
    outfitId         TEXT NOT NULL,
    wornAt           INTEGER NOT NULL,
    itemIdsSnapshot  TEXT NOT NULL DEFAULT '[]',
    updatedAt        INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
  );

  CREATE TABLE IF NOT EXISTS user_prefs (
    id                INTEGER PRIMARY KEY DEFAULT 1,
    avoidRepeatDays   INTEGER NOT NULL DEFAULT 7,
    preferFavorites   INTEGER NOT NULL DEFAULT 0,
    updatedAt         INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
  );

  INSERT OR IGNORE INTO user_prefs (id, avoidRepeatDays, preferFavorites, updatedAt)
  VALUES (1, 7, 0, ${Date.now()});
`)

// ─── Raw row shape (as stored in SQLite) ────────────────────────────────────

export interface ItemRow {
  id: string
  images: string      // JSON array
  category: string
  colors: string      // JSON array
  tags: string        // JSON array
  season: string | null
  brand: string | null
  url: string | null
  notes: string | null
  isFavorite: number  // 0 | 1
  status: string
  wearCount: number
  lastWornAt: number | null
  createdAt: number
  updatedAt: number
}

export interface ItemRowUpdate {
  images?: string
  category?: string
  colors?: string
  tags?: string
  season?: string | null
  brand?: string | null
  url?: string | null
  notes?: string | null
  isFavorite?: number
  status?: string
  wearCount?: number
  lastWornAt?: number | null
}

export interface CapsuleRow {
  id: string
  name: string
  itemIds: string  // JSON array of item IDs
  updatedAt: number
}

// ─── Database helpers ────────────────────────────────────────────────────────

export const db = {
  // Items
  getAllItems(): ItemRow[] {
    return database.getAllSync<ItemRow>(
      `SELECT * FROM items WHERE status != 'deleted' ORDER BY createdAt DESC`
    )
  },

  getItem(id: string): ItemRow | null {
    return database.getFirstSync<ItemRow>(`SELECT * FROM items WHERE id = ?`, [id]) ?? null
  },

  addItem(row: Omit<ItemRow, 'updatedAt'>): void {
    const now = Date.now()
    database.runSync(
      `INSERT INTO items (id, images, category, colors, tags, season, brand, url, notes,
        isFavorite, status, wearCount, lastWornAt, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        row.id, row.images, row.category, row.colors, row.tags,
        row.season, row.brand, row.url, row.notes,
        row.isFavorite, row.status, row.wearCount, row.lastWornAt ?? null,
        row.createdAt, now,
      ]
    )
  },

  updateItem(id: string, updates: ItemRowUpdate): void {
    const now = Date.now()
    const entries = Object.entries({ ...updates, updatedAt: now })
    const setClauses = entries.map(([k]) => `${k} = ?`).join(', ')
    const values = [...entries.map(([, v]) => v ?? null), id]
    database.runSync(`UPDATE items SET ${setClauses} WHERE id = ?`, values)
  },

  deleteItem(id: string): void {
    database.runSync(`DELETE FROM items WHERE id = ?`, [id])
  },

  searchItems(query: string): ItemRow[] {
    const q = `%${query.toLowerCase()}%`
    return database.getAllSync<ItemRow>(
      `SELECT * FROM items
       WHERE status != 'deleted'
         AND (lower(category) LIKE ? OR lower(brand) LIKE ? OR lower(tags) LIKE ?)
       ORDER BY createdAt DESC`,
      [q, q, q]
    )
  },

  // Capsules
  getAllCapsules(): CapsuleRow[] {
    return database.getAllSync<CapsuleRow>(`SELECT * FROM capsules ORDER BY updatedAt DESC`)
  },

  getCapsule(id: string): CapsuleRow | null {
    return database.getFirstSync<CapsuleRow>(`SELECT * FROM capsules WHERE id = ?`, [id]) ?? null
  },

  addCapsule(row: Omit<CapsuleRow, 'updatedAt'>): void {
    const now = Date.now()
    database.runSync(
      `INSERT INTO capsules (id, name, itemIds, updatedAt) VALUES (?, ?, ?, ?)`,
      [row.id, row.name, row.itemIds, now]
    )
  },

  deleteCapsule(id: string): void {
    database.runSync(`DELETE FROM capsules WHERE id = ?`, [id])
  },

  // Bulk upsert for sync
  bulkUpsertItems(rows: ItemRow[]): void {
    database.withTransactionSync(() => {
      for (const row of rows) {
        database.runSync(
          `INSERT OR REPLACE INTO items
             (id, images, category, colors, tags, season, brand, url, notes,
              isFavorite, status, wearCount, lastWornAt, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            row.id, row.images, row.category, row.colors, row.tags,
            row.season, row.brand, row.url, row.notes,
            row.isFavorite, row.status, row.wearCount, row.lastWornAt ?? null,
            row.createdAt, row.updatedAt,
          ]
        )
      }
    })
  },
}
