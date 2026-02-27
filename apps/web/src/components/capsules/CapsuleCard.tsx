import { useNavigate } from 'react-router-dom'
import type { Capsule, ClosetItem } from '@vc/shared'

interface CapsuleCardProps {
  capsule: Capsule
  items: ClosetItem[]
}

export function CapsuleCard({ capsule, items }: CapsuleCardProps) {
  const navigate = useNavigate()
  const capsuleItems = capsule.itemIds
    .map(id => items.find(i => i.id === id))
    .filter(Boolean) as ClosetItem[]

  return (
    <div
      onClick={() => navigate(`/capsules/${capsule.id}`)}
      className="bg-white rounded-2xl border border-stone-100 p-4 cursor-pointer hover:shadow-sm hover:border-stone-200 transition-all"
    >
      {/* Thumbnail strip */}
      <div className="flex gap-1 mb-3">
        {capsuleItems.slice(0, 4).map(item => (
          <div key={item.id} className="w-12 h-12 rounded-lg overflow-hidden bg-stone-50 border border-stone-100">
            {item.images[0] ? (
              <img
                src={item.images[0]}
                alt=""
                className="w-full h-full object-cover"
                style={{ imageOrientation: 'from-image' }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-300 text-sm">👕</div>
            )}
          </div>
        ))}
        {capsuleItems.length === 0 && (
          <div className="w-12 h-12 rounded-lg bg-stone-50 border border-dashed border-stone-200 flex items-center justify-center text-stone-300 text-sm">
            +
          </div>
        )}
      </div>
      <p className="font-medium text-stone-800 text-sm">{capsule.name}</p>
      <p className="text-xs text-stone-400 mt-0.5">{capsule.itemIds.length} items</p>
    </div>
  )
}
