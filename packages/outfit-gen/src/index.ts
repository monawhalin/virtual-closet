import type { ClosetItem, Occasion, GeneratorOptions, GeneratedOutfit } from '@vc/shared'

const OCCASION_TAGS: Record<Occasion, string[]> = {
  casual:  ['casual', 'everyday', 'relaxed', 'denim', 'sneakers', 'basic', 'comfy'],
  work:    ['work', 'formal', 'professional', 'business', 'blazer', 'office', 'smart'],
  date:    ['date', 'elegant', 'chic', 'romantic', 'dressy', 'stylish'],
  formal:  ['formal', 'gala', 'black tie', 'suit', 'gown', 'ceremony', 'event'],
  gym:     ['gym', 'athletic', 'activewear', 'sport', 'workout', 'running', 'yoga'],
}

function occasionScore(item: ClosetItem, occasion: Occasion): number {
  const tags = OCCASION_TAGS[occasion]
  const itemText = [...item.tags, item.category, item.notes ?? '', item.brand ?? '']
    .join(' ')
    .toLowerCase()
  return tags.some(t => itemText.includes(t)) ? 5 : 0
}

function scoreItem(
  item: ClosetItem,
  occasion: Occasion,
  maxWearCount: number,
  opts: GeneratorOptions
): number {
  let score = 0
  if (opts.preferLeastWorn && maxWearCount > 0) {
    score += maxWearCount - item.wearCount
  }
  if (opts.preferFavorites && item.isFavorite) {
    score += 10
  }
  score += occasionScore(item, occasion)
  // Small random jitter so we don't always get the exact same outfit
  score += Math.random() * 2
  return score
}

interface ScoredItem extends ClosetItem {
  _score: number
}

function outfitSignature(outfit: GeneratedOutfit): string {
  return [
    outfit.top?.id,
    outfit.bottom?.id,
    outfit.dress?.id,
    outfit.jumpsuit?.id,
    outfit.shoes.id,
    outfit.outerwear?.id,
    outfit.accessory?.id,
  ]
    .filter(Boolean)
    .sort()
    .join('|')
}

function weightedPick(items: ScoredItem[]): ScoredItem | undefined {
  if (items.length === 0) return undefined
  const sorted = [...items].sort((a, b) => b._score - a._score)
  const poolSize = Math.max(1, Math.ceil(sorted.length * 0.6))
  const pool = sorted.slice(0, poolSize)
  const totalScore = pool.reduce((sum, i) => sum + Math.max(i._score, 0.1), 0)
  let rand = Math.random() * totalScore
  for (const item of pool) {
    rand -= Math.max(item._score, 0.1)
    if (rand <= 0) return item
  }
  return pool[0]
}

function buildRationale(opts: GeneratorOptions, occasion: Occasion): string[] {
  const lines: string[] = []
  lines.push(`Built for ${occasion.charAt(0).toUpperCase() + occasion.slice(1)}.`)
  if (opts.preferLeastWorn) lines.push('Prioritized least-worn items.')
  if (opts.avoidRecentDays > 0) lines.push(`Avoided items worn in the last ${opts.avoidRecentDays} days.`)
  if (opts.preferFavorites) lines.push('Boosted your favorited items.')
  if (opts.capsuleOnly && opts.capsuleId) lines.push('Filtered to your selected capsule.')
  return lines
}

export function generateOutfits(
  allItems: ClosetItem[],
  occasion: Occasion,
  opts: GeneratorOptions,
  lockedItemIds: string[] = []
): GeneratedOutfit[] {
  const now = Date.now()
  const avoidMs = opts.avoidRecentDays * 24 * 60 * 60 * 1000

  const eligible = allItems.filter(item => {
    if (item.status !== 'active') return false
    if (opts.avoidRecentDays > 0 && item.lastWornAt) {
      const isLocked = lockedItemIds.includes(item.id)
      if (!isLocked && now - item.lastWornAt < avoidMs) return false
    }
    return true
  })

  const maxWearCount = Math.max(...eligible.map(i => i.wearCount), 0)

  const scored: ScoredItem[] = eligible.map(item => ({
    ...item,
    _score: scoreItem(item, occasion, maxWearCount, opts),
  }))

  // Build a lookup map for scored items
  const scoredById = new Map<string, ScoredItem>(scored.map(i => [i.id, i]))

  // Bucket by category
  const tops       = scored.filter(i => i.category === 'top')
  const bottoms    = scored.filter(i => i.category === 'bottom')
  const dresses    = scored.filter(i => i.category === 'dress')
  const jumpsuits  = scored.filter(i => i.category === 'jumpsuit')
  const shoes      = scored.filter(i => i.category === 'shoes')
  const outerwear  = scored.filter(i => i.category === 'outerwear')
  const accessories = scored.filter(i => i.category === 'accessory')

  // Locked items — resolve from scored map or fall back to original
  const lockedItems = allItems.filter(i => lockedItemIds.includes(i.id))
  const getLockedByCategory = (cat: ClosetItem['category']): ScoredItem | undefined => {
    const found = lockedItems.find(i => i.category === cat)
    if (!found) return undefined
    return scoredById.get(found.id) ?? { ...found, _score: 0 }
  }

  const canMakeTopBottom = tops.length > 0 && bottoms.length > 0 && shoes.length > 0
  const canMakeDress = (dresses.length > 0 || jumpsuits.length > 0) && shoes.length > 0

  if (!canMakeTopBottom && !canMakeDress) return []

  const rationale = buildRationale(opts, occasion)
  const results: GeneratedOutfit[] = []
  const signatures = new Set<string>()
  const MAX_ATTEMPTS = 50
  let attempts = 0

  while (results.length < 10 && attempts < MAX_ATTEMPTS) {
    attempts++
    let outfit: GeneratedOutfit | null = null

    const lockedDress    = getLockedByCategory('dress')
    const lockedJumpsuit = getLockedByCategory('jumpsuit')
    const lockedTop      = getLockedByCategory('top')
    const lockedBottom   = getLockedByCategory('bottom')
    const lockedShoes    = getLockedByCategory('shoes')
    const lockedOuterwear = getLockedByCategory('outerwear')
    const lockedAccessory = getLockedByCategory('accessory')

    const useDressStyle =
      !!(lockedDress || lockedJumpsuit) ||
      (!lockedTop && !lockedBottom && canMakeDress && Math.random() < 0.3)

    const lockedShoesId    = lockedShoes?.id
    const lockedTopId      = lockedTop?.id
    const lockedBottomId   = lockedBottom?.id

    if (useDressStyle && (dresses.length > 0 || jumpsuits.length > 0 || lockedDress || lockedJumpsuit)) {
      const pickedDressOrJumpsuit = lockedDress ?? lockedJumpsuit ??
        (Math.random() < 0.5 ? weightedPick(dresses) : weightedPick(jumpsuits))
      const pickedShoes = lockedShoes ?? weightedPick(shoes.filter(s => s.id !== lockedShoesId))

      if (pickedDressOrJumpsuit && pickedShoes) {
        const dressScore = pickedDressOrJumpsuit._score + pickedShoes._score
        outfit = {
          ...(pickedDressOrJumpsuit.category === 'dress'
            ? { dress: pickedDressOrJumpsuit }
            : { jumpsuit: pickedDressOrJumpsuit }),
          shoes: pickedShoes,
          rationale,
          score: dressScore,
        }
      }
    }

    if (!outfit && canMakeTopBottom) {
      const pickedTop    = lockedTop    ?? weightedPick(tops.filter(t => t.id !== lockedTopId))
      const pickedBottom = lockedBottom ?? weightedPick(bottoms.filter(b => b.id !== lockedBottomId))
      const pickedShoes  = lockedShoes  ?? weightedPick(shoes.filter(s => s.id !== lockedShoesId))

      if (pickedTop && pickedBottom && pickedShoes) {
        outfit = {
          top: pickedTop,
          bottom: pickedBottom,
          shoes: pickedShoes,
          rationale,
          score: pickedTop._score + pickedBottom._score + pickedShoes._score,
        }
      }
    }

    if (!outfit) continue

    if (outerwear.length > 0 && Math.random() < 0.3) {
      outfit.outerwear = lockedOuterwear ?? weightedPick(outerwear)
    } else if (lockedOuterwear) {
      outfit.outerwear = lockedOuterwear
    }

    if (accessories.length > 0 && Math.random() < 0.4) {
      outfit.accessory = lockedAccessory ?? weightedPick(accessories)
    } else if (lockedAccessory) {
      outfit.accessory = lockedAccessory
    }

    const sig = outfitSignature(outfit)
    if (!signatures.has(sig)) {
      signatures.add(sig)
      results.push(outfit)
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, 10)
}

export function validateCloset(items: ClosetItem[]): {
  canGenerate: boolean
  missingMessage: string
} {
  const active = items.filter(i => i.status === 'active')
  const hasTops    = active.some(i => i.category === 'top')
  const hasBottoms = active.some(i => i.category === 'bottom')
  const hasDresses = active.some(i => i.category === 'dress' || i.category === 'jumpsuit')
  const hasShoes   = active.some(i => i.category === 'shoes')

  const hasOutfitCombo = (hasTops && hasBottoms && hasShoes) || (hasDresses && hasShoes)

  if (!hasShoes) {
    return { canGenerate: false, missingMessage: 'Add some shoes to generate outfits.' }
  }
  if (!hasOutfitCombo) {
    return {
      canGenerate: false,
      missingMessage: 'Add at least a top + bottom, or a dress/jumpsuit, to generate outfits.',
    }
  }
  return { canGenerate: true, missingMessage: '' }
}
