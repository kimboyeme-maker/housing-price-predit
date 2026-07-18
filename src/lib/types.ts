// Shared types mirroring the backend contract.

/** Numeric feature contract accepted by the prediction API. */
export interface HouseFeatures {
  square_footage: number
  bedrooms: number
  bathrooms: number
  year_built: number
  lot_size: number
  distance_to_city_center: number
  school_rating: number
}

/** One API prediction paired with the features that produced it. */
export interface PredictionItem {
  price: number
  inputs: HouseFeatures
}

/** Traceable batch response returned by POST /predict. */
export interface PredictResponse {
  predictions: PredictionItem[]
  model_version: string | null
}

/** Training range summary used for model inspection. */
export interface FeatureStat {
  min: number
  max: number
  mean: number
}

/** Evaluation metrics generated with model artifacts. */
export interface Metrics {
  r2: number
  mae: number
  rmse: number
  cv_r2_mean: number
  n_train: number
  n_test: number
}

/** Frontend mirror of the backend model metadata contract. */
export interface ModelInfo {
  model_type: string
  target: string
  features: string[]
  coefficients: Record<string, number>
  intercept: number
  metrics: Metrics
  feature_stats: Record<string, FeatureStat>
  trained_at: string
  version: string
  dataset_rows: number
}

/** Backend readiness and loaded artifact version. */
export interface Health {
  status: string
  model_loaded: boolean
  model_version: string | null
  uptime_seconds: number
}

// Normalised error shape assembled from response headers by the API client.
/** Normalized transport failure independent of response-body availability. */
export interface ApiError {
  requestId: string
  errorCode: string
  errorMessage: string
  status: number
  details?: unknown[]
}

// Field metadata for building the form. Order matches the model feature order.
// `label` is the English fallback; UI resolves display text via i18n key `feature.<name>`.
// `unitKey` (when set) resolves via i18n key `unit.<unitKey>`.
export const FEATURE_META: Record<
  keyof HouseFeatures,
  { label: string; unitKey?: string; step: number; min: number; max: number }
> = {
  square_footage: { label: 'Square Footage', unitKey: 'sqft', step: 10, min: 100, max: 100000 },
  bedrooms: { label: 'Bedrooms', step: 1, min: 0, max: 30 },
  bathrooms: { label: 'Bathrooms', step: 0.5, min: 0, max: 30 },
  year_built: { label: 'Year Built', step: 1, min: 1800, max: 2100 },
  lot_size: { label: 'Lot Size', unitKey: 'sqft', step: 50, min: 0, max: 1000000 },
  distance_to_city_center: { label: 'Distance to City Centre', unitKey: 'km', step: 0.1, min: 0, max: 500 },
  school_rating: { label: 'School Rating', unitKey: 'rating', step: 0.1, min: 0, max: 10 },
}

export const FEATURE_ORDER = Object.keys(FEATURE_META) as (keyof HouseFeatures)[]
