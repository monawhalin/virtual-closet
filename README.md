# Virtual Closet

Most people wear 20% of their wardrobe 80% of the time. I built this to fix that for myself: take photos of what you own, get outfit suggestions weighted toward the stuff you *haven't* been wearing, and keep track of what you actually reach for.

Everything runs offline by default. Cloud sync through Supabase is there if you want it.

## ✨ Features

- **Closet catalog** - Upload photos and the app auto-categorizes them and pulls out dominant colors using on-device ML (TensorFlow.js + MobileNet)
- **Outfit generator** - Suggests combinations based on occasion, what you've worn recently, favorites, and capsule filters
- **Wear tracking** - Log when you wear an outfit and those stats feed back into future suggestions
- **Capsule wardrobes** - Group items into collections like "summer" or "work" and generate outfits within them
- **Lock & regenerate** - Love the shoes but hate the top? Lock what works and regenerate the rest
- **Cross-platform** - Web app (React/Vite) and mobile app (Expo) sharing the same core logic

---

## 📁 Monorepo Structure

```
apps/
  web/          # React + Vite SPA
  mobile/       # Expo (React Native), iOS & Android
packages/
  shared/       # TypeScript types & constants
  outfit-gen/   # Pure outfit generation engine
  ui-shared/    # Image compression, color extraction, sync adapter
```

pnpm workspaces + Turborepo. Packages build before apps.

---

## 🚀 Getting Started

**Prerequisites:** Node 18+, pnpm 9.15+. For mobile: Expo CLI + simulator/emulator.

```bash
git clone https://github.com/monawhalin/virtual-closet.git
cd virtual-closet
pnpm install
pnpm dev        # web on :5173, mobile via Expo
```

### Supabase (optional)

The app works completely offline with no env vars. If you want cloud sync, add your Supabase credentials:

```bash
# apps/web/.env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# apps/mobile/.env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Remote schema is in `supabase-schema.sql`. Each app has a `.env.example` for reference.

---

## 🛠 Tech Stack

| | Web | Mobile |
|---|---|---|
| Framework | React 19 + Vite 6 | Expo 54 / React Native 0.81 |
| Language | TypeScript (strict) | TypeScript (strict) |
| Styling | Tailwind CSS 4 | React Navigation + custom theme |
| Database | Dexie.js v4 (IndexedDB) | expo-sqlite |
| UI state | Zustand v5 | |
| Routing | React Router v7 | Expo Router v6 |
| ML | TensorFlow.js + MobileNet v2 | |
| Sync | Supabase (optional) | Supabase (optional) |

---

## 🧠 Architecture Notes

**Outfit generation** is a pure function in `packages/outfit-gen`. No DB calls, no side effects. It scores items by occasion match, wear recency, and favorites, then does weighted random selection from the top 60% of candidates. Each outfit comes with rationale strings so you can see *why* it picked what it picked.

**Images** get compressed to 800px JPEG (quality 0.8) and stored as base64 data URLs in IndexedDB/SQLite. Simpler than blob references at this scale, and each image ends up around ~80KB.

**Sync** is delta-based. Only records where `updatedAt > lastSyncAt` get exchanged. Both platforms implement the same `SyncAdapter` interface so the core sync logic in `ui-shared` doesn't care which platform it's running on.

**TF.js** is lazy-loaded so it doesn't block initial render. The tfjs chunk is ~2MB gzipped, which is just the cost of shipping MobileNet for on-device inference.

---

## 📋 Commands

```bash
pnpm dev          # Start all dev servers
pnpm build        # Build all apps and packages
pnpm typecheck    # Type-check all workspaces
```

---

## 📄 License

MIT. See [LICENSE](LICENSE) for details.
