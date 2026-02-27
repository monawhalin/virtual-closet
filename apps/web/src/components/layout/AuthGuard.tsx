import { type ReactNode, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'

// If Supabase env vars are not configured, skip auth entirely (local-only mode)
const AUTH_ENABLED =
  Boolean(import.meta.env.VITE_SUPABASE_URL) &&
  Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY)

interface AuthGuardProps {
  children: ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [session, setSession] = useState<Session | null | 'loading'>('loading')

  useEffect(() => {
    if (!AUTH_ENABLED) {
      setSession(null)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    // Listen for auth changes (magic link redirect sets session)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!AUTH_ENABLED) return
    if (session === 'loading') return
    if (!session && location.pathname !== '/login') {
      navigate('/login', { replace: true })
    }
    if (session && location.pathname === '/login') {
      navigate('/closet', { replace: true })
    }
  }, [session, location.pathname, navigate])

  // While loading auth state, show nothing (avoids flash)
  if (AUTH_ENABLED && session === 'loading') {
    return null
  }

  // Not authenticated and not already navigating to login — render nothing
  if (AUTH_ENABLED && !session && location.pathname !== '/login') {
    return null
  }

  return <>{children}</>
}
