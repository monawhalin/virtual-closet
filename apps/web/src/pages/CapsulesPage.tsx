import { useState } from 'react'
import { Plus, Package } from 'lucide-react'
import { useCapsules } from '../hooks/useCapsules'
import { useAllActiveItems } from '../hooks/useClosetItems'
import { CapsuleCard } from '../components/capsules/CapsuleCard'
import { EmptyState } from '../components/ui/EmptyState'
import { Button } from '../components/ui/Button'
import { db } from '../db/db'
import { useUIStore } from '../store/uiStore'

export function CapsulesPage() {
  const capsules = useCapsules()
  const items = useAllActiveItems() ?? []
  const { addToast } = useUIStore()
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')

  if (capsules === undefined) return <div className="p-6 text-stone-400">Loading…</div>

  async function handleCreate() {
    const name = newName.trim()
    if (!name) return
    await db.capsules.add({
      id: crypto.randomUUID(),
      name,
      itemIds: [],
      updatedAt: Date.now(),
    })
    addToast(`Capsule "${name}" created`)
    setNewName('')
    setCreating(false)
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Capsules</h1>
          <p className="text-sm text-stone-400 mt-0.5">Curated subsets of your closet</p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus size={16} /> New Capsule
        </Button>
      </div>

      {/* Create form */}
      {creating && (
        <div className="flex gap-2 max-w-sm">
          <input
            type="text"
            autoFocus
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setCreating(false) }}
            placeholder="Capsule name…"
            className="flex-1 border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
          />
          <Button size="sm" onClick={handleCreate} disabled={!newName.trim()}>Create</Button>
          <Button size="sm" variant="secondary" onClick={() => { setCreating(false); setNewName('') }}>Cancel</Button>
        </div>
      )}

      {capsules.length === 0 ? (
        <EmptyState
          icon={<Package size={48} />}
          title="No capsules yet"
          description="Create a capsule to group items for travel, season, or occasion."
          action={<Button onClick={() => setCreating(true)}>Create Capsule</Button>}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {capsules.map(capsule => (
            <CapsuleCard key={capsule.id} capsule={capsule} items={items} />
          ))}
        </div>
      )}
    </div>
  )
}
