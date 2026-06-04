import api from "./axios";
import type { Business, BusinessDetail, AdminBusinessesResponse, BusinessStatsResponse } from "@/lib/types";

export const businessesApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    plan?: string;
    status?: string;
    agentId?: string;
    search?: string;
    isVerified?: boolean;
  }) => {
    return api.get("/businesses/admin", { params }) as unknown as Promise<AdminBusinessesResponse>;
  },

  getStats: async () => {
    return api.get("/businesses/stats") as unknown as Promise<BusinessStatsResponse>;
  },

  getOne: async (id: string) => {
    return api.get(`/businesses/${id}`) as unknown as Promise<BusinessDetail>;
  },

  create: async (data: {
    name: string;
    owner: string;
    plan?: string;
    mrr?: number;
    status?: string;
    agentId?: string | null;
  }) => {
    return api.post("/businesses", data) as unknown as Promise<Business>;
  },

  update: async (id: string, data: Partial<{
    name: string;
    owner: string;
    plan: string;
    mrr: number;
    status: string;
    agentId: string | null;
  }>) => {
    return api.patch(`/businesses/${id}`, data) as unknown as Promise<Business>;
  },

  remove: async (id: string) => {
    return api.delete(`/businesses/${id}`);
  },
};
