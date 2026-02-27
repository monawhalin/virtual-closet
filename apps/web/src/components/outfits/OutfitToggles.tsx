import { ToggleSwitch } from '../ui/ToggleSwitch'
import type { GeneratorOptions, Capsule } from '@vc/shared'

interface OutfitTogglesProps {
  options: GeneratorOptions
  onChange: (opts: GeneratorOptions) => void
  capsules: Capsule[]
}

export function OutfitToggles({ options, onChange, capsules }: OutfitTogglesProps) {
  function set<K extends keyof GeneratorOptions>(key: K, value: GeneratorOptions[K]) {
    onChange({ ...options, [key]: value })
  }

  return (
    <div className="space-y-4">
      <ToggleSwitch
        checked={options.preferLeastWorn}
        onChange={v => set('preferLeastWorn', v)}
        label="Prefer least worn"
        description="Prioritize items you haven't worn recently"
      />

      <div className="space-y-2">
        <ToggleSwitch
          checked={options.avoidRecentDays > 0}
          onChange={v => set('avoidRecentDays', v ? 7 : 0)}
          label="Avoid recent items"
          description="Skip items worn within a set number of days"
        />
        {options.avoidRecentDays > 0 && (
          <div className="flex items-center gap-2 ml-12">
            <input
              type="number"
              min={1}
              max={90}
              value={options.avoidRecentDays}
              onChange={e => set('avoidRecentDays', Math.max(1, parseInt(e.target.value) || 7))}
              className="w-16 border border-stone-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 text-center"
            />
            <span className="text-sm text-stone-600">days</span>
          </div>
        )}
      </div>

      <ToggleSwitch
        checked={options.preferFavorites}
        onChange={v => set('preferFavorites', v)}
        label="Prefer favorites"
        description="Boost items you've marked as favorites"
      />

      <div className="space-y-2">
        <ToggleSwitch
          checked={options.capsuleOnly}
          onChange={v => set('capsuleOnly', v)}
          label="Capsule only"
          description="Generate outfits from a specific capsule"
          disabled={capsules.length === 0}
        />
        {options.capsuleOnly && capsules.length > 0 && (
          <div className="ml-12">
            <select
              value={options.capsuleId ?? ''}
              onChange={e => set('capsuleId', e.target.value || null)}
              className="w-full border border-stone-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
            >
              <option value="">Select a capsule…</option>
              {capsules.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  )
}
