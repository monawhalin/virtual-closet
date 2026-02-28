import { useState } from 'react'
import { ChevronDown, SlidersHorizontal } from 'lucide-react'
import { useClosetItems } from '../hooks/useClosetItems'
import { useUIStore } from '../store/uiStore'
import type { ClosetSort } from '../store/uiStore'
import { ItemGrid } from '../components/closet/ItemGrid'
import { FilterSidebar } from '../components/closet/FilterSidebar'
import { FilterDrawer } from '../components/closet/FilterDrawer'
import { UploadModal } from '../components/closet/UploadModal'

const SORT_LABELS: Record<ClosetSort, string> = {
  recent: 'Recently Added',
  'least-worn': 'Least Worn',
  category: 'Category',
}

const PAGE_SIZE = 20

export function ClosetPage() {
  const {
    filters,
    clearFilters,
    closetSort,
    setClosetSort,
    filterDrawerOpen,
    setFilterDrawerOpen,
  } = useUIStore()

  const items = useClosetItems(filters, closetSort)
  const [displayLimit, setDisplayLimit] = useState(PAGE_SIZE)

  const itemCount = items?.length ?? 0
  const displayedItems = items?.slice(0, displayLimit)
  const hasMore = itemCount > displayLimit
  const activeFilterCount = [filters.category, filters.color, filters.season, filters.tag].filter(Boolean).length

  return (
    <div className="flex min-h-full relative">
      {/* ── Main content ─────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* Sticky sort / filter bar */}
        <div className="sticky top-0 z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-6 md:px-10 py-4 border-b border-stone-200 dark:border-border-dark bg-stone-50/95 dark:bg-background-dark/95 backdrop-blur-sm">
          {/* Sort pills */}
          <div className="flex gap-3 flex-wrap">
            {(Object.keys(SORT_LABELS) as ClosetSort[]).map(sort => (
              <button
                key={sort}
                onClick={() => setClosetSort(sort)}
                className={[
                  'flex h-9 shrink-0 items-center gap-x-2 rounded-full border px-4 text-sm font-medium transition-colors',
                  closetSort === sort
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-stone-200 dark:border-border-dark bg-white dark:bg-surface-dark text-stone-700 dark:text-slate-200 hover:border-primary dark:hover:border-primary',
                ].join(' ')}
              >
                {SORT_LABELS[sort]}
                <ChevronDown size={14} className="text-stone-400 dark:text-slate-500" />
              </button>
            ))}
          </div>

          {/* Right: item count + filter trigger */}
          <div className="flex items-center gap-4 text-stone-500 dark:text-slate-400 text-sm shrink-0">
            {items !== undefined && (
              <span>{itemCount} Item{itemCount !== 1 ? 's' : ''}</span>
            )}
            <div className="h-4 w-px bg-stone-200 dark:bg-border-dark" />
            {/* Mobile: open FilterDrawer */}
            <button
              onClick={() => setFilterDrawerOpen(true)}
              className="lg:hidden flex items-center gap-2 hover:text-primary transition-colors font-medium"
            >
              <SlidersHorizontal size={18} />
              Filters
              {activeFilterCount > 0 && (
                <span className="size-4 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
            {/* Desktop: clear or label for the right panel */}
            <button
              onClick={activeFilterCount > 0 ? clearFilters : undefined}
              className="hidden lg:flex items-center gap-2 hover:text-primary transition-colors font-medium"
            >
              <SlidersHorizontal size={18} />
              {activeFilterCount > 0 ? 'Clear Filters' : 'Filters'}
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="p-6 md:p-10">
          <ItemGrid items={displayedItems} />

          {hasMore && (
            <div className="flex justify-center mt-12 mb-6">
              <button
                onClick={() => setDisplayLimit(l => l + PAGE_SIZE)}
                className="text-stone-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors border border-stone-300 dark:border-border-dark rounded-full px-6 py-2 hover:border-primary"
              >
                Load More Items
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Right filter panel — desktop lg+ ─────────── */}
      <FilterSidebar className="hidden lg:flex w-80 shrink-0 self-start sticky top-0 h-screen overflow-y-auto border-l border-stone-200 dark:border-border-dark" />

      {/* Mobile filter drawer */}
      <FilterDrawer open={filterDrawerOpen} onClose={() => setFilterDrawerOpen(false)} />

      <UploadModal />
    </div>
  )
}
