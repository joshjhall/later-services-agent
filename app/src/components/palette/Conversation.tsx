import { Maximize2Icon, PanelRightIcon, SendIcon, XIcon } from "lucide-react";
import { type FormEvent, useEffect, useRef } from "react";
import { WidgetCard } from "@/components/rail/widgets";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { InputGroup, InputGroupAddon, InputGroupTextarea } from "@/components/ui/input-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { type Message, useConversation } from "./chat";

export type { Message } from "./chat";
export { exchange } from "./chat";

/**
 * The messages and the composer, shared by the full-screen and docked frames.
 * An agent answer can carry a widget from the rail library, rendered live under its text.
 */
function Thread({
  messages,
  onSend,
  compact,
}: {
  messages: Message[];
  onSend: (text: string) => void;
  /** Rail width: tighter padding, no centered column. */
  compact?: boolean;
}) {
  // The draft lives with the conversation, so text typed in one frame is still there after Dock or Expand.
  const { draft, setDraft } = useConversation();
  // Keep the latest reply in view once the thread is taller than its frame.
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
  const column = compact ? "px-1" : "mx-auto max-w-2xl px-6";

  return (
    <>
      <ScrollArea className="min-h-0 flex-1">
        <ol className={cn("flex flex-col gap-4", column, compact ? "py-4" : "py-6")}>
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
              {m.widget && (
                <div className="mt-2 w-full max-w-sm">
                  <WidgetCard id={m.widget.id} scope={m.widget.scope} />
                </div>
              )}
            </li>
          ))}
        </ol>
        <div ref={end} />
      </ScrollArea>
      <form onSubmit={send} className={cn("w-full", column, compact ? "pt-2" : "pb-6")}>
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
    </>
  );
}

type FrameProps = {
  context: string;
  messages: Message[];
  onSend: (text: string) => void;
};

/**
 * Full-screen conversation (information-architecture.md §1, step 4): messages
 * above, input at the bottom, and a context line naming what it's about.
 * Dock moves it into the rail (step 5).
 */
export function Conversation({
  open,
  onOpenChange,
  onDock,
  ...thread
}: FrameProps & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDock?: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="inset-0 top-0 left-0 flex h-dvh w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none bg-background p-0 ring-0 sm:max-w-none">
        <header className="flex items-start gap-4 border-b px-6 py-3 pr-12">
          <div className="grid flex-1 gap-1">
            <DialogTitle>Conversation</DialogTitle>
            <DialogDescription>About: {thread.context}</DialogDescription>
          </div>
          {onDock && (
            <Button variant="ghost" size="sm" onClick={onDock}>
              <PanelRightIcon /> Dock
            </Button>
          )}
        </header>
        <Thread messages={thread.messages} onSend={thread.onSend} />
      </DialogContent>
    </Dialog>
  );
}

/**
 * The same conversation docked in the rail (information-architecture.md §1, step 5),
 * so it continues beside the work. The text entry stays at the bottom of the rail.
 */
export function DockedConversation({
  onExpand,
  onClose,
  ...thread
}: FrameProps & { onExpand: () => void; onClose: () => void }) {
  return (
    <section
      aria-label="Conversation"
      className="sticky top-18 flex h-[calc(100dvh-6rem)] min-h-80 flex-col"
    >
      <header className="flex items-start gap-1 border-b pb-3">
        <div className="grid flex-1 gap-1">
          <h2 className="text-sm font-semibold">Conversation</h2>
          <p className="text-xs text-muted-foreground">About: {thread.context}</p>
        </div>
        <Button variant="ghost" size="icon-sm" aria-label="Expand" onClick={onExpand}>
          <Maximize2Icon />
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="Close" onClick={onClose}>
          <XIcon />
        </Button>
      </header>
      <Thread compact messages={thread.messages} onSend={thread.onSend} />
    </section>
  );
}
