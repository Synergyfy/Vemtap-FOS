export interface AiInsight {
  icon: string;
  text: string;
  type: "positive" | "warning";
}

export interface AiChatResponse {
  answer: string;
  data: { label: string; value: string }[];
}

export interface AiAssistantData {
  insights: AiInsight[];
  predefinedQuestions: string[];
}
