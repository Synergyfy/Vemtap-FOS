import api from "./axios";
import type { FunnelSnapshot } from "@/lib/types";

export const funnelApi = {
  getStats: async () => {
    return api.get("/funnel/stats") as Promise<FunnelSnapshot[]>;
  },
};
