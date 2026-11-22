import { createContext, type ReactNode, use, useMemo, useRef, useState } from "react";
import type { MessageDraft } from "@/agent/drafts";
import { deriveProposals, type Proposal } from "@/agent/rules";
import * as fx from "./fixtures";
import type { ActivityEntry } from "./types";

/** The signed-in person in the demo; decisions are recorded under this name. */
export const CURRENT_USER = "Maya";

interface Resolution {
  optionId: string;
  label: string;
  at: string;
}

interface Store {
  world: typeof fx;
  proposals: Proposal[];
  /** Keyed by proposal id, so resolving twice is a no-op (framing §6). */
  resolved: Record<string, Resolution>;
  resolve: (p: Proposal, optionId: string) => void;
  /** What actually went out, keyed by draft id (the reviewed text, not the agent's). Sending twice is a no-op. */
  sent: Record<string, MessageDraft>;
  /**
   * Send a reviewed draft: one permanent entry from Maya's team. If the draft
   * answers a proposal, that proposal resolves as `optionId` in the same step.
   */
  send: (draft: MessageDraft, answers?: { proposal: Proposal; optionId: string }) => void;
  activity: ActivityEntry[];
}

const Ctx = createContext<Store | null>(null);

/** In-memory demo state. Resolutions reset on reload, by design. */
export function StoreProvider({ children }: { children: ReactNode }) {
  const [resolved, setResolved] = useState<Record<string, Resolution>>({});
  const [sent, setSent] = useState<Record<string, MessageDraft>>({});
  // Mirrors `sent` synchronously, so a double-click within one render still sends once.
  const sentNow = useRef(new Set<string>());
  const [activity, setActivity] = useState(fx.activity);
  const proposals = useMemo(() => deriveProposals(fx), []);

  const value = useMemo<Store>(
    () => ({
      world: fx,
      proposals,
      resolved,
      activity,
      resolve: (p, optionId) => {
        if (resolved[p.id]) return; // idempotent
        const option = p.options.find((o) => o.id === optionId);
        const label = option?.label ?? optionId;
        setResolved((r) => ({ ...r, [p.id]: { optionId, label, at: fx.DEMO_TODAY } }));
        setActivity((a) => [
          {
            id: `act-${p.id}`,
            at: fx.DEMO_TODAY,
            actor: CURRENT_USER,
            action: `Chose "${label}"`,
            target: p.title,
            // An unknown option is treated as permanent: undo is opt-in, never a default.
            effect: option?.effect ?? "external",
          },
          ...a,
        ]);
      },
      sent,
      send: (draft, answers) => {
        if (sentNow.current.has(draft.id)) return; // idempotent
        sentNow.current.add(draft.id);
        setSent((s) => ({ ...s, [draft.id]: draft }));
        if (answers) {
          const { proposal, optionId } = answers;
          const label = proposal.options.find((o) => o.id === optionId)?.label ?? optionId;
          // Checked inside the updater, so an earlier decision always stands.
          setResolved((r) =>
            r[proposal.id] ? r : { ...r, [proposal.id]: { optionId, label, at: fx.DEMO_TODAY } },
          );
        }
        setActivity((a) => [
          {
            id: `act-sent-${draft.id}`,
            at: fx.DEMO_TODAY,
            actor: CURRENT_USER,
            action: `Sent ${draft.kind} to ${draft.to} · from ${CURRENT_USER}'s team`,
            target: draft.target,
            // It left the system: permanent, and a correction is a new message.
            effect: "external",
          },
          ...a,
        ]);
      },
    }),
    [proposals, resolved, sent, activity],
  );
  return <Ctx value={value}>{children}</Ctx>;
}

export function useStore(): Store {
  const s = use(Ctx);
  if (!s) throw new Error("useStore must be used inside <StoreProvider>");
  return s;
}
