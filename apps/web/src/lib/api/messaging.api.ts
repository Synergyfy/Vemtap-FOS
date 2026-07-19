import api from "./axios";
import type {
  MessagingAggregates,
  SmsLogsResponse,
  EmailLogsResponse,
} from "@/lib/types";

export const messagingApi = {
  getSmsLogs: async (params?: { page?: number; perPage?: number; businessId?: string }) => {
    return api.get("/messaging/sms", { params }) as unknown as Promise<SmsLogsResponse>;
  },

  getEmailLogs: async (params?: { page?: number; perPage?: number; businessId?: string }) => {
    return api.get("/messaging/email", { params }) as unknown as Promise<EmailLogsResponse>;
  },

  getAggregates: async () => {
    return api.get("/messaging/aggregates") as unknown as Promise<MessagingAggregates>;
  },
};
