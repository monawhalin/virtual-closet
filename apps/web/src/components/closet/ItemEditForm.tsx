import type { ClosetItem } from '@vc/shared'
import { CATEGORIES, SEASONS, NAMED_COLORS } from '@vc/shared'
import { TagInput } from './TagInput'

type ItemFormData = Omit<ClosetItem, 'id' | 'images' | 'isFavorite' | 'status' | 'wearCount' | 'lastWornAt' | 'createdAt' | 'updatedAt'>

interface ItemEditFormProps {
  value: ItemFormData
  onChange: (data: ItemFormData) => void
}

export function ItemEditForm({ value, onChange }: ItemEditFormProps) {
  function set<K extends keyof ItemFormData>(key: K, val: ItemFormData[K]) {
    onChange({ ...value, [key]: val })
  }

  return (
    <div className="space-y-4">
      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">
          Category <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => set('category', cat)}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors capitalize ${
                value.category === cat
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'border-stone-200 text-stone-600 hover:border-stone-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">Colors</label>
        <div className="flex flex-wrap gap-2">
          {NAMED_COLORS.map(color => (
            <button
              key={color}
              type="button"
              onClick={() => {
                const newColors = value.colors.includes(color)
                  ? value.colors.filter(c => c !== color)
                  : [...value.colors, color]
                set('colors', newColors)
              }}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors capitalize ${
                value.colors.includes(color)
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'border-stone-200 text-stone-600 hover:border-stone-400'
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      {/* Season */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">Season (optional)</label>
        <div className="flex flex-wrap gap-2">
          {SEASONS.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => set('season', value.season === s ? undefined : s)}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors capitalize ${
                value.season === s
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'border-stone-200 text-stone-600 hover:border-stone-400'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">Tags</label>
        <TagInput tags={value.tags} onChange={tags => set('tags', tags)} />
        <p className="text-xs text-stone-400 mt-1">Press Enter or comma to add</p>
      </div>

      {/* Brand */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">Brand (optional)</label>
        <input
          type="text"
          value={value.brand ?? ''}
          onChange={e => set('brand', e.target.value || undefined)}
          placeholder="e.g. Zara, H&M…"
          className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
        />
      </div>

      {/* URL */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">URL (optional)</label>
        <input
          type="url"
          value={value.url ?? ''}
          onChange={e => set('url', e.target.value || undefined)}
          placeholder="https://…"
          className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
        />
        <p className="text-xs text-stone-400 mt-1">Product page, inspiration link, etc.</p>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">Notes (optional)</label>
        <textarea
          value={value.notes ?? ''}
          onChange={e => set('notes', e.target.value || undefined)}
          placeholder="Any notes about this item…"
          rows={2}
          className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 resize-none"
        />
      </div>
    </div>
  )
}

export type { ItemFormData }
export { CATEGORIES }
