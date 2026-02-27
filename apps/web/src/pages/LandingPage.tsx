import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Camera, Sparkles, BarChart3, ArrowRight, Sun, Moon } from 'lucide-react'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1600&q=80&auto=format&fit=crop'

const features = [
  {
    icon: Camera,
    title: 'Digitize & Classify',
    description:
      'Snap a photo and AI handles the rest. Category, dominant colors, and season are detected automatically.',
  },
  {
    icon: Sparkles,
    title: 'Generate Outfits',
    description:
      'Get outfit suggestions based on occasion, wear history, and your personal preferences. Lock pieces you love and regenerate the rest.',
  },
  {
    icon: BarChart3,
    title: 'Track & Optimize',
    description:
      'Log what you wear. Surface neglected pieces, build capsule wardrobes, and make the most of what you own.',
  },
]

const steps = [
  {
    title: 'Upload Your Clothes',
    description:
      'Drag in a photo or snap one with your camera. The app identifies category, colors, and season on-device.',
  },
  {
    title: 'Generate Outfits',
    description:
      'Pick an occasion and hit generate. The algorithm builds looks from your actual wardrobe, weighted toward pieces you haven\'t worn lately.',
  },
  {
    title: 'Wear & Refine',
    description:
      'Mark outfits as worn and the system learns your habits. Over time, suggestions get sharper and your closet gets leaner.',
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

export function LandingPage() {
  // Supabase magic links redirect to "/" with hash params (e.g. #access_token=...).
  // Since the landing page is outside AuthGuard, forward them to /login so
  // AuthGuard's supabase.auth.getSession() can process the token.
  useEffect(() => {
    const hash = window.location.hash
    if (hash && (hash.includes('access_token') || hash.includes('error'))) {
      window.location.replace('/login' + hash)
    }
  }, [])

  const [dark, setDark] = useState(true)

  const bg = dark ? 'bg-stone-950' : 'bg-stone-50'
  const text = dark ? 'text-white' : 'text-stone-900'
  const muted = dark ? 'text-stone-400' : 'text-stone-500'
  const sectionBg = dark ? 'bg-stone-900' : 'bg-white'
  const iconBg = dark ? 'bg-stone-800' : 'bg-stone-100'
  const iconHover = dark
    ? 'group-hover:bg-white group-hover:text-stone-900'
    : 'group-hover:bg-stone-900 group-hover:text-white'
  const stepNum = dark ? 'text-stone-700' : 'text-stone-300'
  const ctaPrimary =
    'bg-white text-stone-900 hover:bg-stone-200'
  const ctaSecondary =
    'border-white/30 text-white/80 hover:border-white hover:text-white'
  const footerBorder = dark ? 'border-stone-800' : 'border-stone-200'
  const footerMuted = dark ? 'text-stone-500' : 'text-stone-400'

  return (
    <div className={`min-h-screen ${bg} ${text} transition-colors duration-300`}>
      {/* ─── NAV (floats over hero) ─── */}
      <nav className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 md:px-12 lg:px-20 py-6">
        <Link to="/" className="flex items-center gap-2.5 text-white">
          <HangerIcon className="w-7 h-7" />
          <span className="font-serif text-2xl tracking-tight">Virtual Closet</span>
        </Link>

        <button
          onClick={() => setDark(!dark)}
          className="w-12 h-12 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors duration-200"
          aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {dark ? <Sun size={20} strokeWidth={1.5} /> : <Moon size={20} strokeWidth={1.5} />}
        </button>
      </nav>

      {/* ─── HERO (background image) ─── */}
      <section
        className="relative min-h-[85vh] flex items-end bg-stone-900 bg-cover bg-center"
        style={{ backgroundImage: `url(${HERO_IMAGE})` }}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-stone-950/30" />

        {/* Content */}
        <div className="relative z-[1] px-6 md:px-12 lg:px-20 pb-16 md:pb-24 pt-32 w-full">
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-medium leading-[1.1] tracking-tight text-white">
            Your wardrobe,
            <br />
            <span className="italic text-white/50">reimagined.</span>
          </h1>

          <p className="mt-6 md:mt-8 text-lg md:text-xl text-white/60 max-w-xl leading-relaxed">
            Digitize your closet. Generate outfits with AI.
            <br className="hidden md:block" />
            Dress with intention, every day.
          </p>

          <div className="mt-10 md:mt-12 flex flex-wrap gap-4">
            <Link
              to="/login"
              className={`inline-flex items-center gap-2 px-8 py-3.5 rounded-lg text-sm font-medium tracking-wide uppercase transition-colors ${ctaPrimary}`}
            >
              Log In
            </Link>
            <Link
              to="/closet"
              className={`inline-flex items-center gap-2 border px-8 py-3.5 rounded-lg text-sm font-medium tracking-wide uppercase transition-colors ${ctaSecondary}`}
            >
              View Demo
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className={`px-6 md:px-12 lg:px-20 py-24 md:py-32 ${sectionBg} transition-colors duration-300`}>
        <div className="max-w-3xl">
          <h2 className="font-serif text-3xl md:text-4xl font-medium tracking-tight">
            Redefine Your Wardrobe
          </h2>
          <p className={`mt-4 text-base ${muted} max-w-lg`}>
            Three tools to transform how you get dressed.
          </p>
        </div>

        <div className="mt-14 md:mt-20 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
          {features.map((f) => (
            <div key={f.title} className="group">
              <div
                className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center mb-5 ${iconHover} transition-colors duration-200`}
              >
                <f.icon size={22} strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-semibold tracking-tight">
                {f.title}
              </h3>
              <p className={`mt-2.5 text-sm ${muted} leading-relaxed`}>
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="px-6 md:px-12 lg:px-20 py-24 md:py-32">
        <div className="max-w-3xl">
          <h2 className="font-serif text-3xl md:text-4xl font-medium tracking-tight">
            How It Works
          </h2>
        </div>

        <div className="mt-14 md:mt-20 grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
          {steps.map((step, i) => (
            <div key={step.title}>
              <span className={`text-sm font-medium ${stepNum} tracking-widest uppercase`}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-3 text-base font-semibold tracking-tight">
                {step.title}
              </h3>
              <p className={`mt-2.5 text-sm ${muted} leading-relaxed`}>
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className={`px-6 md:px-12 lg:px-20 py-12 border-t ${footerBorder} transition-colors duration-300`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="text-sm font-semibold tracking-tight">
              Virtual Closet
            </span>
            <p className={`text-xs ${footerMuted} mt-1`}>
              Open source. Your data stays on your device.
            </p>
          </div>
          <p className={`text-xs ${footerMuted}`}>
            &copy; {new Date().getFullYear()} Virtual Closet
          </p>
        </div>
      </footer>
    </div>
  )
}
