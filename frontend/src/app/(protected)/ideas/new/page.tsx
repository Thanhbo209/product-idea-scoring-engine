"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Sparkles, RotateCcw, Tag, ChevronDown } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

type Role = "user" | "assistant";

interface Message {
  id: string;
  role: Role;
  content: string;
  scores?: {
    clarity: number;
    market: number;
    risk: number;
    total: number;
  };
}

const SUGGESTIONS = [
  "Một app giúp freelancer quản lý hóa đơn tự động",
  "Platform kết nối mentors với sinh viên đại học",
  "SaaS theo dõi chi phí cho nhà hàng nhỏ",
];

function ScoreBadge({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-muted-foreground w-16">{label}</span>
      <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${value * 10}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-foreground w-6 text-right">
        {value.toFixed(1)}
      </span>
    </div>
  );
}

function AssistantMessage({ msg }: { msg: Message }) {
  return (
    <div className="flex gap-3 group">
      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
        <Sparkles size={13} className="text-primary" />
      </div>
      <div className="flex-1 space-y-3 min-w-0">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap m-0">
            {msg.content}
          </p>
        </div>
        {msg.scores && (
          <div className="bg-card border border-border rounded-xl p-4 space-y-2.5 max-w-sm">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Validation scores
            </p>
            <ScoreBadge
              label="Clarity"
              value={msg.scores.clarity}
              color="bg-blue-500"
            />
            <ScoreBadge
              label="Market fit"
              value={msg.scores.market}
              color="bg-violet-500"
            />
            <ScoreBadge
              label="Risk"
              value={msg.scores.risk}
              color="bg-amber-500"
            />
            <div className="pt-2 mt-1 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Total</span>
              <span className="text-base font-semibold text-foreground">
                {msg.scores.total.toFixed(1)} / 10
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function UserMessage({ msg }: { msg: Message }) {
  return (
    <div className="flex gap-3 justify-end">
      <div
        className="max-w-[75%] bg-primary text-primary-foreground rounded-2xl rounded-tr-sm
                      px-4 py-2.5 text-sm leading-relaxed"
      >
        {msg.content}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <Sparkles size={13} className="text-primary" />
      </div>
      <div className="flex items-center gap-1 py-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

export default function IdeaChatPage() {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [ideaTitle, setIdeaTitle] = useState("");
  const [showTitleInput, setShowTitleInput] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isNew = messages.length === 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }, [input]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;
      const content = text.trim();
      setInput("");

      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        content,
      };
      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);

      // TODO: Replace with real API call to Spring Boot backend
      await new Promise((r) => setTimeout(r, 1400));

      const isFirstMessage = messages.length === 0;
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: isFirstMessage
          ? `Ý tưởng thú vị! Tôi đã phân tích và đây là kết quả validation ban đầu.\n\nĐiểm mạnh: Ý tưởng có định hướng rõ ràng và giải quyết một pain point thực tế. Market fit khá tốt với nhu cầu đang tăng trong segment này.\n\nCần cải thiện: Phần monetization chưa cụ thể. Hãy thử mô tả rõ hơn bạn sẽ thu tiền từ đâu — subscription, commission hay freemium?`
          : `Cảm ơn bạn đã bổ sung thêm thông tin. Dựa trên chi tiết mới, ý tưởng của bạn đã rõ ràng hơn đáng kể. Hãy tiếp tục phát triển phần target users — ai cụ thể sẽ trả tiền cho sản phẩm này?`,
        scores: isFirstMessage
          ? { clarity: 7.2, market: 6.8, risk: 5.5, total: 6.5 }
          : undefined,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setLoading(false);
    },
    [loading, messages.length],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setIdeaTitle("");
    setInput("");
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Top bar */}
      <div
        className="h-14 shrink-0 flex items-center justify-between px-5
                      border-b border-border bg-background/80 backdrop-blur-sm"
      >
        <div className="flex items-center gap-3">
          {messages.length > 0 ? (
            <button
              onClick={() => setShowTitleInput((v) => !v)}
              className="flex items-center gap-1.5 text-sm font-medium text-foreground
                         hover:text-primary transition-colors"
            >
              {ideaTitle || "Untitled idea"}
              <ChevronDown size={13} className="text-muted-foreground" />
            </button>
          ) : (
            <span className="text-sm font-medium text-muted-foreground">
              New idea
            </span>
          )}
          {showTitleInput && (
            <input
              autoFocus
              value={ideaTitle}
              onChange={(e) => setIdeaTitle(e.target.value)}
              onBlur={() => setShowTitleInput(false)}
              onKeyDown={(e) => e.key === "Enter" && setShowTitleInput(false)}
              placeholder="Name this idea..."
              className="text-sm border-b border-primary bg-transparent focus:outline-none
                         text-foreground placeholder:text-muted-foreground px-1 w-48"
            />
          )}
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <>
              <button
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs
                           font-medium border border-border text-muted-foreground
                           hover:text-foreground hover:bg-accent transition-colors"
              >
                <Tag size={12} />
                Add tag
              </button>
              <button
                onClick={handleReset}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground
                           hover:bg-accent transition-colors"
                title="New conversation"
              >
                <RotateCcw size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        {isNew ? (
          /* Welcome screen */
          <div className="flex flex-col items-center justify-center min-h-full px-4 py-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
              <Sparkles size={22} className="text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              Describe your idea
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm">
              Tell me about your product idea and I&apos;ll validate market fit,
              clarity and risk in seconds.
            </p>

            {/* Suggestion chips */}
            <div className="mt-8 flex flex-col gap-2 w-full max-w-md">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-left px-4 py-3 rounded-xl border border-border bg-card
                             text-sm text-muted-foreground hover:text-foreground
                             hover:border-primary/40 hover:bg-accent transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
            {messages.map((msg) =>
              msg.role === "user" ? (
                <UserMessage key={msg.id} msg={msg} />
              ) : (
                <AssistantMessage key={msg.id} msg={msg} />
              ),
            )}
            {loading && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="shrink-0 px-4 pb-5 pt-2 bg-background">
        <div className="max-w-2xl mx-auto">
          <div
            className="flex items-end gap-2 bg-card border border-border rounded-2xl
                          px-4 py-3 focus-within:border-primary/50 focus-within:ring-2
                          focus-within:ring-primary/10 transition-all"
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isNew
                  ? "Describe your idea... (Enter to send, Shift+Enter for new line)"
                  : "Continue the conversation..."
              }
              rows={1}
              className="flex-1 bg-transparent text-sm text-foreground resize-none
                         placeholder:text-muted-foreground focus:outline-none
                         leading-relaxed py-0.5"
              style={{ minHeight: "24px", maxHeight: "160px" }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="w-8 h-8 rounded-xl bg-primary text-primary-foreground
                         flex items-center justify-center shrink-0
                         hover:bg-primary/90 transition-colors
                         disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Send size={14} />
            </button>
          </div>
          <p className="text-center text-[11px] text-muted-foreground/50 mt-2">
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
