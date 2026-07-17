import { AlertCircle, RefreshCw } from 'lucide-react'
import { ApiClientError } from '@/api/client'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

/** Uniform error panel that surfaces the backend errorCode + requestId for support. */
export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const e = error instanceof ApiClientError ? error : null
  return (
    <Alert variant="destructive">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="flex-1">
          <AlertTitle>{e?.errorCode ?? 'Error'}</AlertTitle>
          <AlertDescription>
            <p>{e?.errorMessage ?? (error instanceof Error ? error.message : 'Something went wrong')}</p>
            {e?.requestId ? (
              <p className="mt-1 font-mono text-xs opacity-70">requestId: {e.requestId}</p>
            ) : null}
          </AlertDescription>
          {onRetry ? (
            <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
              <RefreshCw className="h-4 w-4" /> Retry
            </Button>
          ) : null}
        </div>
      </div>
    </Alert>
  )
}

export function LoadingCards({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-28 w-full" />
      ))}
    </div>
  )
}
