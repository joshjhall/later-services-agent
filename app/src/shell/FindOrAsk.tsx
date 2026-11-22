import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const OPEN = "find-or-ask:open";

/** Open Find or ask from anywhere: the top bar button, ⌘K, `/`, or any future caller. */
export function openFindOrAsk() {
  window.dispatchEvent(new Event(OPEN));
}

const isTyping = (t: EventTarget | null) =>
  t instanceof HTMLElement &&
  (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName));

/** ⌘K / Ctrl+K anywhere, and `/` when focus is not in a text field. */
export function useFindOrAskShortcut() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const commandK = e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey);
      const slash = e.key === "/" && !e.metaKey && !e.ctrlKey && !isTyping(e.target);
      if (!commandK && !slash) return;
      e.preventDefault();
      openFindOrAsk();
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);
}

export function FindOrAskButton() {
  return (
    <Button
      variant="outline"
      className="w-full max-w-sm justify-between text-muted-foreground"
      onClick={openFindOrAsk}
    >
      <span>⌕ Find or ask</span>
      <kbd className="rounded border px-1.5 text-xs">⌘K</kbd>
    </Button>
  );
}

/** Stand-in until the palette lands (#12): proves the entry point and shortcuts are wired. */
export function FindOrAskPlaceholder() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = () => setOpen(true);
    addEventListener(OPEN, on);
    return () => removeEventListener(OPEN, on);
  }, []);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Find or ask</DialogTitle>
          <DialogDescription>
            Coming next: places to go, actions, and a conversation about this page.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
