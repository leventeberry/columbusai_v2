import { useEffect, useRef, useState } from "react";
import { Bot, Loader2, MessageCircle, Send, Sparkles, User, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CHAT_TITLE, CHAT_WELCOME, CHEXI_AVATAR_URL, getApiBaseUrl } from "@/lib/env";
import { evaluateGuardrails } from "@/lib/guardrails";

type ChatMessage = {
  id: number;
  role: "user" | "assistant" | "system";
  content: string;
};

const FALLBACK_ERROR_MESSAGE = "Sorry, I'm having trouble connecting to the AI.";
const HISTORY_CACHE_KEY = "chatbot-history";
const CONVERSATION_ID_KEY = "chatbot-conversation-id";
const CONVERSATION_TOKEN_KEY = "chatbot-conversation-token";

function chatRequestHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (typeof window === "undefined") return headers;
  const token = sessionStorage.getItem(CONVERSATION_TOKEN_KEY);
  if (token?.trim()) headers["X-Conversation-Token"] = token.trim();
  return headers;
}

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

  const persistConversation = (id: string, token?: string) => {
    setConversationId(id);
    sessionStorage.setItem(CONVERSATION_ID_KEY, id);
    if (token) sessionStorage.setItem(CONVERSATION_TOKEN_KEY, token);
  };

  useEffect(() => {
    const t = setTimeout(() => setShowNudge(true), 1500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = sessionStorage.getItem(CONVERSATION_ID_KEY);
    if (stored?.trim()) setConversationId(stored.trim());
    if (!sessionStorage.getItem(CONVERSATION_TOKEN_KEY)) {
      sessionStorage.removeItem(CONVERSATION_ID_KEY);
      setConversationId(null);
    }
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
          { credentials: "include", headers: chatRequestHeaders() },
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
    setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

    try {
      const res = await fetch(`${apiBase}/api/chat`, {
        method: "POST",
        headers: chatRequestHeaders(),
        credentials: "include",
        body: JSON.stringify({
          message: trimmed,
          conversationId: conversationId ?? undefined,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        conversationId?: string;
        conversationToken?: string;
        text?: string;
        error?: string;
      };

      if (!res.ok) {
        const errMsg = typeof data.error === "string" ? data.error : FALLBACK_ERROR_MESSAGE;
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: errMsg } : m)),
        );
        if (data.conversationId) {
          persistConversation(data.conversationId, data.conversationToken);
        }
        return;
      }

      const text = typeof data.text === "string" ? data.text : FALLBACK_ERROR_MESSAGE;
      setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: text } : m)));
      if (data.conversationId) {
        persistConversation(data.conversationId, data.conversationToken);
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, content: FALLBACK_ERROR_MESSAGE } : m)),
      );
    } finally {
      setIsSending(false);
    }
  };

  const online = !!apiBase;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 font-sans">
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
        <div className="flex h-[min(600px,calc(100vh-6rem))] max-h-[80vh] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border/50 bg-background shadow-2xl animate-in fade-in slide-in-from-bottom-3">
          <div className="flex shrink-0 items-center justify-between bg-primary p-4 text-primary-foreground">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-white/20 p-2 backdrop-blur-sm">
                {CHEXI_AVATAR_URL ? (
                  <img src={CHEXI_AVATAR_URL} alt="" className="h-6 w-6 object-cover" />
                ) : (
                  <Bot className="h-6 w-6" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold leading-tight">{CHAT_TITLE}</h3>
                <div className="flex items-center gap-1.5 text-xs font-medium opacity-90">
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      online ? "animate-pulse bg-green-400" : "bg-primary-foreground/50",
                    )}
                  />
                  {online ? "Online" : "Unavailable"}
                </div>
              </div>
            </div>
            <button
              aria-label="Close chat"
              onClick={() => setOpen(false)}
              className="rounded-lg p-2 text-primary-foreground/80 transition-colors hover:bg-white/20 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 space-y-6 overflow-y-auto bg-slate-50/50 p-4 dark:bg-slate-900/50"
          >
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center space-y-4 p-6 text-center text-muted-foreground">
                <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Sparkles className="h-8 w-8" />
                </div>
                <div>
                  <h4 className="mb-1 font-semibold text-foreground">Welcome!</h4>
                  <p className="text-sm">{CHAT_WELCOME}</p>
                </div>
                {showHistorySync && isHistoryLoading && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Syncing history…</span>
                  </div>
                )}
              </div>
            ) : (
              messages.map((msg) => {
                const isAi = msg.role === "assistant" || msg.role === "system";
                if (isAi && msg.content === "" && isSending) return null;
                return (
                  <div
                    key={msg.id}
                    className={cn("flex w-full gap-3", isAi ? "justify-start" : "justify-end")}
                  >
                    {isAi && (
                      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary">
                        {CHEXI_AVATAR_URL ? (
                          <img
                            src={CHEXI_AVATAR_URL}
                            alt="Chexi AI avatar"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Bot className="h-5 w-5" />
                        )}
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl p-3.5 text-sm shadow-sm",
                        isAi
                          ? "rounded-tl-none border border-border bg-white text-foreground dark:bg-card"
                          : "rounded-tr-none bg-primary text-primary-foreground",
                      )}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    </div>
                    {!isAi && (
                      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-muted-foreground dark:bg-slate-700">
                        <User className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                );
              })
            )}
            {isSending && messages.every((m) => m.content !== "") && (
              <div className="flex justify-start gap-3">
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-none border border-border bg-white p-4 shadow-sm dark:bg-card">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-primary/40 [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-primary/40 [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-primary/40" />
                </div>
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-border bg-background p-4">
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 rounded-xl border border-transparent bg-muted/50 p-1.5 transition-all duration-200 focus-within:border-primary/30 focus-within:bg-background focus-within:shadow-md"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={!online || isSending}
                placeholder={online ? "Type a message..." : "Assistant unavailable..."}
                className="flex-1 bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground/70 outline-none disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Message input"
              />
              <button
                type="submit"
                disabled={!online || !inputValue.trim() || isSending}
                className="rounded-lg bg-primary p-2.5 text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Send"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </form>
            <p className="mt-2 text-center text-[10px] text-muted-foreground">
              Powered by AI • May produce inaccurate information
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
        className={cn(
          "relative flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-colors duration-300 hover:scale-105 active:scale-95",
          open
            ? "bg-muted text-foreground hover:bg-muted/80"
            : "bg-primary text-primary-foreground hover:bg-primary/90",
        )}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-7 w-7" />}
        {!open && online && (
          <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-background" />
        )}
      </button>
    </div>
  );
}
