# Virtual Closet MVP — Plan Summary

## What We're Building
A local-first virtual closet web app. Users upload clothing photos, get AI-assisted tagging, generate outfits from owned items, and track wear history. All data lives in the browser (IndexedDB). No backend, no cloud, no auth.

## Tech Stack
| Layer | Choice |
|-------|--------|
| Framework | React 19 + Vite 7 + TypeScript |
| Storage | IndexedDB via Dexie.js + dexie-react-hooks |
| AI Tagging | TensorFlow.js + MobileNet (runs entirely in-browser) |
| Styling | Tailwind CSS 4 |
| UI State | Zustand |
| Routing | React Router v7 |

## 7 Build Phases

| Phase | What Gets Built |
|-------|----------------|
| 0 — Scaffold | Vite project, Tailwind, AppShell with sidebar nav, all routes stubbed |
| 1 — Database | Dexie schema: Items, Capsules, Outfits, WearEvents, UserPrefs |
| 2 — Image Pipeline | Upload → compress (max 800px JPEG) → color extract → TF.js category suggestion |
| 3 — Closet System | Item grid, upload modal, filters, search, edit/archive/delete |
| 4 — Outfit Engine | Rule-based generator: occasion picker, toggles, 3-10 outfits with rationale text |
| 5 — Wear Tracking | Mark outfit worn, wearCount + lastWornAt per item, drives least-worn logic |
| 6 — Personalization | Favorites, capsules (named subsets), lock items + regenerate around them |
| 7 — Polish | Empty states, onboarding prompts, skeleton animations, perf check |

## Key Pages / Routes
- `/closet` — item grid with filters and upload
- `/closet/:id` — item detail, wear stats, edit/archive
- `/outfits/generate` — occasion + toggles → generate outfits → save/mark worn
- `/outfits/saved` — saved outfit list
- `/capsules` — manage named item subsets

## Outfit Generation Logic
Valid outfit = **(top + bottom + shoes)** OR **(dress/jumpsuit + shoes)** + optional outerwear + optional accessory

Toggles:
- **Prefer least worn** — scores items by inverse wear count
- **Avoid recent** — excludes items worn within N days
- **Capsule only** — restricts to a named capsule's items
- **Prefer favorites** — adds score bonus to favorited items

Each outfit includes rationale text explaining which rules were applied.

## Data Stored Locally (IndexedDB)
- `ClosetItem`: images (base64), category, colors, tags, season, brand, notes, wearCount, lastWornAt, isFavorite, status
- `Capsule`: name, itemIds[]
- `Outfit`: itemIds[], occasion, isFavorite
- `OutfitWearEvent`: outfitId, wornAt, snapshot of item IDs
- `UserPrefs`: avoidRepeatDays, preferFavorites

## Key Technical Notes
- TF.js MobileNet model preloads on app start so it's ready before first upload
- Images are compressed to max 800px / JPEG 0.8 before storage (~40-120KB each)
- EXIF rotation handled via CSS `image-orientation: from-image` (no extra library)
- All multi-table DB writes use Dexie transactions to prevent partial state on tab close
- Zustand holds only ephemeral UI state (filters, modals, locks); Dexie is the data source of truth
