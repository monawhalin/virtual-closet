import { useState, useCallback } from 'react'
import { RefreshCw, Sparkles } from 'lucide-react'
import { useAllActiveItems } from '../hooks/useClosetItems'
import { useCapsules } from '../hooks/useCapsules'
import { useUIStore } from '../store/uiStore'
import { OccasionPicker } from '../components/outfits/OccasionPicker'
import { OutfitToggles } from '../components/outfits/OutfitToggles'
import { OutfitCard } from '../components/outfits/OutfitCard'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { generateOutfits, validateCloset } from '@vc/outfit-gen'
import type { Occasion, GeneratorOptions, GeneratedOutfit } from '@vc/shared'
import { useNavigate } from 'react-router-dom'

const DEFAULT_OPTIONS: GeneratorOptions = {
  preferLeastWorn: true,
  avoidRecentDays: 7,
  capsuleOnly: false,
  capsuleId: null,
  preferFavorites: false,
}

function OutfitSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 p-4 animate-pulse space-y-4">
      <div className="flex gap-3 justify-center">
        {[0,1,2].map(i => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="w-20 h-20 rounded-xl bg-stone-100" />
            <div className="h-3 w-12 bg-stone-100 rounded" />
          </div>
        ))}
      </div>
      <div className="bg-stone-50 rounded-xl h-10" />
    </div>
  )
}

export function OutfitGeneratePage() {
  const navigate = useNavigate()
  const allItems = useAllActiveItems()
  const capsules = useCapsules() ?? []
  const { lockedItemIds, clearLocks } = useUIStore()

  const [occasion, setOccasion] = useState<Occasion>('casual')
  const [options, setOptions] = useState<GeneratorOptions>({ ...DEFAULT_OPTIONS })
  const [outfits, setOutfits] = useState<GeneratedOutfit[]>([])
  const [generated, setGenerated] = useState(false)
  const [loading, setLoading] = useState(false)

  const items = allItems ?? []
  const capsuleItems = options.capsuleOnly && options.capsuleId
    ? items.filter(i => {
        const cap = capsules.find(c => c.id === options.capsuleId)
        return cap?.itemIds.includes(i.id) ?? false
      })
    : items

  const validation = validateCloset(capsuleItems)

  const handleGenerate = useCallback(async () => {
    if (!validation.canGenerate) return
    setLoading(true)
    // Brief artificial delay for UX (feels intentional)
    await new Promise(r => setTimeout(r, 300))
    const results = generateOutfits(capsuleItems, occasion, options, lockedItemIds)
    setOutfits(results)
    setGenerated(true)
    setLoading(false)
  }, [capsuleItems, occasion, options, lockedItemIds, validation.canGenerate])

  const handleRegenerate = useCallback(async () => {
    if (!validation.canGenerate) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 300))
    const results = generateOutfits(capsuleItems, occasion, options, lockedItemIds)
    setOutfits(results)
    setLoading(false)
  }, [capsuleItems, occasion, options, lockedItemIds, validation.canGenerate])

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Generate Outfits</h1>
        <p className="text-sm text-stone-400 mt-0.5">Build outfits from your closet</p>
      </div>

      {/* Occasion */}
      <div className="bg-white rounded-2xl border border-stone-100 p-5 space-y-3">
        <h2 className="text-sm font-semibold text-stone-700">Occasion</h2>
        <OccasionPicker value={occasion} onChange={setOccasion} />
      </div>

      {/* Toggles */}
      <div className="bg-white rounded-2xl border border-stone-100 p-5 space-y-3">
        <h2 className="text-sm font-semibold text-stone-700">Options</h2>
        <OutfitToggles options={options} onChange={setOptions} capsules={capsules} />
      </div>

      {/* Generate button */}
      <div className="flex gap-3">
        {!validation.canGenerate ? (
          <div className="flex-1 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <p className="text-sm text-amber-800">{validation.missingMessage}</p>
            <button
              onClick={() => navigate('/closet')}
              className="text-xs text-amber-600 underline mt-1"
            >
              Go to My Closet →
            </button>
          </div>
        ) : (
          <>
            <Button onClick={handleGenerate} loading={loading} className="flex-1">
              <Sparkles size={16} />
              {generated ? 'Regenerate' : 'Generate Outfits'}
            </Button>
            {generated && lockedItemIds.length > 0 && (
              <Button variant="secondary" onClick={clearLocks} size="md">
                Clear locks
              </Button>
            )}
          </>
        )}
      </div>

      {/* Results */}
      {loading && (
        <div className="space-y-4">
          {[0,1,2].map(i => <OutfitSkeleton key={i} />)}
        </div>
      )}

      {!loading && generated && outfits.length === 0 && (
        <EmptyState
          title="No outfits generated"
          description="Try turning off some filters or adding more items to your closet."
        />
      )}

      {!loading && outfits.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-stone-500">{outfits.length} outfit{outfits.length !== 1 ? 's' : ''} generated</p>
            <button
              onClick={handleRegenerate}
              className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 transition-colors"
            >
              <RefreshCw size={14} /> Shuffle all
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {outfits.map((outfit, i) => (
              <OutfitCard
                key={i}
                outfit={outfit}
                occasion={occasion}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
