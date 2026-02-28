import { useLiveQuery } from 'dexie-react-hooks'
import { CATEGORIES, SEASONS } from '@vc/shared'
import { db } from '../../db/db'
import { useUIStore } from '../../store/uiStore'
import { clsx } from 'clsx'

interface FilterSidebarProps {
  className?: string
}

const COLOR_HEX: Record<string, string> = {
  black: '#111111',
  white: '#FFFFFF',
  grey: '#9CA3AF',
  navy: '#1e3a5f',
  blue: '#3B82F6',
  red: '#EF4444',
  pink: '#F472B6',
  orange: '#F97316',
  yellow: '#EAB308',
  green: '#22C55E',
  purple: '#A855F7',
  brown: '#92400E',
  beige: '#D4A88A',
  cream: '#FEFCE8',
}

const SEASON_LABELS: Record<string, string> = {
  spring: 'Spring',
  summer: 'Summer',
  fall: 'Fall / Winter',
  winter: 'Winter',
  all: 'All Season',
}

export function FilterSidebar({ className }: FilterSidebarProps) {
  const { filters, setFilter, clearFilters } = useUIStore()

  const allTags = useLiveQuery(async () => {
    const items = await db.items.where('status').equals('active').toArray()
    const tagSet = new Set<string>()
    items.forEach(item => item.tags.forEach(t => tagSet.add(t)))
    return Array.from(tagSet).sort()
  }, []) ?? []

  const hasFilters = filters.category || filters.color || filters.season || filters.tag

  return (
    <aside className={clsx('flex flex-col bg-white dark:bg-[#131b24]', className)}>
      <div className="p-6 flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-stone-900 dark:text-white text-lg font-bold font-serif">Filters</h3>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-stone-400 dark:text-slate-500 hover:text-stone-700 dark:hover:text-slate-200 transition-colors text-sm font-medium"
            >
              Reset All
            </button>
          )}
        </div>

        {/* Color */}
        <div>
          <h4 className="text-stone-700 dark:text-slate-200 text-xs font-bold uppercase tracking-wider mb-4">
            Color
          </h4>
          <div className="grid grid-cols-5 gap-3">
            {Object.entries(COLOR_HEX).map(([name, hex]) => {
              const isActive = filters.color === name
              return (
                <button
                  key={name}
                  title={name}
                  onClick={() => setFilter('color', isActive ? '' : name)}
                  className={clsx(
                    'size-8 rounded-full transition-all border',
                    isActive
                      ? 'ring-2 ring-offset-2 ring-primary ring-offset-white dark:ring-offset-[#131b24]'
                      : 'hover:scale-110',
                    name === 'white'
                      ? 'border-stone-300 dark:border-slate-600'
                      : 'border-transparent'
                  )}
                  style={{ backgroundColor: hex }}
                />
              )
            })}
          </div>
        </div>

        {/* Category */}
        <div>
          <h4 className="text-stone-700 dark:text-slate-200 text-xs font-bold uppercase tracking-wider mb-4">
            Category
          </h4>
          <div className="flex flex-col gap-1.5">
            {CATEGORIES.map(cat => (
              <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                <div
                  onClick={() => setFilter('category', filters.category === cat ? '' : cat)}
                  className={clsx(
                    'size-5 border rounded flex items-center justify-center transition-colors shrink-0',
                    filters.category === cat
                      ? 'border-primary bg-primary'
                      : 'border-stone-300 dark:border-slate-600 group-hover:border-primary'
                  )}
                >
                  {filters.category === cat && (
                    <svg className="size-3 text-white" fill="none" viewBox="0 0 12 12">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span
                  onClick={() => setFilter('category', filters.category === cat ? '' : cat)}
                  className="text-stone-600 dark:text-slate-300 text-sm capitalize"
                >
                  {cat}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Season */}
        <div>
          <h4 className="text-stone-700 dark:text-slate-200 text-xs font-bold uppercase tracking-wider mb-4">
            Season
          </h4>
          <div className="flex flex-col gap-2">
            {SEASONS.map(s => (
              <label key={s} className="flex items-center gap-3 cursor-pointer group">
                <div
                  onClick={() => setFilter('season', filters.season === s ? '' : s)}
                  className={clsx(
                    'size-5 border rounded flex items-center justify-center transition-colors shrink-0',
                    filters.season === s
                      ? 'border-primary bg-primary'
                      : 'border-stone-300 dark:border-slate-600 group-hover:border-primary'
                  )}
                >
                  {filters.season === s && (
                    <svg className="size-3 text-white" fill="none" viewBox="0 0 12 12">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span
                  onClick={() => setFilter('season', filters.season === s ? '' : s)}
                  className="text-stone-600 dark:text-slate-300 text-sm"
                >
                  {SEASON_LABELS[s]}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Tags */}
        {allTags.length > 0 && (
          <div>
            <h4 className="text-stone-700 dark:text-slate-200 text-xs font-bold uppercase tracking-wider mb-4">
              Tags
            </h4>
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setFilter('tag', filters.tag === tag ? '' : tag)}
                  className={clsx(
                    'px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize',
                    filters.tag === tag
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'bg-stone-100 dark:bg-surface-dark text-stone-600 dark:text-slate-300 border border-transparent hover:border-stone-300 dark:hover:border-slate-500'
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
