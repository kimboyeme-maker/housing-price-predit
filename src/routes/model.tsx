import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
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
import { useLocale, useMoney } from '@/hooks/useLocale'
import { formatNumber } from '@/lib/utils'

/** Render model provenance and parameters for transparent prediction review. */
export function ModelPage() {
  const { t } = useTranslation()
  const locale = useLocale()
  const money = useMoney()
  const model = useModelInfo()

  if (model.isPending) return <LoadingCards count={4} />
  if (model.isError) return <ErrorState error={model.error} onRetry={() => model.refetch()} />

  const m = model.data
  // Reuse one localized coefficient projection for chart and sign coloring.
  const coeffData = m.features.map((f) => ({
    name: t(`feature.${f}`),
    value: m.coefficients[f],
  }))

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('model.title')}</h1>
          <p className="mt-1 text-muted-foreground">
            {t('model.trained', {
              type: m.model_type,
              date: new Date(m.trained_at).toLocaleString(locale),
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">v{m.version}</Badge>
          <Link to="/predict" className={buttonVariants({ size: 'sm' })}>
            {t('model.tryPrediction')}
          </Link>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t('model.r2')} value={formatNumber(m.metrics.r2, 4, locale)} />
        <StatCard label={t('model.cvR2')} value={formatNumber(m.metrics.cv_r2_mean, 4, locale)} />
        <StatCard label={t('model.mae')} value={money(m.metrics.mae)} />
        <StatCard label={t('model.rmse')} value={money(m.metrics.rmse)} />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>{t('model.coefficients')}</CardTitle>
          <CardDescription>
            {t('model.coeffFormula', { intercept: formatNumber(m.intercept, 2, locale) })}
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
                formatter={(value) => formatNumber(Number(value), 4, locale)}
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
                <TableHead>{t('model.colFeature')}</TableHead>
                <TableHead className="text-right">{t('model.colCoefficient')}</TableHead>
                <TableHead className="text-right">{t('model.colMin')}</TableHead>
                <TableHead className="text-right">{t('model.colMean')}</TableHead>
                <TableHead className="text-right">{t('model.colMax')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {m.features.map((f) => (
                <TableRow key={f}>
                  <TableCell className="font-medium">{t(`feature.${f}`)}</TableCell>
                  <TableCell className="text-right font-mono">
                    {formatNumber(m.coefficients[f], 4, locale)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatNumber(m.feature_stats[f]?.min ?? 0, 2, locale)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatNumber(m.feature_stats[f]?.mean ?? 0, 2, locale)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatNumber(m.feature_stats[f]?.max ?? 0, 2, locale)}
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
