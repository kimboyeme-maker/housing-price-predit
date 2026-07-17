import { Link } from '@tanstack/react-router'
import { Activity, BarChart3, Database, Gauge, Target } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useHealth, useModelInfo } from '@/api/hooks'
import { ErrorState, LoadingCards } from '@/components/feedback'
import { StatCard } from '@/components/stat-card'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatNumber } from '@/lib/utils'

export function DashboardPage() {
  const health = useHealth()
  const model = useModelInfo()

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Overview of the housing-price regression model and service health.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {health.data ? (
            <Badge variant={health.data.model_loaded ? 'success' : 'destructive'}>
              <Activity className="mr-1 h-3 w-3" />
              {health.data.status} · v{health.data.model_version ?? '—'}
            </Badge>
          ) : null}
        </div>
      </header>

      {model.isPending ? (
        <LoadingCards />
      ) : model.isError ? (
        <ErrorState error={model.error} onRetry={() => model.refetch()} />
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="R² (test)"
              value={formatNumber(model.data.metrics.r2, 4)}
              hint={`CV R² ${formatNumber(model.data.metrics.cv_r2_mean, 4)}`}
              icon={<Target className="h-4 w-4" />}
            />
            <StatCard
              label="MAE"
              value={formatCurrency(model.data.metrics.mae)}
              hint="Mean absolute error"
              icon={<Gauge className="h-4 w-4" />}
            />
            <StatCard
              label="RMSE"
              value={formatCurrency(model.data.metrics.rmse)}
              hint="Root mean squared error"
              icon={<BarChart3 className="h-4 w-4" />}
            />
            <StatCard
              label="Training rows"
              value={model.data.dataset_rows}
              hint={`${model.data.metrics.n_train} train · ${model.data.metrics.n_test} test`}
              icon={<Database className="h-4 w-4" />}
            />
          </section>

          <Card>
            <CardHeader>
              <CardTitle>Feature coefficients</CardTitle>
              <CardDescription>
                Learned weight per feature. See the{' '}
                <Link to="/model" className="font-medium text-primary hover:underline">
                  model page
                </Link>{' '}
                for full details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={Object.entries(model.data.coefficients).map(([name, value]) => ({
                    name: name.replace(/_/g, ' '),
                    value,
                  }))}
                  layout="vertical"
                  margin={{ left: 40, right: 16 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={140}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip
                    formatter={(value) => formatNumber(Number(value), 2)}
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 8,
                      color: 'hsl(var(--card-foreground))',
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {Object.entries(model.data.coefficients).map(([name, value]) => (
                      <Cell
                        key={name}
                        fill={value >= 0 ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <section className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Estimate a property</CardTitle>
                <CardDescription>Enter features and get an instant price prediction.</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/predict" className={buttonVariants()}>
                  Go to estimator →
                </Link>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Inspect the model</CardTitle>
                <CardDescription>Coefficients, metrics and training statistics.</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/model" className={buttonVariants({ variant: 'outline' })}>
                  View model info →
                </Link>
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </div>
  )
}
