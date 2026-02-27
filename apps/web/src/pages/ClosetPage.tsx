import { Plus, X, SlidersHorizontal } from 'lucide-react'
import { useClosetItems } from '../hooks/useClosetItems'
import { useUIStore } from '../store/uiStore'
import { ItemGrid } from '../components/closet/ItemGrid'
import { FilterSidebar } from '../components/closet/FilterSidebar'
import { FilterDrawer } from '../components/closet/FilterDrawer'
import { UploadModal } from '../components/closet/UploadModal'
import { Button } from '../components/ui/Button'

export function ClosetPage() {
  const {
    filters,
    setFilter,
    setUploadModalOpen,
    onboardingDismissed,
    dismissOnboarding,
    filterDrawerOpen,
    setFilterDrawerOpen,
  } = useUIStore()
  const items = useClosetItems(filters)

  const itemCount = items?.length ?? 0
  const showOnboarding = !onboardingDismissed && (items?.length ?? 0) > 0 && (items?.length ?? 0) < 8

  // Count active filters (excluding search) for the mobile badge
  const activeFilterCount = [filters.category, filters.color, filters.season, filters.tag].filter(Boolean).length

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">My Closet</h1>
          {items !== undefined && (
            <p className="text-sm text-stone-400 mt-0.5">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
          )}
        </div>
        <Button onClick={() => setUploadModalOpen(true)}>
          <Plus size={16} /> Add Item
        </Button>
      </div>

      {/* Onboarding banner */}
      {showOnboarding && (
        <div className="flex items-start justify-between bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <div>
            <p className="text-sm font-medium text-amber-800">Building your closet</p>
            <p className="text-xs text-amber-700 mt-0.5">
              For best outfit suggestions, aim for 5+ tops, 3+ bottoms, and 2+ pairs of shoes.
            </p>
          </div>
          <button onClick={dismissOnboarding} className="text-amber-400 hover:text-amber-700 ml-4 shrink-0">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Search + mobile filter chip row */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <input
            type="text"
            value={filters.search}
            onChange={e => setFilter('search', e.target.value)}
            placeholder="Search by tag, brand, category…"
            className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 bg-white"
          />
          {filters.search && (
            <button
              onClick={() => setFilter('search', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
            >
              <X size={14} />
            </button>
          )}
        </div>
        {/* Filter chip — mobile only */}
        <button
          onClick={() => setFilterDrawerOpen(true)}
          className="md:hidden relative flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-stone-200 bg-white text-sm text-stone-600 hover:border-stone-400 transition-colors shrink-0"
        >
          <SlidersHorizontal size={15} />
          Filters
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-stone-900 text-white text-[9px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex gap-6">
        {/* Desktop: sidebar filter */}
        <FilterSidebar className="hidden md:block" />
        <div className="flex-1 min-w-0">
          <ItemGrid items={items} />
        </div>
      </div>

      {/* Mobile filter drawer */}
      <FilterDrawer open={filterDrawerOpen} onClose={() => setFilterDrawerOpen(false)} />

      <UploadModal />
    </div>
  )
}
