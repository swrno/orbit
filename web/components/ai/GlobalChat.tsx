"use client";

import { useState } from "react";
import { useTamboThread, useTamboThreadInput } from "@tambo-ai/react";
import { MessageSquare, X, Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function GlobalChat() {
  const [isOpen, setIsOpen] = useState(false);
  const { thread } = useTamboThread();
  const { value, setValue, submit, isPending } = useTamboThreadInput();

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        suppressHydrationWarning
        className={cn(
          "fixed bottom-6 right-6 h-12 w-12 rounded-full bg-accent-primary text-white shadow-lg shadow-blue-500/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-50",
          isOpen && "rotate-90 scale-0 opacity-0"
        )}
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Chat Interface */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 w-[400px] glass-panel-elevated border-l border-border-subtle transform transition-transform duration-300 ease-in-out z-50 flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="h-14 px-4 border-b border-border-subtle flex items-center justify-between bg-surface/50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent-primary" />
            <span className="font-heading font-semibold text-foreground">Tambo Assistant</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            suppressHydrationWarning
            className="p-1 rounded-md text-zinc-500 hover:text-foreground hover:bg-surface-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {thread.messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 p-6">
              <div className="w-12 h-12 rounded-2xl bg-surface-elevated flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-zinc-400" />
              </div>
              <p className="text-sm">How can I help you manage your workspace today?</p>
            </div>
          )}

          {thread.messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex flex-col gap-1 max-w-[90%]",
                message.role === "user" ? "self-end items-end" : "self-start items-start"
              )}
            >
              <div
                className={cn(
                  "px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                  message.role === "user"
                    ? "bg-accent-primary text-white rounded-br-none"
                    : "bg-surface-elevated text-foreground border border-border-subtle rounded-bl-none"
                )}
              >
                {/* Render Text Content */}
                {Array.isArray(message.content) ? (
                  message.content.map((part, i) =>
                    part.type === "text" ? <p key={i}>{part.text}</p> : null
                  )
                ) : (
                  <p>{String(message.content)}</p>
                )}
              </div>

              {/* Render Generative UI Component if present */}
              {message.renderedComponent && (
                <div className="w-full mt-2 rounded-xl overflow-hidden border border-border-subtle bg-surface">
                  {message.renderedComponent}
                </div>
              )}
            </div>
          ))}

          {isPending && (
            <div className="self-start px-4 py-2 bg-surface-elevated rounded-2xl rounded-bl-none text-xs text-zinc-500 flex items-center gap-2 border border-border-subtle">
              <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce delay-75" />
              <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce delay-150" />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-border-subtle bg-surface/50 mt-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            className="relative"
          >
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Message Tambo..."
              suppressHydrationWarning
              className="w-full bg-surface-elevated border border-border-subtle rounded-xl pl-4 pr-12 py-3 text-sm text-foreground placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-accent-primary/50"
            />
            <button
              type="submit"
              disabled={!value.trim() || isPending}
              suppressHydrationWarning
              className="absolute right-2 top-2 p-1.5 rounded-lg bg-accent-primary text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
