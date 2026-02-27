import { useDropzone } from 'react-dropzone'
import { Upload, X } from 'lucide-react'
import { clsx } from 'clsx'

interface ImageDropzoneProps {
  previews: string[]         // base64 or object URLs
  onDrop: (files: File[]) => void
  onRemove: (index: number) => void
  loading?: boolean
}

export function ImageDropzone({ previews, onDrop, onRemove, loading }: ImageDropzoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    multiple: true,
    maxFiles: 5,
    onDrop: (accepted) => onDrop(accepted),
  })

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={clsx(
          'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-stone-900 bg-stone-50'
            : 'border-stone-200 hover:border-stone-400 hover:bg-stone-50'
        )}
      >
        <input {...getInputProps()} />
        <Upload size={24} className="mx-auto mb-2 text-stone-400" />
        {isDragActive ? (
          <p className="text-sm text-stone-600">Drop photos here</p>
        ) : (
          <>
            <p className="text-sm font-medium text-stone-700">Drop photos here or click to browse</p>
            <p className="text-xs text-stone-400 mt-1">Up to 5 photos · JPEG, PNG, WebP</p>
          </>
        )}
      </div>

      {/* Previews */}
      {previews.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {previews.map((src, i) => (
            <div key={i} className="relative group">
              <img
                src={src}
                alt=""
                className="h-20 w-20 object-cover rounded-lg border border-stone-200"
                style={{ imageOrientation: 'from-image' }}
              />
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-lg">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-stone-700 border-t-transparent" />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onRemove(i)}
                  className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={10} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
