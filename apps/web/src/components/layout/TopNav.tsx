import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Shirt, Plus, LogOut } from 'lucide-react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import { useUIStore } from '../../store/uiStore'

const AUTH_ENABLED =
  Boolean(import.meta.env.VITE_SUPABASE_URL) &&
  Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY)

const navItems = [
  { to: '/closet', label: 'Closet' },
  { to: '/outfits/generate', label: 'Outfits' },
  { to: '/outfits/saved', label: 'Saved' },
  { to: '/capsules', label: 'Capsules' },
]

export function TopNav() {
  const navigate = useNavigate()
  const setUploadModalOpen = useUIStore(s => s.setUploadModalOpen)
  const [session, setSession] = useState<Session | null>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => {
    if (!AUTH_ENABLED) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  async function handleSignOut() {
    setUserMenuOpen(false)
    await supabase.auth.signOut()
    navigate('/login')
  }

  const initials = session?.user?.email?.charAt(0).toUpperCase() ?? 'U'

  return (
    <header className="flex shrink-0 items-center justify-between border-b border-stone-200 dark:border-border-dark px-6 md:px-10 py-4 bg-white dark:bg-[#151f2b] z-20 relative">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <Shirt size={22} className="text-primary" />
        <span className="text-stone-900 dark:text-white text-xl font-bold tracking-tight font-serif">
          ARCHIVE
        </span>
      </div>

      {/* Nav links — desktop */}
      <nav className="hidden md:flex flex-1 justify-center gap-10">
        {navItems.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              isActive
                ? 'text-primary font-bold text-sm border-b-2 border-primary pb-0.5'
                : 'text-stone-500 dark:text-slate-400 text-sm font-medium hover:text-primary transition-colors'
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-5">
        <button
          onClick={() => setUploadModalOpen(true)}
          className="flex items-center gap-2 rounded-lg h-9 px-4 bg-primary hover:bg-blue-600 transition-colors text-white text-sm font-bold shadow-lg shadow-blue-900/20"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Add Item</span>
        </button>

        {/* User avatar */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(v => !v)}
            className="size-9 rounded-full bg-stone-200 dark:bg-surface-dark border-2 border-stone-200 dark:border-border-dark flex items-center justify-center text-stone-600 dark:text-slate-300 text-sm font-bold cursor-pointer select-none hover:border-primary transition-colors"
          >
            {initials}
          </button>

          {userMenuOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setUserMenuOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-surface-dark border border-stone-200 dark:border-border-dark rounded-lg shadow-lg z-20 overflow-hidden">
                {AUTH_ENABLED && session && (
                  <div className="px-4 py-3 border-b border-stone-100 dark:border-border-dark">
                    <p className="text-xs text-stone-500 dark:text-slate-400 truncate">
                      {session.user.email}
                    </p>
                  </div>
                )}
                {AUTH_ENABLED && session && (
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-stone-600 dark:text-slate-300 hover:bg-stone-50 dark:hover:bg-[#1a2632] transition-colors"
                  >
                    <LogOut size={14} />
                    Sign out
                  </button>
                )}
                {!AUTH_ENABLED && (
                  <div className="px-4 py-3">
                    <p className="text-xs text-stone-400 dark:text-slate-500">Local storage only</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
