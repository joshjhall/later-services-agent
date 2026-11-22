import { ArrowRightIcon, MessageSquareIcon, ZapIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Command,
  CommandDialog,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useStore } from "@/domain/store";
import { href, type Route } from "@/router";
import { FIND_OR_ASK_OPEN } from "@/shell/FindOrAsk";
import { Conversation, exchange, type Message } from "./Conversation";
import { buildItems, contextLine, filterItems, type PaletteItem, subjectFor } from "./items";

type Chat = { route: Route; context: string; messages: Message[] };

/**
 * Find or ask (information-architecture.md §1): places to go and actions while you
 * type, and always "Start a conversation", which is all that's left once nothing
 * else matches. Filtering is ours (`shouldFilter={false}`), so the conversation
 * option can never be filtered out.
 */
export function FindOrAskPalette({ route }: { route: Route }) {
  const { world } = useStore();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  // Captured when the conversation starts, so its subject and context line stay fixed
  // even if the route changes underneath it (for example through browser Back).
  const [chat, setChat] = useState<Chat | null>(null);

  // While a conversation is open it owns the screen: ⌘K and `/` don't stack the palette on top.
  const inConversation = chat !== null;
  useEffect(() => {
    if (inConversation) return;
    const on = () => setOpen(true);
    addEventListener(FIND_OR_ASK_OPEN, on);
    return () => removeEventListener(FIND_OR_ASK_OPEN, on);
  }, [inConversation]);

  const items = useMemo(() => buildItems(world), [world]);
  const matches = filterItems(items, query);
  const subject = subjectFor(route, world);

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  const choose = (item: PaletteItem) => {
    close();
    if (item.route) location.hash = href(item.route);
    if (item.toast) toast(item.toast);
  };

  const startConversation = () => {
    const text = query.trim();
    close();
    setChat({
      route,
      context: contextLine(route, world),
      messages: text ? exchange(text, route) : [],
    });
  };

  return (
    <>
      <CommandDialog
        open={open}
        onOpenChange={(o) => (o ? setOpen(true) : close())}
        title="Find or ask"
        description="Go somewhere, do something, or start a conversation about this page."
      >
        <Command shouldFilter={false}>
          <CommandInput placeholder="Find or ask…" value={query} onValueChange={setQuery} />
          <CommandList>
            {(["Go to", "Do"] as const).map((group) => {
              const inGroup = matches.filter((i) => i.group === group);
              if (inGroup.length === 0) return null;
              return (
                <CommandGroup key={group} heading={group}>
                  {inGroup.map((item) => (
                    <CommandItem key={item.id} value={item.id} onSelect={() => choose(item)}>
                      {group === "Go to" ? <ArrowRightIcon /> : <ZapIcon />}
                      {item.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              );
            })}
            {matches.length > 0 && <CommandSeparator />}
            <CommandGroup heading="Ask">
              <CommandItem value="start-conversation" onSelect={startConversation}>
                <MessageSquareIcon />
                Start a conversation about {subject}
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
      {/* Mounted only while open, so each conversation starts with an empty draft. */}
      {chat && (
        <Conversation
          open
          onOpenChange={(o) => !o && setChat(null)}
          context={chat.context}
          messages={chat.messages}
          onSend={(text) =>
            setChat((c) => c && { ...c, messages: [...c.messages, ...exchange(text, c.route)] })
          }
        />
      )}
    </>
  );
}
