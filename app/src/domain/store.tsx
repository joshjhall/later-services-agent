import { createContext, type ReactNode, use, useMemo, useRef, useState } from "react";
import type { MessageDraft } from "@/agent/drafts";
import {
  AGENT_POLICY,
  type AgentPolicy,
  autoOption,
  deriveProposals,
  type Proposal,
  withinCap,
  withSpent,
} from "@/agent/rules";
import * as fx from "./fixtures";
import type { ActivityEntry, Actor } from "./types";

/** The signed-in person in the demo; decisions are recorded under this name. */
export const CURRENT_USER = "Maya";

interface Resolution {
  optionId: string;
  label: string;
  at: string;
  /** Who carried it out, when not the person at the keyboard (the agent's auto lane). */
  by?: Actor;
}

/**
 * What the agent has already done on its own: every proposal whose recommendation is in
 * the auto lane (see `autoOption`), resolved and logged under "agent" before anyone looks.
 * The daily cap is per campaign, so spend is totalled per campaign: once the next amount
 * would take the total over the cap, the proposal stays open for a person. A spend with no
 * amount fails closed the same way. Only internal changes and capped spend run unasked:
 * anything that leaves the building (a message, an offer) always waits for a person.
 * The same running total re-lanes each later proposal (`withSpent`), so an option it holds
 * back reads as needing approval, not pre-approved. Render the returned `proposals`.
 */
export function autoRun(
  proposals: Proposal[],
  policy: Pick<AgentPolicy, "maxDailySpend"> = AGENT_POLICY,
) {
  const resolved: Record<string, Resolution> = {};
  const entries: ActivityEntry[] = [];
  const spent: Record<string, number> = {};
  const adjusted: Proposal[] = [];
  for (const raw of proposals) {
    const p = withSpent(raw, spent[raw.campaignId] ?? 0, policy);
    adjusted.push(p);
    const o = autoOption(p);
    if (!o || o.effect === "external") continue;
    if (o.effect === "spend") {
      const total = (spent[p.campaignId] ?? 0) + (o.amount ?? Number.NaN);
      if (!withinCap(total, policy)) continue;
      spent[p.campaignId] = total;
    }
    resolved[p.id] = { optionId: o.id, label: o.label, at: fx.DEMO_TODAY, by: "agent" };
    entries.push({
      id: `act-auto-${p.id}`,
      at: fx.DEMO_TODAY,
      actor: "agent",
      action: `Ran "${o.label}" on its own · within the agent's cap`,
      target: p.title,
      campaignId: p.campaignId,
      effect: o.effect,
    });
  }
  return { resolved, entries, proposals: adjusted };
}

/** The proposal a sent draft answers; `action` as in `resolve`. */
export interface Answers {
  proposal: Proposal;
  optionId: string;
  action?: string;
}

interface Store {
  world: typeof fx;
  proposals: Proposal[];
  /** Keyed by proposal id, so resolving twice is a no-op (framing §6). */
  resolved: Record<string, Resolution>;
  /**
   * Resolve a proposal as `optionId`. `action` names what was decided when it
   * differs from the option the queue card shows (e.g. "Approved lineup" for
   * the "Review lineup" option); it becomes the Activity entry and the label.
   */
  resolve: (p: Proposal, optionId: string, action?: string) => void;
  /** What actually went out, keyed by draft id (the reviewed text, not the agent's). Sending twice is a no-op. */
  sent: Record<string, MessageDraft>;
  /**
   * Send a reviewed draft: one permanent entry from Maya's team. If the draft
   * answers a proposal, that proposal resolves as `optionId` in the same step.
   */
  send: (draft: MessageDraft, answers?: Answers) => void;
  activity: ActivityEntry[];
}

const Ctx = createContext<Store | null>(null);

/**
 * In-memory demo state. Resolutions reset on reload, by design. `policy` exists so a test
 * can render under a different cap; the app always uses AGENT_POLICY.
 */
export function StoreProvider({
  children,
  policy = AGENT_POLICY,
}: {
  children: ReactNode;
  policy?: AgentPolicy;
}) {
  // Derived once per mount: the demo world does not change while it runs. autoRun's copy is
  // what renders, so lanes and the cap row reflect what the agent already spent.
  const [auto] = useState(() =>
    autoRun(deriveProposals(fx, fx.DEMO_TODAY, undefined, policy), policy),
  );
  const proposals = auto.proposals;
  const [resolved, setResolved] = useState<Record<string, Resolution>>(auto.resolved);
  const [sent, setSent] = useState<Record<string, MessageDraft>>({});
  // Mirrors `sent` synchronously, so a double-click within one render still sends once.
  const sentNow = useRef(new Set<string>());
  // Mirrors `resolved` the same way, so two resolves within one render record once.
  const resolvedNow = useRef(new Set(Object.keys(auto.resolved)));
  const [activity, setActivity] = useState(() => [...auto.entries, ...fx.activity]);

  const value = useMemo<Store>(
    () => ({
      world: fx,
      proposals,
      resolved,
      activity,
      resolve: (p, optionId, action) => {
        if (resolvedNow.current.has(p.id)) return; // idempotent
        resolvedNow.current.add(p.id);
        const option = p.options.find((o) => o.id === optionId);
        const label = action ?? option?.label ?? optionId;
        setResolved((r) => ({ ...r, [p.id]: { optionId, label, at: fx.DEMO_TODAY } }));
        setActivity((a) => [
          {
            id: `act-${p.id}`,
            at: fx.DEMO_TODAY,
            actor: CURRENT_USER,
            action: action ?? `Chose "${label}"`,
            target: p.title,
            campaignId: p.campaignId,
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
          const { proposal, optionId, action } = answers;
          resolvedNow.current.add(proposal.id);
          const label =
            action ?? proposal.options.find((o) => o.id === optionId)?.label ?? optionId;
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
            campaignId: answers?.proposal.campaignId ?? draft.campaignId,
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
