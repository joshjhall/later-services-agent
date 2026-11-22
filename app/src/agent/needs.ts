import type { CampaignPhase } from "@/domain/types";
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
      return "ready";
    case "quiet-creator":
      return "waiting";
    case "below-forecast":
      return "todo";
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

/** Which campaign tab a proposal belongs on. */
export const PROPOSAL_PHASE: Record<Proposal["kind"], CampaignPhase> = {
  "state-goal": "Plan",
  "approve-lineup": "Plan",
  "quiet-creator": "Make",
  "review-draft": "Make",
  "boost-post": "Run",
  "below-forecast": "Run",
};
