import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Heart, CheckCircle, Trash2 } from 'lucide-react'
import { useOutfit } from '../hooks/useOutfits'
import { useAllActiveItems } from '../hooks/useClosetItems'
import { db } from '../db/db'
import { markOutfitWorn } from '../lib/wearTracking'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { useUIStore } from '../store/uiStore'
import type { ClosetItem } from '@vc/shared'

export function OutfitDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addToast } = useUIStore()
  const [marking, setMarking] = useState(false)

  const outfit = useOutfit(id!)
  const allItems = useAllActiveItems() ?? []

  if (outfit === undefined) return <div className="p-6 text-stone-400">Loading…</div>
  if (!outfit) return <div className="p-6 text-stone-400">Outfit not found.</div>

  const outfitItems = outfit.itemIds
    .map(id => allItems.find(i => i.id === id))
    .filter(Boolean) as ClosetItem[]

  async function handleToggleFavorite() {
    await db.outfits.update(outfit!.id, { isFavorite: !outfit!.isFavorite, updatedAt: Date.now() })
  }

  async function handleMarkWorn() {
    setMarking(true)
    try {
      await markOutfitWorn(outfit!)
      addToast('Marked as worn!')
    } catch {
      addToast('Failed to record wear', 'error')
    } finally {
      setMarking(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this saved outfit?')) return
    await db.outfits.delete(outfit!.id)
    addToast('Outfit deleted')
    navigate('/outfits/saved')
  }

  return (
    <div className="p-6 max-w-2xl space-y-5">
      <button
        onClick={() => navigate('/outfits/saved')}
        className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 transition-colors"
      >
        <ArrowLeft size={16} /> Back to saved outfits
      </button>

      <div className="bg-white rounded-2xl border border-stone-100 p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Badge variant="muted" className="capitalize">{outfit.occasion}</Badge>
            <p className="text-xs text-stone-400 mt-1.5">
              Saved {new Date(outfit.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleToggleFavorite}
              className={`p-2 rounded-xl transition-colors ${outfit.isFavorite ? 'bg-red-50 text-red-500' : 'text-stone-400 hover:bg-stone-100'}`}
            >
              <Heart size={18} fill={outfit.isFavorite ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        {/* Items grid */}
        <div className="grid grid-cols-3 gap-3">
          {outfitItems.map(item => (
            <div
              key={item.id}
              onClick={() => navigate(`/closet/${item.id}`)}
              className="cursor-pointer group"
            >
              <div className="aspect-square rounded-xl overflow-hidden border border-stone-100 group-hover:border-stone-300 transition-colors">
                {item.images[0] ? (
                  <img
                    src={item.images[0]}
                    alt={item.category}
                    className="w-full h-full object-cover"
                    style={{ imageOrientation: 'from-image' }}
                  />
                ) : (
                  <div className="w-full h-full bg-stone-50 flex items-center justify-center text-stone-300">👕</div>
                )}
              </div>
              <p className="text-xs text-stone-500 mt-1 capitalize">{item.category}</p>
              <p className="text-xs text-stone-400 capitalize">{item.colors[0] ?? ''}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-stone-100">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleMarkWorn}
            loading={marking}
          >
            <CheckCircle size={14} /> Mark as Worn
          </Button>
          <Button variant="danger" size="sm" onClick={handleDelete}>
            <Trash2 size={14} /> Delete
          </Button>
        </div>
      </div>
    </div>
  )
}
