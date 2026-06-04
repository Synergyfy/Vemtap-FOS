import api from "./axios";
import type {
  SmsLog,
  EmailLog,
  MessagingAggregates,
  SmsLogsResponse,
  EmailLogsResponse,
} from "@/lib/types";

export const messagingApi = {
  getSmsLogs: async (params?: { page?: number; perPage?: number; businessId?: string }) => {
    return api.get("/messaging/sms", { params }) as Promise<SmsLogsResponse>;
  },

  getEmailLogs: async (params?: { page?: number; perPage?: number; businessId?: string }) => {
    return api.get("/messaging/email", { params }) as Promise<EmailLogsResponse>;
  },

  getAggregates: async () => {
    return api.get("/messaging/aggregates") as Promise<MessagingAggregates>;
  },
};
