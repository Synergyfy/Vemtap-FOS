import FOS_API from "./axios";
import type { ForecastInput, ForecastProjection } from "@/lib/types";

export const forecastingApi = {
  project: async (data: ForecastInput) => {
    return FOS_API.post<ForecastProjection>(
      "/forecasting/project",
      data,
    ) as Promise<ForecastProjection>;
  },
};
