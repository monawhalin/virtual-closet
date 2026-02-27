import { BookOpen } from 'lucide-react'
import { useSavedOutfits } from '../hooks/useOutfits'
import { useAllActiveItems } from '../hooks/useClosetItems'
import { SavedOutfitCard } from '../components/outfits/SavedOutfitCard'
import { EmptyState } from '../components/ui/EmptyState'
import { Button } from '../components/ui/Button'
import { useNavigate } from 'react-router-dom'

export function SavedOutfitsPage() {
  const outfits = useSavedOutfits()
  const items = useAllActiveItems() ?? []
  const navigate = useNavigate()

  if (outfits === undefined) {
    return <div className="p-6 text-stone-400">Loading…</div>
  }

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Saved Outfits</h1>
        {outfits.length > 0 && (
          <p className="text-sm text-stone-400 mt-0.5">{outfits.length} outfit{outfits.length !== 1 ? 's' : ''}</p>
        )}
      </div>

      {outfits.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={48} />}
          title="No saved outfits yet"
          description="Generate outfits and save the ones you love."
          action={<Button onClick={() => navigate('/outfits/generate')}>Generate Outfits</Button>}
        />
      ) : (
        <div className="space-y-3 max-w-2xl">
          {outfits.map(outfit => (
            <SavedOutfitCard key={outfit.id} outfit={outfit} items={items} />
          ))}
        </div>
      )}
    </div>
  )
}
