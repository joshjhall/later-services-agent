import { useEffect } from "react";
import { Button } from "@/components/ui/button";

/** Window event that opens the palette (`FindOrAskPalette`). */
export const FIND_OR_ASK_OPEN = "find-or-ask:open";

/** Open Find or ask from anywhere: the top bar button, ⌘K, `/`, or any future caller. */
export function openFindOrAsk() {
  window.dispatchEvent(new Event(FIND_OR_ASK_OPEN));
}

const isTyping = (t: EventTarget | null) =>
  t instanceof HTMLElement &&
  (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName));

/** ⌘K / Ctrl+K anywhere, and `/` when focus is not in a text field. */
export function useFindOrAskShortcut() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Autofill fires keydown without a key; IME composition must pass through.
      if (!e.key || e.isComposing) return;
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
