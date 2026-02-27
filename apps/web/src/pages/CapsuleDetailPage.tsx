import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Sparkles } from 'lucide-react'
import { useCapsule } from '../hooks/useCapsules'
import { useAllActiveItems } from '../hooks/useClosetItems'
import { CapsuleItemPicker } from '../components/capsules/CapsuleItemPicker'
import { db } from '../db/db'
import { Button } from '../components/ui/Button'
import { useUIStore } from '../store/uiStore'
import type { ClosetItem } from '@vc/shared'

export function CapsuleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addToast } = useUIStore()
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerSelection, setPickerSelection] = useState<string[]>([])
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')

  const capsule = useCapsule(id!)
  const allItems = useAllActiveItems() ?? []

  if (capsule === undefined) return <div className="p-6 text-stone-400">Loading…</div>
  if (!capsule) return <div className="p-6 text-stone-400">Capsule not found.</div>

  const capsuleItems = capsule.itemIds
    .map(iid => allItems.find(i => i.id === iid))
    .filter(Boolean) as ClosetItem[]

  function openPicker() {
    setPickerSelection([...capsule!.itemIds])
    setPickerOpen(true)
  }

  async function savePicker() {
    await db.capsules.update(capsule!.id, { itemIds: pickerSelection, updatedAt: Date.now() })
    setPickerOpen(false)
    addToast('Capsule updated')
  }

  async function removeItem(itemId: string) {
    await db.capsules.update(capsule!.id, {
      itemIds: capsule!.itemIds.filter(i => i !== itemId),
      updatedAt: Date.now(),
    })
  }

  async function handleDelete() {
    if (!confirm(`Delete capsule "${capsule!.name}"?`)) return
    await db.capsules.delete(capsule!.id)
    addToast('Capsule deleted')
    navigate('/capsules')
  }

  async function saveName() {
    const trimmed = nameInput.trim()
    if (!trimmed) { setEditingName(false); return }
    await db.capsules.update(capsule!.id, { name: trimmed, updatedAt: Date.now() })
    setEditingName(false)
    addToast('Name updated')
  }

  return (
    <div className="p-6 space-y-5 max-w-4xl">
      <button
        onClick={() => navigate('/capsules')}
        className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 transition-colors"
      >
        <ArrowLeft size={16} /> Back to capsules
      </button>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          {editingName ? (
            <div className="flex gap-2 items-center">
              <input
                autoFocus
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false) }}
                className="text-xl font-bold border-b-2 border-stone-900 bg-transparent outline-none"
              />
              <Button size="sm" onClick={saveName}>Save</Button>
            </div>
          ) : (
            <h1
              className="text-2xl font-bold text-stone-900 cursor-pointer hover:text-stone-600 transition-colors"
              onClick={() => { setNameInput(capsule.name); setEditingName(true) }}
              title="Click to rename"
            >
              {capsule.name}
            </h1>
          )}
          <p className="text-sm text-stone-400 mt-0.5">{capsule.itemIds.length} items</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/outfits/generate`)}
          >
            <Sparkles size={14} /> Generate
          </Button>
          <Button size="sm" onClick={openPicker}>
            <Plus size={14} /> Add Items
          </Button>
          <Button variant="danger" size="sm" onClick={handleDelete}>
            <Trash2 size={14} />
          </Button>
        </div>
      </div>

      {/* Items grid */}
      {capsuleItems.length === 0 ? (
        <div className="border-2 border-dashed border-stone-200 rounded-2xl p-12 text-center">
          <p className="text-stone-400 text-sm">No items yet</p>
          <Button variant="secondary" size="sm" className="mt-3" onClick={openPicker}>
            Add items
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {capsuleItems.map(item => (
            <div key={item.id} className="relative group">
              <div
                onClick={() => navigate(`/closet/${item.id}`)}
                className="bg-white rounded-xl border border-stone-100 overflow-hidden cursor-pointer hover:shadow-sm transition-shadow"
              >
                <div className="aspect-square bg-stone-50">
                  {item.images[0] ? (
                    <img
                      src={item.images[0]}
                      alt={item.category}
                      className="w-full h-full object-cover"
                      style={{ imageOrientation: 'from-image' }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300">👕</div>
                  )}
                </div>
                <div className="px-2 py-1.5">
                  <p className="text-xs text-stone-600 capitalize">{item.category}</p>
                </div>
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="absolute top-2 right-2 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <CapsuleItemPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        allItems={allItems}
        selectedIds={pickerSelection}
        onToggle={id => setPickerSelection(prev =>
          prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )}
        onSave={savePicker}
      />
    </div>
  )
}
