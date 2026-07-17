import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { CurrencyCode } from '@/lib/currency'

interface CurrencyCtx {
  currency: CurrencyCode
  setCurrency: (c: CurrencyCode) => void
}

const Ctx = createContext<CurrencyCtx | null>(null)
const STORAGE_KEY = 'hpp.currency'

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
export function useCurrency() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider')
  return ctx
}
