import { useState } from 'react'
import { Navigate, useNavigate, useLocation } from 'react-router-dom'
import { authApi } from '@/api/endpoints'
import { useAdminAuth } from './useAdminAuth'
import { Button } from '@/components/ui/Button'
import { Input, Label } from '@/components/ui/Input'

export function LoginPage() {
  const { setSession, isAuthenticated } = useAdminAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    return <Navigate to={from} replace />
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await authApi.login(username, password)
      setSession(res.data.accessToken, res.data.admin)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-canvas px-4">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgb(15_118_110_/_0.18),_transparent_55%),linear-gradient(180deg,_#f1f5f9,_#e2e8f0)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'linear-gradient(rgb(15 23 42 / 0.04) 1px, transparent 1px), linear-gradient(90deg, rgb(15 23 42 / 0.04) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <form
        onSubmit={onSubmit}
        className="relative w-full max-w-md rounded-xl border border-border bg-surface/95 p-8 shadow-panel backdrop-blur"
      >
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          Lottery Admin
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-fg">
          Owner sign in
        </h1>
        <p className="mt-1 text-sm text-fg-muted">
          Username + password against the live API (no mock data).
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        {error ? (
          <p className="mt-3 text-sm text-danger" role="alert">
            {error}
          </p>
        ) : (
          <p className="mt-3 text-xs text-fg-subtle">
            Seeded owner account (after <code>npm run prisma:seed</code>):{' '}
            <span className="font-mono">owner</span> / env{' '}
            <span className="font-mono">ADMIN_BOOTSTRAP_PASSWORD</span>
          </p>
        )}

        <Button type="submit" className="mt-6 w-full" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </div>
  )
}
