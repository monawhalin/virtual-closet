import { useState } from 'react'
import { Mail, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/Button'

export function AuthPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-3xl">👗</span>
          <h1 className="text-2xl font-bold text-stone-900 mt-2">Virtual Closet</h1>
          <p className="text-sm text-stone-500 mt-1">Sign in to sync across devices</p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-100 p-6">
          {sent ? (
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                <Mail size={22} className="text-green-600" />
              </div>
              <h2 className="text-base font-semibold text-stone-900">Check your email</h2>
              <p className="text-sm text-stone-500">
                We sent a magic link to <strong>{email}</strong>. Click it to sign in.
              </p>
              <button
                onClick={() => { setSent(false); setEmail('') }}
                className="text-xs text-stone-400 hover:text-stone-700 underline underline-offset-2"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoFocus
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </div>
              {error && (
                <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
              )}
              <Button type="submit" className="w-full justify-center" disabled={loading}>
                {loading ? (
                  <><Loader2 size={14} className="animate-spin" /> Sending…</>
                ) : (
                  <><Mail size={14} /> Send magic link</>
                )}
              </Button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-stone-400 mt-4">
          No password needed — just enter your email.
        </p>
      </div>
    </div>
  )
}
