import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Info, MessageCircle, RotateCcw } from "@/components/icons";
import { buildAssistantSnapshot } from "@/components/tokenly/assistant-snapshot";
import type { DateSelection } from "@/components/tokenly/app-shell";
import { useBillingStore } from "@/components/tokenly/billing-store";
import { useLimitsStore } from "@/components/tokenly/limits-store";
import { LogoMark } from "@/components/tokenly/logo";
import { useProjectsStore } from "@/components/tokenly/projects-store";
import { useWorkspace } from "@/components/tokenly/workspace-store";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const suggestions = [
  "How many credits do I have left?",
  "What is driving my spending this period?",
  "Which project is closest to its budget?",
];

export function TokenlyAssistant({ range }: { range: DateSelection }) {
  const [open, setOpen] = useState(false);
  const billing = useBillingStore();
  const projectsState = useProjectsStore();
  const limitsState = useLimitsStore();
  const workspace = useWorkspace();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const snapshot = useMemo(
    () => buildAssistantSnapshot({ range, billing, projectsState, limitsState, workspace }),
    [range, billing, projectsState, limitsState, workspace],
  );
  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/assistant", body: { snapshot } }),
    [snapshot],
  );
  const { messages, sendMessage, status, error, stop, setMessages } = useChat({ transport });
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => textareaRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open, status, messages.length]);

  const send = (text: string) => {
    const clean = text.trim();
    if (!clean || busy) return;
    void sendMessage({ text: clean });
  };
  const reset = () => {
    if (busy) void stop();
    setMessages([]);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        className="fixed bottom-5 right-5 z-40 h-10 px-4 shadow-lg"
        aria-label="Open Tokenly Assistant"
        onClick={() => setOpen(true)}
      >
        <MessageCircle />
        <span>Ask Tokenly</span>
      </Button>
      <SheetContent
        className="flex w-[calc(100vw-0.75rem)] max-w-[calc(100vw-0.75rem)] flex-col gap-0 p-0 sm:w-full sm:max-w-md"
        side="right"
      >
        <SheetHeader className="shrink-0 border-b px-5 py-4 pr-14">
          <div className="flex items-center gap-3">
            <LogoMark className="size-8 rounded-md" />
            <div className="min-w-0 text-left">
              <SheetTitle className="text-base">Tokenly Assistant</SheetTitle>
              <SheetDescription className="mt-0.5 text-xs">
                Ask about credits, spending, projects and billing
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col">
          <Conversation className="min-h-0">
            <ConversationContent className="gap-6 px-5 py-5">
              {messages.length === 0 ? (
                <ConversationEmptyState className="min-h-full px-2">
                  <div className="flex w-full max-w-sm flex-col items-center gap-5">
                    <LogoMark className="size-11 rounded-lg" />
                    <div className="space-y-1.5">
                      <h2 className="text-lg font-semibold">Understand your AI spend</h2>
                      <p className="text-sm leading-6 text-muted-foreground">
                        Get clear answers from the dashboard’s sample data. No chat history is saved.
                      </p>
                    </div>
                    <div className="flex w-full flex-col gap-2">
                      {suggestions.map((suggestion) => (
                        <Button
                          key={suggestion}
                          type="button"
                          variant="outline"
                          className="h-auto min-h-10 w-full whitespace-normal px-3 py-2 text-left text-xs font-normal"
                          onClick={() => send(suggestion)}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                </ConversationEmptyState>
              ) : (
                messages.map((message) => (
                  <Message key={message.id} from={message.role}>
                    <MessageContent className="group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground">
                      {message.parts.map((part, index) => {
                        if (part.type === "text") {
                          return (
                            <MessageResponse key={`${message.id}-text-${index}`}>
                              {part.text}
                            </MessageResponse>
                          );
                        }
                        if (part.type === "reasoning" && part.text) {
                          return (
                            <div
                              key={`${message.id}-reasoning-${index}`}
                              className="border-l-2 pl-3 text-xs text-muted-foreground"
                            >
                              <span className="mb-1 block font-medium">Reasoning summary</span>
                              <MessageResponse>{part.text}</MessageResponse>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </MessageContent>
                  </Message>
                ))
              )}
              {status === "submitted" && (
                <Message from="assistant">
                  <MessageContent>
                    <Shimmer className="text-xs">Checking your dashboard…</Shimmer>
                  </MessageContent>
                </Message>
              )}
              {error && (
                <div role="alert" className="border-l-2 border-critical pl-3 text-sm text-critical">
                  {error.message || "The assistant couldn’t answer. Please try again."}
                </div>
              )}
            </ConversationContent>
            <ConversationScrollButton aria-label="Scroll to latest message" />
          </Conversation>
        </div>

        <div className="shrink-0 border-t bg-background p-3">
          <div className="mb-2 flex items-center justify-between gap-3 px-1">
            <span className="text-[11px] text-muted-foreground">Sample data · Session only</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-[11px] text-muted-foreground"
              disabled={messages.length === 0 && !busy}
              onClick={reset}
            >
              <RotateCcw />
              New conversation
            </Button>
          </div>
          <PromptInput
            onSubmit={(message) => {
              if (message.text.trim()) send(message.text);
            }}
          >
            <PromptInputTextarea
              ref={textareaRef}
              aria-label="Message Tokenly Assistant"
              placeholder="Ask about your dashboard…"
              maxLength={2000}
            />
            <PromptInputFooter className="justify-end">
              <PromptInputSubmit
                status={status}
                onStop={() => void stop()}
                aria-label={busy ? "Stop response" : "Send message"}
              />
            </PromptInputFooter>
          </PromptInput>
          <p className="mt-2 flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
            <Info className="size-3" aria-hidden />
            Answers can be wrong. Check important figures on the page.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
