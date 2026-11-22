import { createContext, type ReactNode, useContext, useMemo, useState } from "react";
import type { WidgetId } from "@/components/rail/select";
import type { Route } from "@/router";
import { answerTo, onOneCampaign } from "./responses";

/** A widget from the rail library, and the campaigns it is about. */
export type MessageWidget = { id: WidgetId; scope: string[] };
export type Message = { from: "you" | "agent"; text: string; widget?: MessageWidget };

/** What the conversation is about: the page it was asked from, and its context line. */
export type Subject = { route: Route; context: string };
type Chat = Subject & { messages: Message[] };

/** Ask the scripted agent about a page and return the exchange to append. */
export function exchange(text: string, route: Route): Message[] {
  const { text: reply, widget } = answerTo(text, route);
  return [
    { from: "you", text },
    {
      from: "agent",
      text: reply,
      ...(widget && onOneCampaign(route) && { widget: { id: widget, scope: [route.id] } }),
    },
  ];
}

interface ConversationState {
  chat: Chat | null;
  /** Docked in the rail beside the work, rather than full screen. */
  docked: boolean;
  /** The unsent message, kept here so it survives Dock and Expand. */
  draft: string;
  setDraft: (draft: string) => void;
  /** Start a new conversation, full screen, replacing any current one. */
  start: (subject: Subject, question?: string) => void;
  /** Ask a follow-up about `route`: where it started when full screen, the page you're on when docked. */
  send: (text: string, route: Route) => void;
  dock: () => void;
  /** Back to full screen, now about `subject` (the page you're on). */
  expand: (subject: Subject) => void;
  close: () => void;
}

const ConversationContext = createContext<ConversationState | null>(null);

/**
 * One conversation for the whole app (information-architecture.md §1, step 5), so it
 * survives navigation and can move between full screen and the rail.
 */
export function ConversationProvider({ children }: { children: ReactNode }) {
  const [chat, setChat] = useState<Chat | null>(null);
  const [docked, setDocked] = useState(false);
  const [draft, setDraft] = useState("");

  const value = useMemo<ConversationState>(
    () => ({
      chat,
      docked,
      draft,
      setDraft,
      start: (subject, question) => {
        setChat({ ...subject, messages: question ? exchange(question, subject.route) : [] });
        setDocked(false);
        setDraft("");
      },
      send: (text, route) =>
        setChat((c) => c && { ...c, messages: [...c.messages, ...exchange(text, route)] }),
      dock: () => setDocked(true),
      expand: (subject) => {
        setChat((c) => c && { ...c, ...subject });
        setDocked(false);
      },
      close: () => {
        setChat(null);
        setDocked(false);
        setDraft("");
      },
    }),
    [chat, docked, draft],
  );

  return <ConversationContext.Provider value={value}>{children}</ConversationContext.Provider>;
}

export function useConversation(): ConversationState {
  const state = useContext(ConversationContext);
  if (!state) throw new Error("useConversation needs a ConversationProvider");
  return state;
}
