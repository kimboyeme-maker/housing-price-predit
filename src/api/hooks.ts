// TanStack Query hooks — the single source of truth for server state.

import { useMutation, useQuery } from '@tanstack/react-query'
import { api } from './client'
import type { Health, HouseFeatures, ModelInfo, PredictResponse } from '@/lib/types'

export const queryKeys = {
  health: ['health'] as const,
  modelInfo: ['model-info'] as const,
}

/** Poll backend readiness so global health badges recover without a reload. */
export function useHealth() {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: () => api.get<Health>('/health'),
    refetchInterval: 30_000,
  })
}

/** Cache model metadata because it changes only when artifacts are retrained. */
export function useModelInfo() {
  return useQuery({
    queryKey: queryKeys.modelInfo,
    queryFn: () => api.get<ModelInfo>('/model-info'),
    staleTime: 5 * 60_000,
  })
}

/** Submit ordered feature batches and expose mutation lifecycle state. */
export function usePredict() {
  return useMutation({
    mutationFn: (features: HouseFeatures[]) =>
      api.post<PredictResponse>('/predict', features),
  })
}
