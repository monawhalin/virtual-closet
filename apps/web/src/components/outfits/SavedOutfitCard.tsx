import { Heart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Outfit, ClosetItem } from '@vc/shared'
import { Badge } from '../ui/Badge'
import { db } from '../../db/db'

interface SavedOutfitCardProps {
  outfit: Outfit
  items: ClosetItem[]
}

export function SavedOutfitCard({ outfit, items }: SavedOutfitCardProps) {
  const navigate = useNavigate()
  const outfitItems = outfit.itemIds
    .map(id => items.find(i => i.id === id))
    .filter(Boolean) as ClosetItem[]

  async function toggleFavorite(e: React.MouseEvent) {
    e.stopPropagation()
    await db.outfits.update(outfit.id, { isFavorite: !outfit.isFavorite, updatedAt: Date.now() })
  }

  return (
    <div
      onClick={() => navigate(`/outfits/${outfit.id}`)}
      className="bg-white rounded-2xl border border-stone-100 p-4 cursor-pointer hover:shadow-sm hover:border-stone-200 transition-all"
    >
      <div className="flex items-start gap-3">
        {/* Thumbnail mosaic */}
        <div className="flex gap-1 shrink-0">
          {outfitItems.slice(0, 3).map(item => (
            <div key={item.id} className="w-14 h-14 rounded-lg overflow-hidden bg-stone-50 border border-stone-100">
              {item.images[0] ? (
                <img
                  src={item.images[0]}
                  alt=""
                  className="w-full h-full object-cover"
                  style={{ imageOrientation: 'from-image' }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-300">👕</div>
              )}
            </div>
          ))}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="muted" className="capitalize">{outfit.occasion}</Badge>
            {outfit.isFavorite && <Badge variant="accent">Favorite</Badge>}
          </div>
          <p className="text-xs text-stone-400">
            {outfitItems.length} items · {new Date(outfit.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Favorite */}
        <button onClick={toggleFavorite} className="text-stone-300 hover:text-red-400 transition-colors">
          <Heart size={16} fill={outfit.isFavorite ? 'currentColor' : 'none'} className={outfit.isFavorite ? 'text-red-400' : ''} />
        </button>
      </div>
    </div>
  )
}
