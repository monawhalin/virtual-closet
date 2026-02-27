import { create } from 'zustand'
import type { FilterState } from '@vc/shared'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

const DEFAULT_FILTERS: FilterState = {
  category: '',
  color: '',
  season: '',
  tag: '',
  search: '',
}

interface UIStore {
  // Closet filters
  filters: FilterState
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void
  clearFilters: () => void

  // Upload modal
  uploadModalOpen: boolean
  setUploadModalOpen: (v: boolean) => void

  // Filter drawer (mobile)
  filterDrawerOpen: boolean
  setFilterDrawerOpen: (v: boolean) => void

  // Toasts
  toasts: Toast[]
  addToast: (message: string, type?: Toast['type']) => void
  removeToast: (id: string) => void

  // Outfit generator — locked item IDs
  lockedItemIds: string[]
  toggleLock: (id: string) => void
  clearLocks: () => void

  // Onboarding banner dismissed
  onboardingDismissed: boolean
  dismissOnboarding: () => void
}

export const useUIStore = create<UIStore>((set, get) => ({
  filters: { ...DEFAULT_FILTERS },

  setFilter: (key, value) =>
    set(state => ({ filters: { ...state.filters, [key]: value } })),

  clearFilters: () => set({ filters: { ...DEFAULT_FILTERS } }),

  uploadModalOpen: false,
  setUploadModalOpen: (v) => set({ uploadModalOpen: v }),

  filterDrawerOpen: false,
  setFilterDrawerOpen: (v) => set({ filterDrawerOpen: v }),

  toasts: [],
  addToast: (message, type = 'success') => {
    const id = crypto.randomUUID()
    set(state => ({ toasts: [...state.toasts, { id, message, type }] }))
    setTimeout(() => get().removeToast(id), 4000)
  },
  removeToast: (id) =>
    set(state => ({ toasts: state.toasts.filter(t => t.id !== id) })),

  lockedItemIds: [],
  toggleLock: (id) =>
    set(state => ({
      lockedItemIds: state.lockedItemIds.includes(id)
        ? state.lockedItemIds.filter(lid => lid !== id)
        : [...state.lockedItemIds, id],
    })),
  clearLocks: () => set({ lockedItemIds: [] }),

  onboardingDismissed: false,
  dismissOnboarding: () => set({ onboardingDismissed: true }),
}))
