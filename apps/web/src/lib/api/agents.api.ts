import api from "./axios";
import type {
  AgentDetailResponse,
  ListAgentsResponse,
  RevenueTrendResponse,
} from "@/lib/types";

export const agentsApi = {
  getAll: async (params?: {
    page?: number;
    perPage?: number;
    search?: string;
    status?: string;
  }) => {
    return api.get("/affiliates/agents", { params }) as unknown as Promise<ListAgentsResponse>;
  },

  getOne: async (id: string) => {
    return api.get(`/affiliates/agents/${id}`) as unknown as Promise<AgentDetailResponse>;
  },

  getRevenue: async (id: string) => {
    return api.get(`/affiliates/agents/${id}/revenue`) as unknown as Promise<RevenueTrendResponse>;
  },

  create: async (data: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    status?: string;
    managerId?: string;
  }) => {
    return api.post("/affiliates/agents", data) as unknown as Promise<AgentDetailResponse>;
  },

  update: async (
    id: string,
    data: Partial<{
      name: string;
      email: string;
      phone: string;
      status: string;
      managerId: string;
    }>,
  ) => {
    return api.patch(`/affiliates/agents/${id}`, data) as unknown as Promise<AgentDetailResponse>;
  },

  remove: async (id: string) => {
    return api.delete(`/affiliates/agents/${id}`);
  },
};
