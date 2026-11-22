import { SendIcon } from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { InputGroup, InputGroupAddon, InputGroupTextarea } from "@/components/ui/input-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { replyTo } from "./responses";

export type Message = { from: "you" | "agent"; text: string };

/** Ask the scripted agent and return the exchange to append. */
export const exchange = (text: string): Message[] => [
  { from: "you", text },
  { from: "agent", text: replyTo(text) },
];

/**
 * Full-screen conversation (information-architecture.md §1, step 4): messages
 * above, input at the bottom, and a context line naming what it's about.
 */
export function Conversation({
  open,
  onOpenChange,
  context,
  messages,
  onSend,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context: string;
  messages: Message[];
  onSend: (text: string) => void;
}) {
  const [draft, setDraft] = useState("");
  // Keep the latest reply in view once the thread is taller than the screen.
  const end = useRef<HTMLDivElement>(null);
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on each new message
  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);
  const send = (e?: FormEvent) => {
    e?.preventDefault();
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="inset-0 top-0 left-0 flex h-dvh w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none bg-background p-0 ring-0 sm:max-w-none">
        <header className="border-b px-6 py-3 pr-12">
          <DialogTitle>Conversation</DialogTitle>
          <DialogDescription>About: {context}</DialogDescription>
        </header>
        <ScrollArea className="min-h-0 flex-1">
          <ol className="mx-auto flex max-w-2xl flex-col gap-4 px-6 py-6">
            {messages.map((m, i) => (
              // Messages are append-only, so the index is a stable key.
              // biome-ignore lint/suspicious/noArrayIndexKey: append-only list
              <li key={i} className={m.from === "you" ? "self-end" : "self-start"}>
                <p className="mb-1 text-xs text-muted-foreground">
                  {m.from === "you" ? "You" : "Agent · summary in context"}
                </p>
                <p
                  className={
                    m.from === "you"
                      ? "rounded-lg bg-primary px-3 py-2 text-primary-foreground"
                      : "rounded-lg bg-muted px-3 py-2"
                  }
                >
                  {m.text}
                </p>
              </li>
            ))}
          </ol>
          <div ref={end} />
        </ScrollArea>
        <form onSubmit={send} className="mx-auto w-full max-w-2xl px-6 pb-6">
          <InputGroup>
            <InputGroupTextarea
              aria-label="Message"
              placeholder="Ask a follow-up"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                // keyCode 229 covers the IME commit Enter, which Safari fires after composition ends.
                const composing = e.nativeEvent.isComposing || e.keyCode === 229;
                if (e.key !== "Enter" || e.shiftKey || composing) return;
                e.preventDefault(); // send instead of adding a newline
                send();
              }}
            />
            <InputGroupAddon align="block-end">
              <Button type="submit" size="sm" className="ml-auto">
                <SendIcon /> Send
              </Button>
            </InputGroupAddon>
          </InputGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
