import { Link, Outlet, useRouterState } from '@tanstack/react-router'
import { BarChart3, Home, LineChart, Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useHealth } from '@/api/hooks'
import { useCurrency } from '@/context/currency'
import { SUPPORTED_LANGUAGES } from '@/i18n'
import { CURRENCIES } from '@/lib/currency'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const NAV = [
  { to: '/dashboard', key: 'nav.dashboard', icon: Home },
  { to: '/predict', key: 'nav.estimator', icon: LineChart },
  { to: '/model', key: 'nav.model', icon: BarChart3 },
] as const

/** Persist explicit theme choice while respecting system preference on first visit. */
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

const selectCls =
  'h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

/** Shared application shell for navigation, settings, health, and child routes. */
export function Layout() {
  const { t, i18n } = useTranslation()
  const { pathname } = useRouterState({ select: (s) => s.location })
  const health = useHealth()
  const { dark, toggle } = useTheme()
  const { currency, setCurrency } = useCurrency()

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
          <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
              H
            </span>
            <span className="hidden sm:inline">{t('brand')}</span>
          </Link>

          <nav className="flex flex-1 items-center gap-1">
            {NAV.map(({ to, key, icon: Icon }) => {
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
                  <span className="hidden sm:inline">{t(key)}</span>
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-2">
            {health.data ? (
              <Badge
                variant={health.data.model_loaded ? 'success' : 'destructive'}
                className="hidden md:inline-flex"
              >
                {health.data.model_loaded ? t('status.ok') : t('status.degraded')}
              </Badge>
            ) : null}

            <select
              aria-label={t('settings.currency')}
              className={selectCls}
              value={currency}
              onChange={(e) => setCurrency(e.target.value as never)}
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code}
                </option>
              ))}
            </select>

            <select
              aria-label={t('settings.language')}
              className={selectCls}
              value={i18n.language?.split('-')[0]}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={toggle}
              aria-label="Toggle theme"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
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
        {t('footer')}
      </footer>
    </div>
  )
}
