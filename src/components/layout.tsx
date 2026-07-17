import { Link, Outlet, useRouterState } from '@tanstack/react-router'
import { BarChart3, Home, LineChart, Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useHealth } from '@/api/hooks'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: Home },
  { to: '/predict', label: 'Estimator', icon: LineChart },
  { to: '/model', label: 'Model', icon: BarChart3 },
] as const

function useTheme() {
  const [dark, setDark] = useState(
    () =>
      localStorage.getItem('hpp.theme') === 'dark' ||
      (!localStorage.getItem('hpp.theme') &&
        window.matchMedia('(prefers-color-scheme: dark)').matches),
  )
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', dark)
    root.classList.toggle('light', !dark)
    localStorage.setItem('hpp.theme', dark ? 'dark' : 'light')
  }, [dark])
  return { dark, toggle: () => setDark((d) => !d) }
}

export function Layout() {
  const { pathname } = useRouterState({ select: (s) => s.location })
  const health = useHealth()
  const { dark, toggle } = useTheme()

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
          <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
              H
            </span>
            <span className="hidden sm:inline">HousePrice</span>
          </Link>

          <nav className="flex flex-1 items-center gap-1">
            {NAV.map(({ to, label, icon: Icon }) => {
              const active = pathname === to || (to === '/dashboard' && pathname === '/')
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    'flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-secondary text-secondary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-3">
            {health.data ? (
              <Badge
                variant={health.data.model_loaded ? 'success' : 'destructive'}
                className="hidden sm:inline-flex"
              >
                {health.data.status}
              </Badge>
            ) : null}
            <button
              type="button"
              onClick={toggle}
              aria-label="Toggle theme"
              className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        Housing Price Prediction · FastAPI + scikit-learn · React + TanStack
      </footer>
    </div>
  )
}
