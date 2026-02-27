import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowLeft, Heart, Archive, Trash2, Edit2 } from 'lucide-react'
import { db } from '../db/db'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { ItemEditForm, type ItemFormData } from '../components/closet/ItemEditForm'
import { useUIStore } from '../store/uiStore'
import { formatLastWorn } from '@vc/ui-shared'

export function ItemDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addToast } = useUIStore()
  const [editOpen, setEditOpen] = useState(false)
  const [photoIndex, setPhotoIndex] = useState(0)

  const item = useLiveQuery(() => db.items.get(id!), [id])

  if (item === undefined) {
    return <div className="p-6 text-stone-400">Loading…</div>
  }
  if (item === null || !item) {
    return <div className="p-6 text-stone-400">Item not found.</div>
  }

  async function handleArchive() {
    const newStatus = item!.status === 'archived' ? 'active' : 'archived'
    await db.items.update(item!.id, { status: newStatus, updatedAt: Date.now() })
    addToast(newStatus === 'archived' ? 'Item archived' : 'Item restored')
    if (newStatus === 'archived') navigate('/closet')
  }

  async function handleDelete() {
    if (!confirm('Permanently delete this item? This cannot be undone.')) return
    await db.items.delete(item!.id)
    addToast('Item deleted')
    navigate('/closet')
  }

  async function handleToggleFavorite() {
    await db.items.update(item!.id, { isFavorite: !item!.isFavorite, updatedAt: Date.now() })
  }

  async function handleSaveEdit(data: ItemFormData) {
    await db.items.update(item!.id, { ...data, updatedAt: Date.now() })
    setEditOpen(false)
    addToast('Changes saved')
  }

  const editFormData: ItemFormData = {
    category: item.category,
    colors: item.colors,
    tags: item.tags,
    season: item.season,
    brand: item.brand,
    url: item.url,
    notes: item.notes,
  }

  return (
    <div className="p-6 max-w-2xl">
      {/* Back */}
      <button
        onClick={() => navigate('/closet')}
        className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 mb-5 transition-colors"
      >
        <ArrowLeft size={16} /> Back to closet
      </button>

      <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
        {/* Image carousel */}
        <div className="aspect-video relative bg-stone-50">
          {item.images[photoIndex] ? (
            <img
              src={item.images[photoIndex]}
              alt={item.category}
              className="w-full h-full object-contain"
              style={{ imageOrientation: 'from-image' }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-300 text-6xl">👕</div>
          )}
          {item.images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {item.images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPhotoIndex(i)}
                  className={`h-1.5 w-1.5 rounded-full transition-colors ${i === photoIndex ? 'bg-stone-900' : 'bg-stone-300'}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="p-6 space-y-5">
          {/* Header row */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-stone-900 capitalize">{item.category}</h2>
              {item.brand && <p className="text-sm text-stone-500 mt-0.5">{item.brand}</p>}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleToggleFavorite}
                className={`p-2 rounded-xl transition-colors ${item.isFavorite ? 'bg-red-50 text-red-500' : 'text-stone-400 hover:bg-stone-100'}`}
              >
                <Heart size={18} fill={item.isFavorite ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={() => setEditOpen(true)}
                className="p-2 rounded-xl text-stone-400 hover:bg-stone-100 transition-colors"
              >
                <Edit2 size={18} />
              </button>
            </div>
          </div>

          {/* Attributes */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-stone-400 mb-1">Colors</p>
              <div className="flex flex-wrap gap-1">
                {item.colors.length > 0 ? item.colors.map(c => (
                  <Badge key={c} variant="muted" className="capitalize">{c}</Badge>
                )) : <span className="text-stone-400">—</span>}
              </div>
            </div>
            {item.season && (
              <div>
                <p className="text-xs text-stone-400 mb-1">Season</p>
                <Badge variant="muted" className="capitalize">{item.season}</Badge>
              </div>
            )}
          </div>

          {item.tags.length > 0 && (
            <div>
              <p className="text-xs text-stone-400 mb-1.5">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {item.tags.map(t => (
                  <Badge key={t} variant="muted">#{t}</Badge>
                ))}
              </div>
            </div>
          )}

          {item.url && (
            <div>
              <p className="text-xs text-stone-400 mb-1">URL</p>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-stone-600 underline underline-offset-2 hover:text-stone-900 break-all transition-colors"
              >
                {item.url}
              </a>
            </div>
          )}

          {item.notes && (
            <div>
              <p className="text-xs text-stone-400 mb-1">Notes</p>
              <p className="text-sm text-stone-600">{item.notes}</p>
            </div>
          )}

          {/* Wear stats */}
          <div className="bg-stone-50 rounded-xl p-4 flex gap-6">
            <div>
              <p className="text-2xl font-bold text-stone-900">{item.wearCount}</p>
              <p className="text-xs text-stone-400 mt-0.5">times worn</p>
            </div>
            <div>
              <p className="text-sm font-medium text-stone-700">{formatLastWorn(item.lastWornAt)}</p>
              <p className="text-xs text-stone-400 mt-0.5">last worn</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-stone-100">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleArchive}
            >
              <Archive size={14} />
              {item.status === 'archived' ? 'Restore' : 'Archive'}
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
            >
              <Trash2 size={14} /> Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Edit modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Item" size="lg">
        <EditItemForm initial={editFormData} onSave={handleSaveEdit} onCancel={() => setEditOpen(false)} />
      </Modal>
    </div>
  )
}

function EditItemForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: ItemFormData
  onSave: (data: ItemFormData) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<ItemFormData>(initial)
  return (
    <div className="space-y-5">
      <ItemEditForm value={form} onChange={setForm} />
      <div className="flex gap-2 justify-end pt-2 border-t border-stone-100">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(form)}>Save Changes</Button>
      </div>
    </div>
  )
}
