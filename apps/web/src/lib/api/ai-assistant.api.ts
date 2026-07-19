import api from "./axios";
import type { AiAssistantData, AiChatResponse } from "@/lib/types";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const formatNaira = (value: number) => {
  if (value >= 1_000_000) return `₦${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `₦${(value / 1_000).toFixed(1)}k`;
  return `₦${value.toLocaleString()}`;
};

const FALLBACK_INSIGHTS: AiAssistantData = {
  insights: [
    { icon: "trending-up", text: "Revenue is growing at 18% month-over-month — above target.", type: "positive" },
    { icon: "trending-down", text: "AI/API costs are rising faster than revenue — monitor closely.", type: "warning" },
    { icon: "alert-triangle", text: "₦500,000 payment is due in 5 days — ensure sufficient cash.", type: "warning" },
    { icon: "check-circle", text: "Cash reserve is healthy at 9 months runway.", type: "positive" },
  ],
  predefinedQuestions: [
    "How much did we spend on marketing last month?",
    "Can we afford to hire a developer?",
    "What is our break-even point?",
    "Which product is most profitable?",
    "Why did expenses increase?",
  ],
};

const SAMPLE_RESPONSES: Record<string, AiChatResponse> = {
  "How much did we spend on marketing last month?": {
    answer: "Based on the expense records, VEMTAP spent approximately ₦450,000 on marketing in the last month. This includes campaigns, advertising, and promotional activities.",
    data: [
      { label: "Marketing Spend", value: formatNaira(450_000) },
      { label: "Previous Month", value: formatNaira(380_000) },
      { label: "Change", value: "+18.4%" },
      { label: "% of Revenue", value: "3.6%" },
    ],
  },
  "Can we afford to hire a developer?": {
    answer: "A new developer at ₦300,000/month would increase your monthly burn rate by 12%. Your current cash runway is estimated at 9 months, which would reduce to approximately 7 months after hiring. Revenue of approximately ₦600,000/month would be needed to cover this cost.",
    data: [
      { label: "Monthly Cost", value: formatNaira(300_000) },
      { label: "Revenue Required", value: formatNaira(600_000) },
      { label: "Runway Impact", value: "-2 months" },
      { label: "Recommendation", value: "Review" },
    ],
  },
  "What is our break-even point?": {
    answer: "Your break-even point requires approximately ₦1.2M in monthly revenue or 240 active customers at an average revenue of ₦5,000 each. You are currently at 78% of break-even.",
    data: [
      { label: "Break-Even Revenue", value: formatNaira(1_200_000) },
      { label: "Current Revenue", value: formatNaira(936_000) },
      { label: "Customers Needed", value: "240" },
      { label: "Progress", value: "78%" },
    ],
  },
  "Which product is most profitable?": {
    answer: "VEMTAP Subscriptions are the most profitable product with a 72% gross margin, contributing ₦2.1M in profit. Messaging follows at 45% margin. QRThrive has the lowest margin at 28% due to provider costs.",
    data: [
      { label: "Subscriptions", value: "72% margin" },
      { label: "Messaging", value: "45% margin" },
      { label: "QRThrive", value: "28% margin" },
      { label: "Hardware", value: "35% margin" },
    ],
  },
  "Why did expenses increase?": {
    answer: "Expenses increased by 15% compared to last month. The main drivers were: 1) Increased API costs due to higher SMS volume (₦80k increase), 2) New marketing campaigns (₦70k increase), and 3) One-time equipment purchase (₦120k).",
    data: [
      { label: "Total Increase", value: formatNaira(270_000) },
      { label: "API Costs", value: formatNaira(80_000) },
      { label: "Marketing", value: formatNaira(70_000) },
      { label: "Equipment", value: formatNaira(120_000) },
    ],
  },
};

export const aiAssistantApi = {
  getInsights: async (): Promise<AiAssistantData> => {
    try {
      return await api.get("/ai-assistant/insights") as unknown as AiAssistantData;
    } catch {
      await delay(300);
      return FALLBACK_INSIGHTS;
    }
  },

  chat: async (query: string): Promise<AiChatResponse> => {
    try {
      return await api.post("/ai-assistant/chat", { query }) as unknown as AiChatResponse;
    } catch {
      await delay(500);
      const match = SAMPLE_RESPONSES[query];
      if (match) return match;
      return {
        answer: "I need to look into that. Please check the relevant section for detailed data, or ask a more specific question.",
        data: [],
      };
    }
  },
};
