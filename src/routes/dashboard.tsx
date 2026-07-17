import { Link } from '@tanstack/react-router'
import { Activity, BarChart3, Database, Gauge, Target } from 'lucide-react'
import { Trans, useTranslation } from 'react-i18next'
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
import { useLocale, useMoney } from '@/hooks/useLocale'
import { formatNumber } from '@/lib/utils'

export function DashboardPage() {
  const { t } = useTranslation()
  const locale = useLocale()
  const money = useMoney()
  const health = useHealth()
  const model = useModelInfo()

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.title')}</h1>
          <p className="mt-1 text-muted-foreground">{t('dashboard.subtitle')}</p>
        </div>
        {health.data ? (
          <Badge variant={health.data.model_loaded ? 'success' : 'destructive'}>
            <Activity className="mr-1 h-3 w-3" />
            {(health.data.model_loaded ? t('status.ok') : t('status.degraded')) +
              ` · v${health.data.model_version ?? '—'}`}
          </Badge>
        ) : null}
      </header>

      {model.isPending ? (
        <LoadingCards />
      ) : model.isError ? (
        <ErrorState error={model.error} onRetry={() => model.refetch()} />
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label={t('dashboard.r2')}
              value={formatNumber(model.data.metrics.r2, 4, locale)}
              hint={t('dashboard.cvHint', {
                value: formatNumber(model.data.metrics.cv_r2_mean, 4, locale),
              })}
              icon={<Target className="h-4 w-4" />}
            />
            <StatCard
              label={t('dashboard.mae')}
              value={money(model.data.metrics.mae)}
              hint={t('dashboard.maeHint')}
              icon={<Gauge className="h-4 w-4" />}
            />
            <StatCard
              label={t('dashboard.rmse')}
              value={money(model.data.metrics.rmse)}
              hint={t('dashboard.rmseHint')}
              icon={<BarChart3 className="h-4 w-4" />}
            />
            <StatCard
              label={t('dashboard.rows')}
              value={model.data.dataset_rows}
              hint={t('dashboard.rowsHint', {
                train: model.data.metrics.n_train,
                test: model.data.metrics.n_test,
              })}
              icon={<Database className="h-4 w-4" />}
            />
          </section>

          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.coeffTitle')}</CardTitle>
              <CardDescription>
                <Trans
                  i18nKey="dashboard.coeffDesc"
                  components={{
                    link: <Link to="/model" className="font-medium text-primary hover:underline" />,
                  }}
                />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={model.data.features.map((f) => ({
                    name: t(`feature.${f}`),
                    value: model.data.coefficients[f],
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
                    formatter={(value) => formatNumber(Number(value), 2, locale)}
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 8,
                      color: 'hsl(var(--card-foreground))',
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {model.data.features.map((f) => (
                      <Cell
                        key={f}
                        fill={
                          model.data.coefficients[f] >= 0
                            ? 'hsl(var(--primary))'
                            : 'hsl(var(--destructive))'
                        }
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
                <CardTitle>{t('dashboard.estimateTitle')}</CardTitle>
                <CardDescription>{t('dashboard.estimateDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/predict" className={buttonVariants()}>
                  {t('dashboard.goEstimator')}
                </Link>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.inspectTitle')}</CardTitle>
                <CardDescription>{t('dashboard.inspectDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/model" className={buttonVariants({ variant: 'outline' })}>
                  {t('dashboard.viewModel')}
                </Link>
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </div>
  )
}
