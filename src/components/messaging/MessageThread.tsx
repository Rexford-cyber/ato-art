"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Message {
  id: string;
  content: string;
  isDeleted: boolean;
  createdAt: string | Date;
  sender: { id: string; name: string; avatarUrl: string | null };
}

interface MessageThreadProps {
  conversationId: string;
  currentUserId: string;
  initialMessages: Message[];
}

export default function MessageThread({ conversationId, currentUserId, initialMessages }: MessageThreadProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const poll = useCallback(async () => {
    try {
      const last = messages[messages.length - 1];
      const cursor = last ? new Date(last.createdAt).toISOString() : undefined;
      const url = `/api/conversations/${conversationId}/messages` + (cursor ? `?after=${cursor}` : "");
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      if (data.messages?.length > 0) {
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const newMsgs = data.messages.filter((m: Message) => !existingIds.has(m.id));
          return newMsgs.length > 0 ? [...prev, ...newMsgs] : prev;
        });
        await fetch(`/api/conversations/${conversationId}/read`, { method: "PATCH" });
      }
    } catch {}
  }, [conversationId, messages]);

  useEffect(() => {
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [poll]);

  async function sendMessage() {
    if (!content.trim()) return;
    setSending(true);
    const res = await fetch(`/api/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: content.trim() }),
    });
    const msg = await res.json();
    setSending(false);

    if (!res.ok) { toast.error("Failed to send"); return; }
    setContent("");
    setMessages((prev) => [...prev, msg]);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((msg) => {
          const isMine = msg.sender.id === currentUserId;
          return (
            <div key={msg.id} className={`flex items-end gap-2 ${isMine ? "flex-row-reverse" : ""}`}>
              {!isMine && (
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarImage src={msg.sender.avatarUrl ?? undefined} />
                  <AvatarFallback className="text-xs">{msg.sender.name[0]}</AvatarFallback>
                </Avatar>
              )}
              <div className={`max-w-[70%] space-y-0.5 ${isMine ? "items-end" : ""} flex flex-col`}>
                <div
                  className={`rounded-2xl px-4 py-2 text-sm ${
                    isMine
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm bg-muted text-foreground"
                  } ${msg.isDeleted ? "italic opacity-60" : ""}`}
                >
                  {msg.isDeleted ? "Message deleted" : msg.content}
                </div>
                <p className="text-xs text-muted-foreground px-1">
                  {format(new Date(msg.createdAt), "h:mm a")}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="mt-4 flex gap-2 items-end border-t pt-4">
        <Textarea
          rows={2}
          className="resize-none"
          placeholder="Type a message… (Enter to send)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={2000}
        />
        <Button
          size="icon"
          disabled={sending || !content.trim()}
          onClick={sendMessage}
          className="shrink-0 h-10 w-10"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground text-right mt-1">{content.length}/2000</p>
    </>
  );
}
