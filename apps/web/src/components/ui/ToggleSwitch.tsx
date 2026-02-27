import { clsx } from 'clsx'

interface ToggleSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description?: string
  disabled?: boolean
}

export function ToggleSwitch({ checked, onChange, label, description, disabled }: ToggleSwitchProps) {
  return (
    <label className={clsx('flex items-start gap-3 cursor-pointer', disabled && 'opacity-50 cursor-not-allowed')}>
      <div className="relative mt-0.5 shrink-0">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={e => !disabled && onChange(e.target.checked)}
          disabled={disabled}
        />
        <div
          className={clsx(
            'w-9 h-5 rounded-full transition-colors',
            checked ? 'bg-stone-900' : 'bg-stone-200'
          )}
        />
        <div
          className={clsx(
            'absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-4' : 'translate-x-0'
          )}
        />
      </div>
      <div>
        <span className="text-sm font-medium text-stone-900">{label}</span>
        {description && <p className="text-xs text-stone-500 mt-0.5">{description}</p>}
      </div>
    </label>
  )
}
