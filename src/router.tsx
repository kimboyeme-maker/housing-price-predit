import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from '@tanstack/react-router'
import { Layout } from '@/components/layout'
import { ErrorState } from '@/components/feedback'
import { Skeleton } from '@/components/ui/skeleton'
import { DashboardPage } from '@/routes/dashboard'
import { ModelPage } from '@/routes/model'
import { PredictPage } from '@/routes/predict'

const rootRoute = createRootRoute({
  component: Layout,
  // Error boundary at the layout level.
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <ErrorState error={error} />
    </div>
  ),
  notFoundComponent: () => (
    <div className="py-16 text-center">
      <h2 className="text-2xl font-bold">404</h2>
      <p className="mt-2 text-muted-foreground">Page not found.</p>
    </div>
  ),
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/dashboard' })
  },
})

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardPage,
})

const predictRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/predict',
  component: PredictPage,
})

const modelRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/model',
  component: ModelPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  dashboardRoute,
  predictRoute,
  modelRoute,
])

export const router = createRouter({
  routeTree,
  defaultPendingComponent: () => (
    <div className="space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-64 w-full" />
    </div>
  ),
  defaultPreload: 'intent',
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
