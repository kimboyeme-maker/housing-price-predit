import { Link } from '@tanstack/react-router'
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
import { useModelInfo } from '@/api/hooks'
import { ErrorState, LoadingCards } from '@/components/feedback'
import { StatCard } from '@/components/stat-card'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { FEATURE_META, type HouseFeatures } from '@/lib/types'
import { formatCurrency, formatNumber } from '@/lib/utils'

export function ModelPage() {
  const model = useModelInfo()

  if (model.isPending) return <LoadingCards count={4} />
  if (model.isError) return <ErrorState error={model.error} onRetry={() => model.refetch()} />

  const m = model.data
  const coeffData = m.features.map((f) => ({
    name: FEATURE_META[f as keyof HouseFeatures]?.label ?? f,
    value: m.coefficients[f],
  }))

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Model Information</h1>
          <p className="mt-1 text-muted-foreground">
            {m.model_type} · trained {new Date(m.trained_at).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">v{m.version}</Badge>
          <Link to="/predict" className={buttonVariants({ size: 'sm' })}>
            Try a prediction →
          </Link>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="R² (test)" value={formatNumber(m.metrics.r2, 4)} />
        <StatCard label="CV R² (5-fold)" value={formatNumber(m.metrics.cv_r2_mean, 4)} />
        <StatCard label="MAE" value={formatCurrency(m.metrics.mae)} />
        <StatCard label="RMSE" value={formatCurrency(m.metrics.rmse)} />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Coefficients</CardTitle>
          <CardDescription>
            price ≈ intercept + Σ (coefficient × feature). Intercept ={' '}
            <span className="font-mono">{formatNumber(m.intercept, 2)}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={coeffData} layout="vertical" margin={{ left: 40, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis
                type="category"
                dataKey="name"
                width={150}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip
                formatter={(value) => formatNumber(Number(value), 4)}
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 8,
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {coeffData.map((d) => (
                  <Cell
                    key={d.name}
                    fill={d.value >= 0 ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Feature</TableHead>
                <TableHead className="text-right">Coefficient</TableHead>
                <TableHead className="text-right">Min</TableHead>
                <TableHead className="text-right">Mean</TableHead>
                <TableHead className="text-right">Max</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {m.features.map((f) => (
                <TableRow key={f}>
                  <TableCell className="font-medium">
                    {FEATURE_META[f as keyof HouseFeatures]?.label ?? f}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatNumber(m.coefficients[f], 4)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatNumber(m.feature_stats[f]?.min ?? 0)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatNumber(m.feature_stats[f]?.mean ?? 0)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatNumber(m.feature_stats[f]?.max ?? 0)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
