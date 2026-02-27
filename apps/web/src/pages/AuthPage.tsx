import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Loader2, Lock, ArrowRight, ExternalLink, Sun, Moon } from 'lucide-react'
import { supabase } from '../lib/supabase'

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

export function AuthPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dark, setDark] = useState(true)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError(null)
    const { error: authError } = await supabase.auth.signInWithOtp({ email: email.trim() })
    setLoading(false)
    if (authError) {
      setError(authError.message)
    } else {
      setSent(true)
    }
  }

  const bg = dark ? 'bg-stone-950' : 'bg-stone-50'
  const text = dark ? 'text-white' : 'text-stone-900'
  const muted = dark ? 'text-stone-400' : 'text-stone-500'
  const inputBorder = dark ? 'border-stone-700' : 'border-stone-300'
  const inputText = dark ? 'text-white placeholder:text-stone-600' : 'text-stone-900 placeholder:text-stone-400'
  const inputBg = dark ? 'bg-transparent' : 'bg-transparent'
  const infoBg = dark ? 'bg-stone-900' : 'bg-stone-100'
  const dividerColor = dark ? 'border-stone-800' : 'border-stone-200'

  return (
    <div className={`min-h-screen ${bg} ${text} transition-colors duration-300 flex flex-col`}>

      {/* ─── NAV ─── */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-6 flex-shrink-0">
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

      {/* ─── MAIN ─── */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">

          {sent ? (
            /* ── Check your inbox state ── */
            <div className="text-center space-y-8">
              {/* Icon */}
              <div className="w-16 h-16 rounded-full bg-stone-800 flex items-center justify-center mx-auto">
                <Mail size={26} className="text-white" strokeWidth={1.5} />
              </div>

              {/* Heading + body */}
              <div className="space-y-4">
                <h1 className="font-serif text-4xl md:text-5xl font-medium tracking-tight">
                  Check your inbox.
                </h1>
                <p className={`${muted} text-sm leading-relaxed`}>
                  We've sent a magic link to
                  <br />
                  <span className={`${text} font-medium`}>{email}</span>.
                  {' '}Click the link to sign in instantly.
                </p>
              </div>

              {/* Open email app */}
              <a
                href="mailto:"
                className="w-full flex items-center justify-center gap-2.5 bg-white text-stone-900 py-4 rounded-xl text-sm font-medium hover:bg-stone-100 transition-colors"
              >
                Open Email App <ExternalLink size={14} strokeWidth={2} />
              </a>

              {/* Resend */}
              <p className={`text-sm ${muted}`}>
                Didn't receive the email?{' '}
                <button
                  onClick={() => setSent(false)}
                  className="underline underline-offset-2 hover:text-white transition-colors"
                >
                  Resend link
                </button>
              </p>
            </div>

          ) : (
            /* ── Login form state ── */
            <div className="space-y-8">
              {/* Icon */}
              <div className="flex justify-center">
                <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
                  <HangerIcon className="w-7 h-7 text-white" />
                </div>
              </div>

              {/* Heading */}
              <div className="text-center space-y-3">
                <h1 className="font-serif text-4xl md:text-5xl font-medium tracking-tight">
                  Welcome back.
                </h1>
                <p className={`${muted} text-sm leading-relaxed`}>
                  Enter your email to receive a secure<br />login link.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Underline input */}
                <div className={`border-b ${inputBorder} transition-colors focus-within:border-white`}>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    autoFocus
                    className={`w-full py-3 ${inputBg} ${inputText} text-sm focus:outline-none`}
                  />
                </div>

                {error && (
                  <p className="text-xs text-red-400">{error}</p>
                )}

                {/* Primary CTA */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2.5 bg-white text-stone-900 py-4 rounded-xl text-sm font-medium hover:bg-stone-100 transition-colors disabled:opacity-60"
                >
                  {loading ? (
                    <><Loader2 size={16} className="animate-spin" /> Sending…</>
                  ) : (
                    <>Send Magic Link <ArrowRight size={15} strokeWidth={2} /></>
                  )}
                </button>
              </form>

              {/* Info box */}
              <div className={`${infoBg} rounded-xl px-4 py-4 flex items-start gap-3`}>
                <Lock size={16} className="text-blue-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <p className={`text-xs ${muted} leading-relaxed`}>
                  We'll send a secure link to your inbox to sign you in instantly. No passwords required.
                </p>
              </div>

              {/* Legal */}
              <div className={`border-t ${dividerColor} pt-6 space-y-3 text-center`}>
                <p className={`text-xs ${muted}`}>
                  By continuing, you agree to Virtual Closet's{' '}
                  <a href="#" className="underline underline-offset-2 hover:text-white transition-colors">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="underline underline-offset-2 hover:text-white transition-colors">Privacy Policy</a>.
                </p>
                <p className={`text-xs ${muted}`}>
                  New here?{' '}
                  <Link to="/" className="underline underline-offset-2 hover:text-white transition-colors">
                    View the demo
                  </Link>
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="py-6 text-center flex-shrink-0">
        <p className={`text-xs tracking-widest uppercase ${muted}`}>
          Virtual Closet &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  )
}
