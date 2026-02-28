"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/layout/Container";
import { parseJsonOrThrow } from "@/lib/errors";

const STORAGE_KEY = "dev_messages_conversation_id";

type Message = {
  id: string;
  role: string;
  content: string;
  createdAt: string;
};

export default function DevMessagesPage() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setConversationId(stored);
  }, []);

  const fetchMessages = useCallback(
    async (convId: string) => {
      const res = await fetch(
        `/api/messages?conversationId=${encodeURIComponent(convId)}`
      );
      const data = (await parseJsonOrThrow(res)) as { error?: string; messages?: Message[] };
      if (!res.ok) {
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      setMessages(data.messages ?? []);
    },
    []
  );

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }
    localStorage.setItem(STORAGE_KEY, conversationId);
    fetchMessages(conversationId).catch((e) =>
      setError(e instanceof Error ? e.message : "Failed to load messages")
    );
  }, [conversationId, fetchMessages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          ...(conversationId ? { conversationId } : {}),
        }),
      });
      const data = (await parseJsonOrThrow(res)) as {
        error?: string;
        conversationId?: string;
      };
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      const newConvId = data.conversationId;
      if (!newConvId) throw new Error("No conversationId in response");
      if (!conversationId) setConversationId(newConvId);
      setInput("");
      await fetchMessages(newConvId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container maxWidth="2xl" className="px-4 py-8">
      <h1 className="text-2xl font-semibold text-foreground mb-4">
        Dev: Chat (Phase 2)
      </h1>
      <p className="text-muted-foreground text-sm mb-6">
        Send a message to get an AI reply. History persists; refresh to confirm.
      </p>

      {conversationId && (
        <p className="text-muted-foreground text-xs mb-2 font-mono break-all">
          Conversation: {conversationId}
        </p>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
          disabled={loading}
        />
        <Button type="submit" disabled={loading || !input.trim()}>
          {loading ? "Sending…" : "Send"}
        </Button>
      </form>

      <ul className="space-y-3">
        {messages.length === 0 && !loading && (
          <li className="text-muted-foreground text-sm">
            No messages yet. Send one above.
          </li>
        )}
        {messages.map((m) => (
          <li key={m.id}>
            <Card>
              <CardContent className="py-3 text-sm">
                <span className="font-medium text-muted-foreground">{m.role}: </span>
                <span className="text-foreground">{m.content}</span>
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date(m.createdAt).toISOString()}
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </Container>
  );
}
