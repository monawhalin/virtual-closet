import { Heart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { ClosetItem } from '@vc/shared'
import { db } from '../../db/db'
import { clsx } from 'clsx'

interface ClosetItemCardProps {
  item: ClosetItem
}

export function ClosetItemCard({ item }: ClosetItemCardProps) {
  const navigate = useNavigate()

  async function toggleFavorite(e: React.MouseEvent) {
    e.stopPropagation()
    await db.items.update(item.id, { isFavorite: !item.isFavorite, updatedAt: Date.now() })
  }

  return (
    <div
      onClick={() => navigate(`/closet/${item.id}`)}
      className="group relative bg-white rounded-xl overflow-hidden border border-stone-100 cursor-pointer hover:shadow-md hover:border-stone-200 transition-all"
    >
      {/* Image */}
      <div className="aspect-square bg-stone-50 overflow-hidden">
        {item.images[0] ? (
          <img
            src={item.images[0]}
            alt={item.category}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            style={{ imageOrientation: 'from-image' }}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-300 text-3xl">
            👕
          </div>
        )}
      </div>

      {/* Favorite button — min 44×44 touch target */}
      <button
        onClick={toggleFavorite}
        className={clsx(
          'absolute top-1 right-1 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full transition-all',
          item.isFavorite
            ? 'text-red-500'
            : 'text-transparent group-hover:text-stone-400'
        )}
      >
        <span className={clsx(
          'p-1.5 rounded-full transition-all',
          item.isFavorite
            ? 'bg-white shadow-sm'
            : 'bg-white/0 group-hover:bg-white/80'
        )}>
          <Heart size={14} fill={item.isFavorite ? 'currentColor' : 'none'} />
        </span>
      </button>

      {/* Info */}
      <div className="px-2.5 py-2">
        <p className="text-xs font-medium text-stone-700 capitalize">{item.category}</p>
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-xs text-stone-400 capitalize">
            {item.colors.slice(0, 2).join(' · ') || 'No color'}
          </p>
          {item.wearCount > 0 && (
            <span className="text-xs text-stone-400">{item.wearCount}×</span>
          )}
        </div>
      </div>
    </div>
  )
}
