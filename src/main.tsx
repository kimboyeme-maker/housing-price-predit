import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import './index.css'
import '@/i18n'
import { CurrencyProvider } from '@/context/currency'
import { router } from '@/router'
import { Toaster } from '@/components/ui/toaster'

// Shared cache prevents duplicate health/model requests across route transitions.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <CurrencyProvider>
        <RouterProvider router={router} />
        <Toaster />
      </CurrencyProvider>
    </QueryClientProvider>
  </StrictMode>,
)
