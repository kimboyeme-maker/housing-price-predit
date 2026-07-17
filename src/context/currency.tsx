import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { CurrencyCode } from '@/lib/currency'

interface CurrencyCtx {
  currency: CurrencyCode
  setCurrency: (c: CurrencyCode) => void
}

const Ctx = createContext<CurrencyCtx | null>(null)
// Stable key keeps display preference separate from prediction history and theme.
const STORAGE_KEY = 'hpp.currency'

/** Own and persist the display currency for all descendant formatters. */
export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<CurrencyCode>(
    () => (localStorage.getItem(STORAGE_KEY) as CurrencyCode) || 'USD',
  )
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, currency)
  }, [currency])

  return <Ctx.Provider value={{ currency, setCurrency }}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
/** Read currency context and fail early when provider wiring is missing. */
export function useCurrency() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider')
  return ctx
}
