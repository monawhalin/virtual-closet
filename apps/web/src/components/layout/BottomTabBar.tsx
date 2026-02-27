import { NavLink } from 'react-router-dom'
import { Shirt, Sparkles, BookOpen, Package } from 'lucide-react'
import { clsx } from 'clsx'

const tabs = [
  { to: '/closet',           label: 'Closet',   icon: Shirt },
  { to: '/outfits/generate', label: 'Generate', icon: Sparkles },
  { to: '/outfits/saved',    label: 'Saved',    icon: BookOpen },
  { to: '/capsules',         label: 'Capsules', icon: Package },
]

export function BottomTabBar() {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 md:hidden bg-white border-t border-stone-100 z-40"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex">
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 min-h-[56px] text-[10px] font-medium transition-colors',
                isActive
                  ? 'text-stone-900'
                  : 'text-stone-400 hover:text-stone-700'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 1.75}
                />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
