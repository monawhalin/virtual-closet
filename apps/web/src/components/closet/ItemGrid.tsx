import type { ClosetItem } from '@vc/shared'
import { ClosetItemCard } from './ClosetItemCard'
import { Shirt } from 'lucide-react'
import { EmptyState } from '../ui/EmptyState'
import { Button } from '../ui/Button'
import { useUIStore } from '../../store/uiStore'

interface ItemGridProps {
  items: ClosetItem[] | undefined
  loading?: boolean
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-stone-100 overflow-hidden animate-pulse">
      <div className="aspect-square bg-stone-100" />
      <div className="px-2.5 py-2 space-y-1.5">
        <div className="h-3 bg-stone-100 rounded w-1/2" />
        <div className="h-3 bg-stone-100 rounded w-2/3" />
      </div>
    </div>
  )
}

export function ItemGrid({ items, loading }: ItemGridProps) {
  const setUploadModalOpen = useUIStore(s => s.setUploadModalOpen)

  if (loading || items === undefined) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<Shirt size={48} />}
        title="Your closet is empty"
        description="Upload your first clothing item to get started."
        action={
          <Button onClick={() => setUploadModalOpen(true)}>Add Item</Button>
        }
      />
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {items.map(item => (
        <ClosetItemCard key={item.id} item={item} />
      ))}
    </div>
  )
}
