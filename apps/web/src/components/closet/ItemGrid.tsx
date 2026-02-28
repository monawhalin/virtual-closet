import type { ClosetItem } from '@vc/shared'
import { ClosetItemCard } from './ClosetItemCard'
import { useUIStore } from '../../store/uiStore'

interface ItemGridProps {
  items: ClosetItem[] | undefined
}

function SkeletonCard() {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      <div className="aspect-[3/4] rounded-lg bg-stone-100 dark:bg-surface-dark" />
      <div className="px-1 space-y-1.5">
        <div className="h-2.5 bg-stone-100 dark:bg-surface-dark rounded w-1/3" />
        <div className="h-3 bg-stone-100 dark:bg-surface-dark rounded w-2/3" />
      </div>
    </div>
  )
}

export function ItemGrid({ items }: ItemGridProps) {
  const setUploadModalOpen = useUIStore(s => s.setUploadModalOpen)

  if (items === undefined) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
        {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="text-6xl mb-6">👗</div>
        <h3 className="text-stone-900 dark:text-white text-lg font-bold font-serif mb-2">
          Your closet is empty
        </h3>
        <p className="text-stone-500 dark:text-slate-400 text-sm max-w-xs leading-relaxed mb-8">
          Start building your archive by uploading your first piece.
        </p>
        <button
          onClick={() => setUploadModalOpen(true)}
          className="flex items-center gap-2 rounded-lg h-10 px-6 bg-primary hover:bg-blue-600 transition-colors text-white text-sm font-bold shadow-lg shadow-blue-900/20"
        >
          Add First Item
        </button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
      {items.map(item => (
        <ClosetItemCard key={item.id} item={item} />
      ))}
    </div>
  )
}
