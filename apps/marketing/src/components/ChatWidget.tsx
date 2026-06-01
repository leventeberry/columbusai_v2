import { useEffect, useRef, useState } from "react";
import { Bot, Loader2, Send, Sparkles, User, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CHAT_TITLE,
  CHAT_WELCOME,
  CHEXI_AVATAR_URL,
  getApiBaseUrl,
} from "@/lib/env";
import { evaluateGuardrails } from "@/lib/guardrails";

type ChatMessage = {
  id: number;
  role: "user" | "assistant" | "system";
  content: string;
};

const FALLBACK_ERROR_MESSAGE =
  "Sorry, I'm having trouble connecting to the AI.";
const HISTORY_CACHE_KEY = "chatbot-history";
const CONVERSATION_ID_KEY = "chatbot-conversation-id";

/**
 * Floating chat widget — Columbus AI ("Chexi AI").
 * Preserves marketing shell styling; wired to apps/api chat endpoints.
 */
export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [showNudge, setShowNudge] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [showHistorySync, setShowHistorySync] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasHydratedHistoryRef = useRef(false);

  const apiBase = getApiBaseUrl();

  useEffect(() => {
    const t = setTimeout(() => setShowNudge(true), 1500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = sessionStorage.getItem(CONVERSATION_ID_KEY);
    if (stored?.trim()) setConversationId(stored.trim());
  }, []);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open, isSending]);

  useEffect(() => {
    if (!open || messages.length > 0 || !conversationId || !apiBase) return;

    const loadHistory = async () => {
      let hadCache = false;
      const cached = sessionStorage.getItem(HISTORY_CACHE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached) as ChatMessage[];
          if (Array.isArray(parsed)) {
            setMessages(parsed);
            hadCache = parsed.length > 0;
          }
        } catch {
          sessionStorage.removeItem(HISTORY_CACHE_KEY);
        }
      }

      if (!hasHydratedHistoryRef.current && !hadCache) {
        setShowHistorySync(true);
      }
      setIsHistoryLoading(true);
      try {
        const res = await fetch(
          `${apiBase}/api/messages?conversationId=${encodeURIComponent(conversationId)}`,
          { credentials: "include" }
        );
        if (!res.ok) throw new Error("Failed to fetch chat history.");
        const data = (await res.json()) as {
          messages: { role: string; content: string }[];
        };
        const list = Array.isArray(data.messages) ? data.messages : [];
        const normalized: ChatMessage[] = list.map((item, index) => ({
          id: index,
          role:
            item.role === "assistant" || item.role === "system"
              ? (item.role as "assistant" | "system")
              : "user",
          content: item.content,
        }));
        setMessages(normalized);
        sessionStorage.setItem(HISTORY_CACHE_KEY, JSON.stringify(normalized));
      } catch {
        setMessages([]);
      } finally {
        setIsHistoryLoading(false);
        setShowHistorySync(false);
        hasHydratedHistoryRef.current = true;
      }
    };

    void loadHistory();
  }, [open, messages.length, conversationId, apiBase]);

  useEffect(() => {
    if (!open || typeof window === "undefined") return;
    sessionStorage.setItem(HISTORY_CACHE_KEY, JSON.stringify(messages));
  }, [open, messages]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed || isSending || !apiBase) return;

    const guardrailDecision = evaluateGuardrails(trimmed);
    const optimisticUserMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      content: trimmed,
    };

    if (guardrailDecision.action !== "allow") {
      setMessages((prev) => [
        ...prev,
        optimisticUserMessage,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: guardrailDecision.message,
        },
      ]);
      setInputValue("");
      return;
    }

    setMessages((prev) => [...prev, optimisticUserMessage]);
    setInputValue("");
    setIsSending(true);

    const assistantId = Date.now() + 1;
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "" },
    ]);

    try {
      const res = await fetch(`${apiBase}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          message: trimmed,
          conversationId: conversationId ?? undefined,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        conversationId?: string;
        text?: string;
        error?: string;
      };

      if (!res.ok) {
        const errMsg =
          typeof data.error === "string" ? data.error : FALLBACK_ERROR_MESSAGE;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: errMsg } : m
          )
        );
        if (data.conversationId) {
          setConversationId(data.conversationId);
          sessionStorage.setItem(CONVERSATION_ID_KEY, data.conversationId);
        }
        return;
      }

      const text =
        typeof data.text === "string" ? data.text : FALLBACK_ERROR_MESSAGE;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, content: text } : m
        )
      );
      if (data.conversationId) {
        setConversationId(data.conversationId);
        sessionStorage.setItem(CONVERSATION_ID_KEY, data.conversationId);
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: FALLBACK_ERROR_MESSAGE }
            : m
        )
      );
    } finally {
      setIsSending(false);
    }
  };

  const online = !!apiBase;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {!open && showNudge && (
        <div className="flex items-center gap-2 rounded-full border border-strong surface-1 pl-3 pr-2 py-2 shadow-lg animate-in fade-in slide-in-from-bottom-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-foreground/10">
            <Bot className="h-3.5 w-3.5 text-foreground" />
          </div>
          <span className="text-xs sm:text-sm text-foreground whitespace-nowrap">
            Need help? Chat with us to learn more
          </span>
          <button
            aria-label="Dismiss"
            onClick={(e) => {
              e.stopPropagation();
              setShowNudge(false);
            }}
            className="ml-1 flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/10"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {open && (
        <div className="w-[min(380px,calc(100vw-2.5rem))] overflow-hidden rounded-2xl border border-strong surface-1 shadow-2xl animate-in fade-in slide-in-from-bottom-3 flex flex-col max-h-[min(600px,calc(100vh-6rem))]">
          <div className="flex items-center justify-between gap-3 bg-foreground/[0.04] border-b border-subtle px-4 py-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground/10 overflow-hidden">
                {CHEXI_AVATAR_URL ? (
                  <img
                    src={CHEXI_AVATAR_URL}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Bot className="h-4.5 w-4.5 text-foreground" />
                )}
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground leading-tight">
                  {CHAT_TITLE}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      online ? "bg-green-400 animate-pulse" : "bg-muted-foreground/60"
                    )}
                  />
                  {online ? "Online" : "Unavailable"}
                </div>
              </div>
            </div>
            <button
              aria-label="Close chat"
              onClick={() => setOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-foreground/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[240px] max-h-[340px] bg-slate-50/50 dark:bg-slate-900/30"
          >
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 px-2 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground/[0.06]">
                  <Sparkles className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">{CHAT_WELCOME}</p>
                {showHistorySync && isHistoryLoading && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Syncing history…</span>
                  </div>
                )}
              </div>
            ) : (
              messages.map((msg) => {
                const isAi =
                  msg.role === "assistant" || msg.role === "system";
                if (isAi && msg.content === "" && isSending) return null;
                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex w-full gap-2",
                      isAi ? "justify-start" : "justify-end"
                    )}
                  >
                    {isAi && (
                      <div className="w-7 h-7 rounded-full bg-foreground/10 flex items-center justify-center shrink-0">
                        <Bot className="h-4 w-4 text-foreground" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
                        isAi
                          ? "bg-white dark:bg-card border border-subtle rounded-tl-none"
                          : "bg-foreground text-background rounded-tr-none"
                      )}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">
                        {msg.content}
                      </p>
                    </div>
                    {!isAi && (
                      <div className="w-7 h-7 rounded-full bg-foreground/10 flex items-center justify-center shrink-0">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                );
              })
            )}
            {isSending && messages.every((m) => m.content !== "") && (
              <div className="flex gap-2 justify-start">
                <div className="w-7 h-7 rounded-full bg-foreground/10 flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="rounded-2xl rounded-tl-none border border-subtle bg-white dark:bg-card px-4 py-3 flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-foreground/30 animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 rounded-full bg-foreground/30 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-foreground/30 animate-bounce" />
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-subtle px-3 py-3 shrink-0">
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 rounded-xl border border-subtle surface-2 px-3 py-2"
            >
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={!online || isSending}
                placeholder={
                  online ? "Type a message…" : "Assistant unavailable…"
                }
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Message input"
              />
              <button
                type="submit"
                disabled={!online || !inputValue.trim() || isSending}
                className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-background disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Send"
              >
                {isSending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
              </button>
            </form>
            <p className="mt-2 text-center text-[10px] text-muted-foreground">
              Powered by AI · May produce inaccurate information
            </p>
          </div>
        </div>
      )}

      <button
        onClick={() => {
          setOpen((o) => !o);
          setShowNudge(false);
        }}
        aria-label={open ? "Close chat" : "Open chat"}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background shadow-xl transition-transform hover:scale-105 active:scale-95"
      >
        {open ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
        {!open && online && (
          <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-background" />
        )}
      </button>
    </div>
  );
}
