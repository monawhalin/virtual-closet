import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Sparkles, Check } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { ItemEditForm, type ItemFormData } from './ItemEditForm'
import { compressImage } from '@vc/ui-shared'
import { extractDominantColors } from '@vc/ui-shared'
import { useTFClassifier } from '../../hooks/useTFClassifier'
import { db } from '../../db/db'
import { useUIStore } from '../../store/uiStore'
import type { Category } from '@vc/shared'
import { clsx } from 'clsx'

// Each uploaded photo becomes its own pending closet item
interface PendingItem {
  preview: string     // compressed base64 data URL
  form: ItemFormData
  analyzed: boolean
}

const DEFAULT_FORM: ItemFormData = {
  category: 'top',
  colors: [],
  tags: [],
  season: undefined,
  brand: undefined,
  url: undefined,
  notes: undefined,
}

export function UploadModal() {
  const { uploadModalOpen, setUploadModalOpen, addToast } = useUIStore()
  const { modelReady, classify } = useTFClassifier()

  const [items, setItems]             = useState<PendingItem[]>([])
  const [activeIndex, setActiveIndex] = useState<number>(0)
  const [analyzing, setAnalyzing]     = useState(false)
  const [saving, setSaving]           = useState(false)

  const activeItem = items[activeIndex] ?? null

  const handleClose = useCallback(() => {
    setUploadModalOpen(false)
    setItems([])
    setActiveIndex(0)
  }, [setUploadModalOpen])

  // Compress each file and append as a new pending item
  async function handleDrop(accepted: File[]) {
    const compressed = await Promise.all(accepted.map(compressImage))
    setItems(prev => {
      const prevLen = prev.length
      const next = [
        ...prev,
        ...compressed.map(preview => ({
          preview,
          form: { ...DEFAULT_FORM },
          analyzed: false,
        })),
      ].slice(0, 10)
      // Auto-select first new item when adding to an empty list
      if (prevLen === 0) setActiveIndex(0)
      return next
    })
  }

  function handleRemove(index: number) {
    setItems(prev => {
      const next = prev.filter((_, i) => i !== index)
      setActiveIndex(ai => Math.min(ai, Math.max(next.length - 1, 0)))
      return next
    })
  }

  // Update the form for the currently selected item only
  function handleFormChange(form: ItemFormData) {
    setItems(prev =>
      prev.map((item, i) => (i === activeIndex ? { ...item, form } : item))
    )
  }

  // Run AI analysis on the selected image
  async function handleAnalyze() {
    if (!activeItem) return
    setAnalyzing(true)
    try {
      const [classification, colors] = await Promise.all([
        classify(activeItem.preview),
        extractDominantColors(activeItem.preview),
      ])
      setItems(prev =>
        prev.map((item, i) => {
          if (i !== activeIndex) return item
          return {
            ...item,
            analyzed: true,
            form: {
              ...item.form,
              category: (classification.suggestedCategory ?? item.form.category) as Category,
              colors: colors.length > 0 ? colors : item.form.colors,
              tags:
                classification.rawLabels.length > 0
                  ? [...new Set([...item.form.tags, ...classification.rawLabels.slice(0, 3)])]
                  : item.form.tags,
            },
          }
        })
      )
    } finally {
      setAnalyzing(false)
    }
  }

  // Save every pending item as a separate closet entry
  async function handleSave() {
    if (items.length === 0) {
      addToast('Add at least one photo', 'error')
      return
    }
    setSaving(true)
    try {
      await Promise.all(
        items.map(item =>
          db.items.add({
            id: crypto.randomUUID(),
            images: [item.preview],
            category: item.form.category,
            colors: item.form.colors,
            tags: item.form.tags,
            season: item.form.season,
            brand: item.form.brand,
            url: item.form.url,
            notes: item.form.notes,
            isFavorite: false,
            status: 'active',
            wearCount: 0,
            lastWornAt: undefined,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          })
        )
      )
      addToast(
        items.length === 1
          ? 'Item added to your closet'
          : `${items.length} items added to your closet`
      )
      handleClose()
    } catch {
      addToast('Failed to save items', 'error')
    } finally {
      setSaving(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    multiple: true,
    onDrop: handleDrop,
  })

  return (
    <Modal
      open={uploadModalOpen}
      onClose={handleClose}
      title="Add Items"
      size="lg"
    >
      <div className="space-y-5">
        {/* Drop zone — always visible so more photos can be appended */}
        <div
          {...getRootProps()}
          className={clsx(
            'border-2 border-dashed rounded-xl px-4 py-3 text-center cursor-pointer transition-colors',
            isDragActive
              ? 'border-stone-900 bg-stone-50'
              : 'border-stone-200 hover:border-stone-400 hover:bg-stone-50'
          )}
        >
          <input {...getInputProps()} />
          <div className="flex items-center justify-center gap-2 text-stone-400">
            <Upload size={15} />
            <span className="text-sm">
              {isDragActive
                ? 'Drop photos here'
                : 'Drop photos or click to browse — each photo becomes its own item'}
            </span>
          </div>
        </div>

        {items.length > 0 && (
          <div className="flex gap-4">
            {/* Thumbnail strip — click to switch active item */}
            <div className="flex flex-col gap-2 w-[4.75rem] shrink-0">
              {items.map((item, i) => (
                <div
                  key={i}
                  className="relative group cursor-pointer"
                  onClick={() => setActiveIndex(i)}
                >
                  <img
                    src={item.preview}
                    alt={`Item ${i + 1}`}
                    className={clsx(
                      'w-[4.75rem] h-[4.75rem] object-cover rounded-xl border-2 transition-all',
                      i === activeIndex
                        ? 'border-stone-900 ring-2 ring-stone-900 ring-offset-1'
                        : 'border-stone-100 opacity-70 hover:opacity-100 hover:border-stone-400'
                    )}
                    style={{ imageOrientation: 'from-image' }}
                  />
                  {/* Analyzed indicator */}
                  {item.analyzed && (
                    <div className="absolute top-1 left-1 bg-green-500 rounded-full p-0.5 shadow">
                      <Check size={8} className="text-white" />
                    </div>
                  )}
                  {/* Item number badge */}
                  <div className={clsx(
                    'absolute bottom-1 right-1 text-[10px] font-bold rounded px-1 leading-tight',
                    i === activeIndex
                      ? 'bg-stone-900 text-white'
                      : 'bg-white/80 text-stone-500'
                  )}>
                    {i + 1}
                  </div>
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); handleRemove(i) }}
                    className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>

            {/* Details panel — bound to active item */}
            {activeItem && (
              <div className="flex-1 min-w-0 flex flex-col gap-3">
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-400">
                    Editing item {activeIndex + 1} of {items.length}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-1.5"
                    onClick={handleAnalyze}
                    disabled={analyzing || !modelReady}
                    loading={analyzing}
                  >
                    <Sparkles size={13} />
                    {analyzing
                      ? 'Analyzing…'
                      : modelReady
                      ? activeItem.analyzed
                        ? 'Re-detect'
                        : 'Auto-detect'
                      : 'AI loading…'}
                  </Button>
                </div>

                {/* Scrollable form area */}
                <div className="overflow-y-auto max-h-[50vh] pr-0.5">
                  <ItemEditForm value={activeItem.form} onChange={handleFormChange} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-stone-100">
          <span className="text-xs text-stone-400">
            {items.length === 0
              ? 'No photos yet'
              : `${items.length} item${items.length !== 1 ? 's' : ''} ready to save`}
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSave} loading={saving} disabled={items.length === 0}>
              Save to Closet
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
