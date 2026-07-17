// Persist prediction history in localStorage so estimates survive reloads.
// Also powers the comparison view (select multiple entries).

import { useCallback, useEffect, useState } from 'react'
import type { HouseFeatures } from '@/lib/types'

export interface HistoryEntry {
  id: string
  createdAt: number
  price: number
  modelVersion: string | null
  features: HouseFeatures
}

const STORAGE_KEY = 'hpp.history.v1'
const MAX_ENTRIES = 50

function read(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : []
  } catch {
    return []
  }
}

export function usePredictionHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>(read)

  // Keep in sync across tabs.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setEntries(read())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const persist = useCallback((next: HistoryEntry[]) => {
    setEntries(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }, [])

  const add = useCallback(
    (entry: Omit<HistoryEntry, 'id' | 'createdAt'>) => {
      const full: HistoryEntry = {
        ...entry,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      }
      persist([full, ...read()].slice(0, MAX_ENTRIES))
    },
    [persist],
  )

  const remove = useCallback(
    (id: string) => persist(read().filter((e) => e.id !== id)),
    [persist],
  )

  const clear = useCallback(() => persist([]), [persist])

  return { entries, add, remove, clear }
}
