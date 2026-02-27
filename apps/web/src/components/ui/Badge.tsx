import { clsx } from 'clsx'

type BadgeVariant = 'default' | 'muted' | 'accent'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-stone-900 text-white',
  muted:   'bg-stone-100 text-stone-600',
  accent:  'bg-amber-100 text-amber-800',
}

export function Badge({ children, variant = 'muted', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
