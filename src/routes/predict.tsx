import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { History, Trash2, TrendingUp } from 'lucide-react'
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
import { z } from 'zod'
import { useModelInfo, usePredict } from '@/api/hooks'
import { ErrorState } from '@/components/feedback'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { usePredictionHistory } from '@/hooks/usePredictionHistory'
import { FEATURE_META, FEATURE_ORDER, type HouseFeatures } from '@/lib/types'
import { formatCurrency, formatNumber } from '@/lib/utils'

// Build a zod schema from the feature metadata (single source of truth).
const schema = z.object(
  Object.fromEntries(
    FEATURE_ORDER.map((f) => {
      const meta = FEATURE_META[f]
      return [
        f,
        z.coerce
          .number({ message: `${meta.label} is required` })
          .min(meta.min, `Min ${meta.min}`)
          .max(meta.max, `Max ${meta.max}`),
      ]
    }),
  ),
)

const DEFAULTS: Record<keyof HouseFeatures, string> = {
  square_footage: '1550',
  bedrooms: '3',
  bathrooms: '2',
  year_built: '1997',
  lot_size: '6800',
  distance_to_city_center: '4.1',
  school_rating: '7.6',
}

export function PredictPage() {
  const model = useModelInfo()
  const predict = usePredict()
  const history = usePredictionHistory()

  const [values, setValues] = useState<Record<keyof HouseFeatures, string>>(DEFAULTS)
  const [errors, setErrors] = useState<Partial<Record<keyof HouseFeatures, string>>>({})
  const [result, setResult] = useState<{ price: number; features: HouseFeatures } | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  function setField(f: keyof HouseFeatures, v: string) {
    setValues((prev) => ({ ...prev, [f]: v }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = schema.safeParse(values)
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof HouseFeatures, string>> = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof HouseFeatures
        if (!fieldErrors[key]) fieldErrors[key] = issue.message
      }
      setErrors(fieldErrors)
      return
    }
    setErrors({})
    const features = parsed.data as unknown as HouseFeatures
    const res = await predict.mutateAsync([features])
    const price = res.predictions[0].price
    setResult({ price, features })
    history.add({ price, modelVersion: res.model_version, features })
  }

  // Feature contribution = coefficient × input value (needs model-info).
  const contributions = useMemo(() => {
    if (!result || !model.data) return []
    return FEATURE_ORDER.map((f) => ({
      name: FEATURE_META[f].label,
      value: Number((model.data.coefficients[f] * result.features[f]).toFixed(2)),
    })).sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
  }, [result, model.data])

  const compareEntries = history.entries.filter((e) => selected.has(e.id))

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Property Value Estimator</h1>
        <p className="mt-1 text-muted-foreground">
          Enter property details for an instant price prediction. Weights come from the{' '}
          <Link to="/model" className="font-medium text-primary hover:underline">
            trained model
          </Link>
          .
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ---- Form ---- */}
        <Card>
          <CardHeader>
            <CardTitle>Property details</CardTitle>
            <CardDescription>All fields are validated client-side before submission.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} noValidate className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {FEATURE_ORDER.map((f) => {
                  const meta = FEATURE_META[f]
                  const err = errors[f]
                  return (
                    <div key={f} className="space-y-1.5">
                      <Label htmlFor={f}>
                        {meta.label}
                        {meta.unit ? (
                          <span className="ml-1 text-muted-foreground">({meta.unit})</span>
                        ) : null}
                      </Label>
                      <Input
                        id={f}
                        name={f}
                        type="number"
                        step={meta.step}
                        inputMode="decimal"
                        value={values[f]}
                        aria-invalid={!!err}
                        aria-describedby={err ? `${f}-error` : undefined}
                        onChange={(ev) => setField(f, ev.target.value)}
                      />
                      {err ? (
                        <p id={`${f}-error`} className="text-xs text-destructive">
                          {err}
                        </p>
                      ) : null}
                    </div>
                  )
                })}
              </div>
              <div className="flex items-center gap-3">
                <Button type="submit" disabled={predict.isPending}>
                  {predict.isPending ? 'Predicting…' : 'Predict price'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setValues(DEFAULTS)
                    setErrors({})
                  }}
                >
                  Reset
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* ---- Result ---- */}
        <Card>
          <CardHeader>
            <CardTitle>Prediction</CardTitle>
            <CardDescription>Estimated price and feature contributions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {predict.isError ? (
              <ErrorState error={predict.error} />
            ) : result ? (
              <>
                <div className="rounded-lg bg-primary/5 p-6 text-center">
                  <p className="text-sm text-muted-foreground">Estimated price</p>
                  <p className="mt-1 text-4xl font-bold tracking-tight text-primary">
                    {formatCurrency(result.price)}
                  </p>
                  {model.data ? (
                    <Badge variant="secondary" className="mt-2">
                      model v{model.data.version}
                    </Badge>
                  ) : null}
                </div>
                {contributions.length ? (
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 text-sm font-medium">
                      <TrendingUp className="h-4 w-4" /> Feature contributions
                    </p>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={contributions} layout="vertical" margin={{ left: 20, right: 12 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={130}
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={11}
                        />
                        <Tooltip
                          formatter={(value) => formatCurrency(Number(value))}
                          contentStyle={{
                            background: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: 8,
                          }}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                          {contributions.map((d) => (
                            <Cell
                              key={d.name}
                              fill={d.value >= 0 ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="flex h-64 items-center justify-center text-center text-muted-foreground">
                <p>Submit the form to see a prediction.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ---- History + comparison ---- */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" /> History
            </CardTitle>
            <CardDescription>
              Previous estimates (saved locally). Select rows to compare side-by-side.
            </CardDescription>
          </div>
          {history.entries.length ? (
            <Button variant="ghost" size="sm" onClick={history.clear}>
              <Trash2 className="h-4 w-4" /> Clear
            </Button>
          ) : null}
        </CardHeader>
        <CardContent>
          {history.entries.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No estimates yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10" />
                  <TableHead>When</TableHead>
                  <TableHead className="text-right">Sq ft</TableHead>
                  <TableHead className="text-right">Beds</TableHead>
                  <TableHead className="text-right">Baths</TableHead>
                  <TableHead className="text-right">Year</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.entries.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        aria-label="Select for comparison"
                        checked={selected.has(e.id)}
                        onChange={() => toggleSelect(e.id)}
                        className="h-4 w-4 accent-[hsl(var(--primary))]"
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(e.createdAt).toLocaleTimeString()}
                    </TableCell>
                    <TableCell className="text-right">{e.features.square_footage}</TableCell>
                    <TableCell className="text-right">{e.features.bedrooms}</TableCell>
                    <TableCell className="text-right">{e.features.bathrooms}</TableCell>
                    <TableCell className="text-right">{e.features.year_built}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(e.price)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        aria-label="Remove"
                        onClick={() => history.remove(e.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {compareEntries.length >= 2 ? (
        <Card>
          <CardHeader>
            <CardTitle>Comparison ({compareEntries.length})</CardTitle>
            <CardDescription>Side-by-side view of the selected properties.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Feature</TableHead>
                  {compareEntries.map((e, i) => (
                    <TableHead key={e.id} className="text-right">
                      #{i + 1}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {FEATURE_ORDER.map((f) => (
                  <TableRow key={f}>
                    <TableCell className="font-medium">{FEATURE_META[f].label}</TableCell>
                    {compareEntries.map((e) => (
                      <TableCell key={e.id} className="text-right">
                        {formatNumber(e.features[f])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                <TableRow className="border-t-2">
                  <TableCell className="font-semibold">Predicted price</TableCell>
                  {compareEntries.map((e) => (
                    <TableCell key={e.id} className="text-right font-semibold text-primary">
                      {formatCurrency(e.price)}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}

      <p className="text-center text-sm text-muted-foreground">
        Want the full model breakdown?{' '}
        <Link to="/model" className="font-medium text-primary hover:underline">
          View model info
        </Link>
      </p>
    </div>
  )
}
