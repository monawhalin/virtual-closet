# Virtual Closet

Most people wear 20% of their wardrobe 80% of the time. Virtual Closet helps you break that pattern — catalog your clothes, generate outfit ideas based on what you actually haven't worn lately, and track what you reach for over time.

Runs entirely offline. Cloud sync via Supabase is optional.

## Features

- **Closet catalog** — Upload photos of clothing items; the app auto-suggests category and extracts dominant colors using on-device ML (TensorFlow.js + MobileNet)
- **Outfit generator** — Picks combinations based on occasion, wear history, and your preferences (avoid recently worn, prefer favorites, capsule-only mode)
- **Wear tracking** — Mark outfits as worn; item stats update automatically and feed back into generation scoring
- **Capsule wardrobes** — Group items into named subsets (e.g. "summer", "work") and generate outfits within them
- **Lock & regenerate** — Pin specific items and regenerate the rest of the outfit around them
- **Cross-platform** — React/Vite web app + Expo mobile app sharing the same logic

---

## Monorepo Structure

```
apps/
  web/          # React + Vite SPA
  mobile/       # Expo (React Native) — iOS & Android
packages/
  shared/       # TypeScript types & constants
  outfit-gen/   # Pure outfit generation engine
  ui-shared/    # Image compression, color extraction, sync adapter
```

Built with pnpm workspaces + Turborepo. Packages are built before apps.

---

## Getting Started

**Prerequisites:** Node 18+, pnpm 9.15+. For mobile: Expo CLI + iOS Simulator or Android emulator.

```bash
git clone https://github.com/monawhalin/virtual-closet.git
cd virtual-closet
pnpm install
pnpm dev        # web on :5173, mobile via Expo
```

**Supabase (optional)** — the app is fully functional offline. To enable cloud sync:

```bash
# apps/web/.env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# apps/mobile/.env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

See `supabase-schema.sql` for the remote schema. `.env.example` files are included in each app.

---

## Tech Stack

| | Web | Mobile |
|---|---|---|
| Framework | React 19 + Vite 6 | Expo 54 / React Native 0.81 |
| Language | TypeScript (strict) | TypeScript (strict) |
| Styling | Tailwind CSS 4 | React Navigation + custom theme |
| Database | Dexie.js v4 (IndexedDB) | expo-sqlite |
| UI state | Zustand v5 | — |
| Routing | React Router v7 | Expo Router v6 |
| ML | TensorFlow.js + MobileNet v2 | — |
| Sync | Supabase (optional) | Supabase (optional) |

---

## Architecture Notes

**Outfit generation** lives in `packages/outfit-gen` as a pure function — no DB calls, no side effects. It scores candidates by occasion match, wear recency, and favorites, then picks via weighted random selection from the top 60%. Rationale strings explain which rules applied to each outfit.

**Images** are stored as compressed base64 data URLs (800px, JPEG 0.8) directly in IndexedDB/SQLite — simpler than Blob references for this scale (~80KB/image).

**Sync** is delta-based: only records with `updatedAt > lastSyncAt` are exchanged. Both platforms implement a common `SyncAdapter` interface so the sync logic in `ui-shared` is platform-agnostic.

**TF.js** is lazy-loaded to keep initial bundle fast. The tfjs chunk is ~2MB gzipped — expected for on-device MobileNet inference.

---

## Commands

```bash
pnpm dev          # Start all dev servers
pnpm build        # Build all apps and packages
pnpm typecheck    # Type-check all workspaces
```
