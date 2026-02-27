import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'

export function ToastContainer() {
  const { toasts, removeToast } = useUIStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="flex items-center gap-3 rounded-xl bg-white shadow-lg border border-stone-100 px-4 py-3 min-w-64 max-w-sm"
        >
          {toast.type === 'success' && <CheckCircle size={16} className="text-green-600 shrink-0" />}
          {toast.type === 'error'   && <AlertCircle size={16} className="text-red-600 shrink-0" />}
          {toast.type === 'info'    && <Info size={16} className="text-blue-600 shrink-0" />}
          <span className="flex-1 text-sm text-stone-700">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-stone-400 hover:text-stone-600 shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
