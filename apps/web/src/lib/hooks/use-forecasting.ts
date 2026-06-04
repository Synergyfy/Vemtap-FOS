import { useMutation } from "@tanstack/react-query";
import { forecastingApi } from "@/lib/api/forecasting.api";
import type { ForecastInput } from "@/lib/types";

export function useForecastProjection() {
  return useMutation({
    mutationFn: (data: ForecastInput) => forecastingApi.project(data),
  });
}
