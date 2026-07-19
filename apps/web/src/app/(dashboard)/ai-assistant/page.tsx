"use client";

import { useState } from "react";
import {
  Bot,
  Send,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useAiInsights, useAiChat } from "@/lib/hooks/use-ai-assistant";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "trending-up": TrendingUp,
  "trending-down": TrendingDown,
  "alert-triangle": AlertTriangle,
  "check-circle": CheckCircle2,
};

interface Message {
  role: "user" | "assistant";
  content: string;
  data?: { label: string; value: string }[];
}

export default function AiAssistantPage() {
  const [activeTab, setActiveTab] = useState<"ask" | "insights">("ask");
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I'm VEMTAP's Financial AI Assistant. Ask me anything about your finances." },
  ]);

  const { data: aiData, isLoading: insightsLoading, error: insightsError } = useAiInsights();
  const chatMutation = useAiChat();

  const handleSend = () => {
    if (!query.trim() || chatMutation.isPending) return;
    const userMsg: Message = { role: "user", content: query };
    setMessages((prev) => [...prev, userMsg]);
    setQuery("");
    chatMutation.mutate(query, {
      onSuccess: (response) => {
        setMessages((prev) => [...prev, { role: "assistant", content: response.answer, data: response.data }]);
      },
      onError: () => {
        setMessages((prev) => [...prev, {
          role: "assistant",
          content: "I need to look into that. Please check the relevant section for detailed data, or ask a more specific question.",
        }]);
      },
    });
  };

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          <Bot className="w-6 h-6 text-blue-500" /> Ask Finance
        </h1>
        <p className="text-zinc-500">Ask questions about VEMTAP&apos;s finances and get AI-powered answers.</p>
      </div>

      <div className="flex gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        {(["ask", "insights"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab
                ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
            }`}>
            {tab === "ask" ? "Ask Finance" : "Insights"}
          </button>
        ))}
      </div>

      {activeTab === "ask" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col h-[600px]">
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] p-4 rounded-xl ${
                      msg.role === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
                    }`}>
                      {msg.role === "assistant" && (
                        <div className="flex items-center gap-2 mb-2">
                          <Bot className="w-4 h-4 text-blue-500" />
                          <span className="text-xs font-medium text-blue-500">Finance AI</span>
                        </div>
                      )}
                      <p className="text-sm">{msg.content}</p>
                      {msg.data && (
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          {msg.data.map((d) => (
                            <div key={d.label} className="p-2 bg-white/10 dark:bg-black/10 rounded-lg">
                              <p className="text-[10px] opacity-70">{d.label}</p>
                              <p className="text-sm font-semibold">{d.value}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {chatMutation.isPending && (
                  <div className="flex justify-start">
                    <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-xl flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                      <span className="text-sm text-zinc-500">Analyzing...</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="border-t border-zinc-200 dark:border-zinc-800 p-4">
                <div className="flex gap-2">
                  <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask a financial question..."
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <button onClick={handleSend} disabled={!query.trim() || chatMutation.isPending}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {insightsLoading ? (
              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
              </div>
            ) : insightsError ? (
              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
                <p className="text-sm text-red-500">Failed to load questions.</p>
              </div>
            ) : (
              <>
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-3">Try Asking</h3>
                  <div className="space-y-2">
                    {(aiData?.predefinedQuestions ?? []).map((q) => (
                      <button key={q} onClick={() => { setQuery(q); }}
                        className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl border border-blue-200 dark:border-blue-900/50 p-6">
                  <Lightbulb className="w-5 h-5 text-blue-500 mb-2" />
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    The AI uses your actual financial data to provide answers. Responses include the numbers used and date range.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === "insights" && (
        <div className="space-y-4">
          {insightsLoading ? (
            <div className="flex h-48 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
          ) : insightsError ? (
            <div className="flex h-48 items-center justify-center">
              <div className="text-center">
                <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-zinc-500">Failed to load insights. Please try again.</p>
              </div>
            </div>
          ) : (
            (aiData?.insights ?? []).map((insight, i) => {
              const Icon = iconMap[insight.icon] ?? AlertTriangle;
              return (
                <div key={i} className={`p-5 rounded-xl border shadow-sm flex items-start gap-4 ${
                  insight.type === "positive"
                    ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900/50"
                    : "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50"
                }`}>
                  <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${insight.type === "positive" ? "text-green-500" : "text-amber-500"}`} />
                  <p className={`text-sm ${insight.type === "positive" ? "text-green-800 dark:text-green-300" : "text-amber-800 dark:text-amber-300"}`}>
                    {insight.text}
                  </p>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
