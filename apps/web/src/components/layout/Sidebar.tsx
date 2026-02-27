import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Shirt, Sparkles, BookOpen, Package, RefreshCw, LogOut } from 'lucide-react'
import { clsx } from 'clsx'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import { syncAll } from '@vc/ui-shared'
import { dexieSyncAdapter } from '../../lib/dexieSyncAdapter'
import { useUIStore } from '../../store/uiStore'

const AUTH_ENABLED =
  Boolean(import.meta.env.VITE_SUPABASE_URL) &&
  Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY)

const navItems = [
  { to: '/closet',           label: 'My Closet',    icon: Shirt },
  { to: '/outfits/generate', label: 'Generate',     icon: Sparkles },
  { to: '/outfits/saved',    label: 'Saved Outfits',icon: BookOpen },
  { to: '/capsules',         label: 'Capsules',     icon: Package },
]

export function Sidebar() {
  const navigate = useNavigate()
  const { addToast } = useUIStore()
  const [session, setSession] = useState<Session | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [lastSyncAt, setLastSyncAt] = useState<number>(0)

  useEffect(() => {
    if (!AUTH_ENABLED) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem('vc_last_sync_at')
    if (stored) setLastSyncAt(parseInt(stored, 10))
  }, [])

  async function handleSync() {
    if (!session) return
    setSyncing(true)
    try {
      await syncAll(supabase, dexieSyncAdapter, session.user.id)
      const now = Date.now()
      setLastSyncAt(now)
      addToast('Synced successfully')
    } catch {
      addToast('Sync failed', 'error')
    } finally {
      setSyncing(false)
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  function formatSyncTime(ts: number) {
    if (!ts) return null
    const diff = Date.now() - ts
    if (diff < 60_000) return 'just now'
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <aside className="hidden md:flex w-56 shrink-0 bg-white border-r border-stone-100 flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-stone-100">
        <span className="text-lg font-bold text-stone-900 tracking-tight">Virtual Closet</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              )
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-stone-100 space-y-2">
        {AUTH_ENABLED && session ? (
          <>
            {/* User email */}
            <p className="text-xs text-stone-500 truncate">{session.user.email}</p>

            {/* Sync button */}
            <button
              onClick={handleSync}
              disabled={syncing}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
              {syncing ? 'Syncing…' : 'Sync'}
              {!syncing && lastSyncAt > 0 && (
                <span className="ml-auto text-xs text-stone-400">{formatSyncTime(lastSyncAt)}</span>
              )}
            </button>

            {/* Sign out */}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </>
        ) : (
          <p className="text-xs text-stone-400">
            {AUTH_ENABLED ? 'Not signed in' : 'Local storage only'}
          </p>
        )}
      </div>
    </aside>
  )
}
