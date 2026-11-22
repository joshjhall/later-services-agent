import { useEffect } from "react";
import { Button } from "@/components/ui/button";

/** Window event that opens the palette (`FindOrAskPalette`). */
export const FIND_OR_ASK_OPEN = "find-or-ask:open";

/**
 * Open Find or ask from anywhere: the top bar button, ⌘K, `/`, or any future caller.
 * The palette claims the event with `preventDefault`; returns whether it did, so a
 * shortcut only overrides the browser when something actually opened.
 */
export function openFindOrAsk(): boolean {
  return !window.dispatchEvent(new Event(FIND_OR_ASK_OPEN, { cancelable: true }));
}

/** Put focus back on the top bar's Find or ask button, if it's on the page. */
export function focusFindOrAsk() {
  document.querySelector<HTMLElement>("[data-find-or-ask]")?.focus();
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
      // While a full-screen conversation owns the screen nothing opens, so leave the key to the browser.
      if (openFindOrAsk()) e.preventDefault();
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);
}

export function FindOrAskButton() {
  return (
    <Button
      variant="outline"
      data-find-or-ask
      className="w-full max-w-sm justify-between text-muted-foreground"
      onClick={openFindOrAsk}
    >
      <span>⌕ Find or ask</span>
      <kbd className="rounded border px-1.5 text-xs">⌘K</kbd>
    </Button>
  );
}
