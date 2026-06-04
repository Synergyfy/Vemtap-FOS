import { useQuery } from "@tanstack/react-query";
import { messagingApi } from "@/lib/api/messaging.api";

export const messagingKeys = {
  all: ["messaging"] as const,
  sms: (params?: Record<string, unknown>) =>
    [...messagingKeys.all, "sms", params] as const,
  email: (params?: Record<string, unknown>) =>
    [...messagingKeys.all, "email", params] as const,
  aggregates: () => [...messagingKeys.all, "aggregates"] as const,
};

export function useSmsLogs(params?: { page?: number; perPage?: number; businessId?: string }) {
  return useQuery({
    queryKey: messagingKeys.sms(params as Record<string, unknown>),
    queryFn: () => messagingApi.getSmsLogs(params),
    staleTime: 30_000,
  });
}

export function useEmailLogs(params?: { page?: number; perPage?: number; businessId?: string }) {
  return useQuery({
    queryKey: messagingKeys.email(params as Record<string, unknown>),
    queryFn: () => messagingApi.getEmailLogs(params),
    staleTime: 30_000,
  });
}

export function useMessagingAggregates() {
  return useQuery({
    queryKey: messagingKeys.aggregates(),
    queryFn: messagingApi.getAggregates,
    staleTime: 30_000,
  });
}
