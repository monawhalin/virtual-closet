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

  const title = item.brand
    ? item.brand.toUpperCase()
    : item.category.charAt(0).toUpperCase() + item.category.slice(1)

  const subtitle =
    item.tags.slice(0, 2).join(', ') ||
    item.colors.slice(0, 2).join(' · ') ||
    item.category

  return (
    <div
      onClick={() => navigate(`/closet/${item.id}`)}
      className="group flex flex-col gap-3 cursor-pointer"
    >
      {/* Card image area */}
      <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-white dark:bg-surface-dark/50 border border-stone-100 dark:border-border-dark shadow-sm hover:shadow-md transition-all duration-300">
        {/* Favorite button — appears on hover */}
        <button
          onClick={toggleFavorite}
          className={clsx(
            'absolute top-3 right-3 z-10 size-8 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-200',
            item.isFavorite
              ? 'opacity-100 bg-white/20 text-red-500'
              : 'opacity-0 group-hover:opacity-100 bg-black/20 text-white hover:bg-primary'
          )}
        >
          <Heart
            size={14}
            fill={item.isFavorite ? 'currentColor' : 'none'}
          />
        </button>

        {/* Image */}
        {item.images[0] ? (
          <div className="w-full h-full p-4 transform group-hover:scale-105 transition-transform duration-500 ease-out">
            <img
              src={item.images[0]}
              alt={item.category}
              className="w-full h-full object-contain"
              style={{ imageOrientation: 'from-image' }}
              loading="lazy"
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-300 dark:text-slate-600 text-4xl">
            👕
          </div>
        )}
      </div>

      {/* Info below card */}
      <div className="px-1">
        <p className="text-stone-900 dark:text-white text-xs font-bold tracking-wider uppercase mb-0.5">
          {title}
        </p>
        <p className="text-stone-500 dark:text-slate-400 text-sm font-normal leading-tight capitalize truncate">
          {subtitle}
        </p>
      </div>
    </div>
  )
}
