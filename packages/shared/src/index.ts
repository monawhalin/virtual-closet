export type Category =
  | 'top'
  | 'bottom'
  | 'dress'
  | 'jumpsuit'
  | 'outerwear'
  | 'shoes'
  | 'accessory'

export type Season = 'spring' | 'summer' | 'fall' | 'winter' | 'all'

export type Occasion = 'casual' | 'work' | 'date' | 'formal' | 'gym'

export type ItemStatus = 'active' | 'archived'

export interface ClosetItem {
  id: string
  images: string[]      // base64 data URLs (compressed)
  category: Category
  colors: string[]
  tags: string[]
  season?: Season
  brand?: string
  url?: string          // product/reference URL
  notes?: string
  isFavorite: boolean
  status: ItemStatus
  wearCount: number
  lastWornAt?: number   // epoch ms
  createdAt: number     // epoch ms
  updatedAt: number     // epoch ms — set on every write, used for delta sync
}

export interface Capsule {
  id: string
  name: string
  itemIds: string[]
  updatedAt: number     // epoch ms
}

export interface Outfit {
  id: string
  itemIds: string[]
  occasion: Occasion
  capsuleId?: string
  isFavorite: boolean
  createdAt: number     // epoch ms
  updatedAt: number     // epoch ms
}

export interface OutfitWearEvent {
  id: string
  outfitId: string
  wornAt: number
  itemIdsSnapshot: string[]
  updatedAt: number     // epoch ms
}

export interface UserPrefs {
  id: 1
  avoidRepeatDays: number
  preferFavorites: boolean
  updatedAt: number     // epoch ms
}

export interface FilterState {
  category: Category | ''
  color: string
  season: Season | ''
  tag: string
  search: string
}

export interface GeneratorOptions {
  preferLeastWorn: boolean
  avoidRecentDays: number
  capsuleOnly: boolean
  capsuleId: string | null
  preferFavorites: boolean
}

export interface GeneratedOutfit {
  top?: ClosetItem
  bottom?: ClosetItem
  dress?: ClosetItem
  jumpsuit?: ClosetItem
  shoes: ClosetItem
  outerwear?: ClosetItem
  accessory?: ClosetItem
  rationale: string[]
  score: number
}

export const CATEGORIES: Category[] = [
  'top', 'bottom', 'dress', 'jumpsuit', 'outerwear', 'shoes', 'accessory',
]

export const SEASONS: Season[] = ['spring', 'summer', 'fall', 'winter', 'all']

export const OCCASIONS: Occasion[] = ['casual', 'work', 'date', 'formal', 'gym']

export const NAMED_COLORS = [
  'black', 'white', 'grey', 'navy', 'blue', 'red', 'pink',
  'orange', 'yellow', 'green', 'purple', 'brown', 'beige', 'cream',
]
