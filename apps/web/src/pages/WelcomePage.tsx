import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Camera, Sparkles, CalendarDays, Sun, Moon } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

const WARDROBE_IMAGE =
  'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&q=80&auto=format&fit=crop'

const journeySteps = [
  {
    icon: Camera,
    title: 'Digitize your wardrobe',
    description: 'Upload items and create a timeless digital inventory accessible anywhere.',
  },
  {
    icon: Sparkles,
    title: 'Generate unique outfits',
    description: 'Let our AI stylist curate fresh looks from your existing pieces.',
  },
  {
    icon: CalendarDays,
    title: 'Plan capsule collections',
    description: 'Organize for travel or seasons with curated mini-collections.',
  },
]

function HangerIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7l7 5.2a2 2 0 0 1-1.2 3.6H5.2A2 2 0 0 1 4 12.2L11 7V5.73A2 2 0 0 1 12 2z" />
      <path d="M4 15.8h16v1a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-1z" />
    </svg>
  )
}

function displayName(user: User): string {
  const meta = user.user_metadata
  const name = meta?.full_name || meta?.name || meta?.preferred_username
  if (name) return name.split(' ')[0]
  // Fall back to email prefix, capitalised
  const prefix = user.email?.split('@')[0] ?? 'there'
  return prefix.charAt(0).toUpperCase() + prefix.slice(1)
}

export function WelcomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [dark, setDark] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  const muted = dark ? 'text-stone-400' : 'text-stone-500'
  const iconBg = dark ? 'bg-stone-800' : 'bg-stone-700'

  return (
    <div className={`h-screen flex flex-col ${dark ? 'bg-stone-950' : 'bg-stone-900'} overflow-hidden`}>

      {/* ─── NAV ─── */}
      <nav className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 md:px-10 py-6">
        <Link to="/" className="flex items-center gap-2.5 text-white">
          <HangerIcon className="w-6 h-6" />
          <span className="font-serif text-xl tracking-tight">Virtual Closet</span>
        </Link>
        <button
          onClick={() => setDark(!dark)}
          className="w-12 h-12 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors duration-200"
          aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {dark ? <Sun size={18} strokeWidth={1.5} /> : <Moon size={18} strokeWidth={1.5} />}
        </button>
      </nav>

      {/* ─── SPLIT BODY ─── */}
      <div className="flex flex-col lg:flex-row flex-1 min-h-0">

        {/* LEFT — wardrobe image */}
        <div
          className="relative lg:w-1/2 h-64 lg:h-full bg-stone-800 bg-cover bg-center flex-shrink-0"
          style={{ backgroundImage: `url(${WARDROBE_IMAGE})` }}
        >
          {/* Subtle gradient at bottom for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/10 to-transparent" />

          {/* Welcome text — bottom left */}
          <div className="absolute bottom-0 left-0 px-8 md:px-10 pb-10">
            <p className="text-xs tracking-widest uppercase text-white/60 mb-3">
              Virtual Closet
            </p>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-medium leading-[1.05] tracking-tight text-white">
              Welcome,
              <br />
              <em className="italic text-white/70">
                {user ? displayName(user) : ''}
              </em>
            </h1>
          </div>
        </div>

        {/* RIGHT — dark panel */}
        <div className={`lg:w-1/2 flex flex-col justify-center px-8 md:px-14 lg:px-16 py-16 lg:py-0 ${dark ? 'bg-stone-950' : 'bg-stone-900'} overflow-y-auto`}>
          <div className="max-w-lg w-full mx-auto lg:mx-0 space-y-10">

            {/* YOUR JOURNEY label */}
            <p className="text-xs tracking-widest uppercase text-stone-500">
              Your Journey
            </p>

            {/* Steps */}
            <div className="space-y-8">
              {journeySteps.map((step) => (
                <div key={step.title} className="flex items-start gap-5">
                  <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
                    <step.icon size={20} strokeWidth={1.5} className="text-white" />
                  </div>
                  <div className="pt-1">
                    <h3 className="text-base font-semibold text-white tracking-tight">
                      {step.title}
                    </h3>
                    <p className={`mt-1 text-sm ${muted} leading-relaxed`}>
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="space-y-4">
              <button
                onClick={() => navigate('/closet')}
                className="w-full py-4 bg-white text-stone-900 rounded-xl text-xs font-semibold tracking-widest uppercase hover:bg-stone-100 transition-colors"
              >
                Add Your First Item
              </button>
              <p className={`text-sm ${muted} text-center`}>
                Or{' '}
                <Link
                  to="/closet"
                  className="underline underline-offset-2 hover:text-white transition-colors"
                >
                  bulk upload items →
                </Link>
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* ─── FOOTER ─── */}
      <div className={`absolute bottom-0 right-0 px-8 md:px-14 lg:px-16 py-5 ${dark ? 'bg-stone-950' : 'bg-stone-900'} lg:w-1/2`}>
        <p className="text-xs tracking-widest uppercase text-stone-600 text-center">
          Virtual Closet &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
