import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ToastMessage {
  id: number
  title: string
  description?: string
  variant?: 'default' | 'destructive'
}

type ToastInput = Omit<ToastMessage, 'id'>
type Listener = (message: ToastMessage) => void

const listeners = new Set<Listener>()
let nextId = 0

/** Imperative shadcn-style toast entry point usable from error boundaries. */
export function toast(input: ToastInput): void {
  const message = { ...input, id: ++nextId }
  listeners.forEach((listener) => listener(message))
}

/** Global toast viewport. Mount once near the application root. */
export function Toaster() {
  const [messages, setMessages] = useState<ToastMessage[]>([])

  useEffect(() => {
    const listener: Listener = (message) => {
      setMessages((current) => [...current.slice(-3), message])
      window.setTimeout(
        () => setMessages((current) => current.filter((item) => item.id !== message.id)),
        6000,
      )
    }
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  return (
    <div
      className="fixed bottom-4 right-4 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2"
      role="region"
      aria-label="Notifications"
    >
      {messages.map((message) => (
        <div
          key={message.id}
          role="alert"
          className={cn(
            'relative rounded-md border bg-background p-4 pr-10 shadow-lg',
            message.variant === 'destructive' && 'border-destructive text-destructive',
          )}
        >
          <p className="text-sm font-semibold">{message.title}</p>
          {message.description ? <p className="mt-1 text-sm opacity-80">{message.description}</p> : null}
          <button
            type="button"
            className="absolute right-3 top-3 rounded-sm opacity-70 hover:opacity-100"
            onClick={() => setMessages((current) => current.filter((item) => item.id !== message.id))}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
          </button>
        </div>
      ))}
    </div>
  )
}
