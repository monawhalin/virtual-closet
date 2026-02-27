import { X } from 'lucide-react'
import { CATEGORIES, SEASONS, NAMED_COLORS } from '@vc/shared'
import { useUIStore } from '../../store/uiStore'
import { clsx } from 'clsx'

interface FilterSidebarProps {
  className?: string
}

export function FilterSidebar({ className }: FilterSidebarProps) {
  const { filters, setFilter, clearFilters } = useUIStore()
  const hasFilters = filters.category || filters.color || filters.season || filters.tag

  return (
    <aside className={clsx('w-48 shrink-0 space-y-5', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-stone-700">Filters</span>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-stone-400 hover:text-stone-700 flex items-center gap-1"
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* Category */}
      <div>
        <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-2">Category</p>
        <div className="space-y-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter('category', filters.category === cat ? '' : cat)}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-sm capitalize transition-colors ${
                filters.category === cat
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div>
        <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-2">Color</p>
        <div className="flex flex-wrap gap-1.5">
          {NAMED_COLORS.map(color => (
            <button
              key={color}
              onClick={() => setFilter('color', filters.color === color ? '' : color)}
              className={`px-2 py-1 rounded-md text-xs capitalize transition-colors ${
                filters.color === color
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      {/* Season */}
      <div>
        <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-2">Season</p>
        <div className="space-y-1">
          {SEASONS.map(s => (
            <button
              key={s}
              onClick={() => setFilter('season', filters.season === s ? '' : s)}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-sm capitalize transition-colors ${
                filters.season === s
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}
