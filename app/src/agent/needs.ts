import type { CampaignPhase } from "@/domain/types";
import type { CampaignTab } from "@/router";
import type { Proposal } from "./rules";

/**
 * Presentation rules for the decision queue (docs/information-architecture.md §3–4).
 * Not agent behaviour: the agent decides what to propose, this decides where it shows.
 */

/** What a proposal needs from the campaign manager. "On track" is the absence of any. */
export type Need = "now" | "ready" | "waiting" | "todo";

/** Display order is the key order. */
export const NEED_LABEL: Record<Need, string> = {
  now: "Needs you now",
  ready: "Ready to move",
  waiting: "Waiting on someone",
  todo: "Things to do",
};

/** The one place a proposal is sorted into a need. Change this to regroup Today. */
export function needOf(p: Pick<Proposal, "kind" | "severity">): Need {
  if (p.severity === "critical") return "now";
  switch (p.kind) {
    case "approve-lineup":
    case "state-goal":
      return "now"; // blocked until you decide
    case "review-draft":
    case "boost-post":
    case "info-request": // a quick confirmation the agent has teed up
      return "ready";
    case "quiet-creator":
      return "waiting";
    case "below-forecast":
      return "todo";
    default: {
      // A kind added live without a rule here still shows on Today, never vanishes.
      const unmapped: never = p.kind;
      void unmapped;
      return "todo";
    }
  }
}

export interface NeedGroup<P> {
  need: Need;
  label: string;
  items: P[];
}

/** Groups in display order, empty ones dropped, input order kept within each. */
export function groupByNeed<P extends Pick<Proposal, "kind" | "severity">>(
  proposals: P[],
): NeedGroup<P>[] {
  return (Object.keys(NEED_LABEL) as Need[])
    .map((need) => ({
      need,
      label: NEED_LABEL[need],
      items: proposals.filter((p) => needOf(p) === need),
    }))
    .filter((g) => g.items.length > 0);
}

/**
 * Today's split: need groups for what isn't settled, and the settled ones (Handled today),
 * both in input order. What counts as settled is the caller's choice; Today uses "resolved
 * before this visit", so a card resolved in place keeps its confirmation until you leave.
 */
export function splitToday<P extends Pick<Proposal, "kind" | "severity">>(
  proposals: P[],
  settled: (p: P) => boolean,
): { groups: NeedGroup<P>[]; handled: P[] } {
  return {
    groups: groupByNeed(proposals.filter((p) => !settled(p))),
    handled: proposals.filter(settled),
  };
}

/** Which campaign tab a proposal belongs on. */
export const PROPOSAL_PHASE: Record<Proposal["kind"], CampaignPhase> = {
  "state-goal": "Plan",
  "approve-lineup": "Plan",
  "info-request": "Plan", // about a creator in the proposed lineup
  "quiet-creator": "Make",
  "review-draft": "Make",
  "boost-post": "Run",
  "below-forecast": "Run",
};

/** The campaign tab that shows each phase. */
export const PHASE_TAB = { Plan: "plan", Make: "make", Run: "run" } as const satisfies Record<
  CampaignPhase,
  CampaignTab
>;

/**
 * The tab a card lives on. A card links here, so an urgent card from another
 * phase is one click away without changing which tab a campaign opens on.
 */
export const proposalTab = (p: Pick<Proposal, "kind">): CampaignTab =>
  PHASE_TAB[PROPOSAL_PHASE[p.kind]];
