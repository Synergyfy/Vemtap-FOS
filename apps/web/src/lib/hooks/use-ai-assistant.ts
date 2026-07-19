import { useQuery, useMutation } from "@tanstack/react-query";
import { aiAssistantApi } from "@/lib/api/ai-assistant.api";

export const aiAssistantKeys = {
  all: ["ai-assistant"] as const,
  insights: () => [...aiAssistantKeys.all, "insights"] as const,
};

export function useAiInsights() {
  return useQuery({
    queryKey: aiAssistantKeys.insights(),
    queryFn: aiAssistantApi.getInsights,
    staleTime: 60_000,
  });
}

export function useAiChat() {
  return useMutation({
    mutationFn: aiAssistantApi.chat,
  });
}
