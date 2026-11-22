/**
 * Domain model for the prototype. Mirrors docs/discovery/framing.md §2:
 * Pod → Account → Campaign → Partnership (creator × campaign) → Deliverable.
 * All data is fictional (see docs/assumptions.md).
 */

export type ISODate = string; // YYYY-MM-DD, relative to DEMO_TODAY

export type Objective = "awareness" | "consideration" | "conversion";

export interface Kpi {
  metric: string; // e.g. "Impressions", "Engagement rate"
  target: number;
  actual: number;
  unit?: "%" | "$" | "";
}

/** Share of target reached, 0–100, for a progress bar. A target of 0 has nothing to pace against. */
export const kpiPct = (k: Pick<Kpi, "target" | "actual">): number =>
  k.target > 0 ? Math.min(100, (k.actual / k.target) * 100) : 0;

export interface Account {
  id: string;
  name: string;
  industry: string;
  contact: string;
}

export interface Campaign {
  id: string;
  accountId: string;
  name: string;
  objective: Objective;
  kpis: Kpi[];
  budget: number;
  committed: number; // creator fees under contract
  reserve: number; // paid amplification reserve remaining
  start: ISODate;
  end: ISODate;
  stage: "goal" | "lineup" | "production" | "live" | "wrap";
}

/** The deck's three campaign phases (docs/information-architecture.md, "Plan → Make → Run"). */
export type CampaignPhase = "Plan" | "Make" | "Run";

export const CAMPAIGN_PHASE: Record<Campaign["stage"], CampaignPhase> = {
  goal: "Plan",
  lineup: "Plan",
  production: "Make",
  live: "Run",
  wrap: "Run",
};

export const campaignPhase = (c: Pick<Campaign, "stage">): CampaignPhase => CAMPAIGN_PHASE[c.stage];

export interface Creator {
  id: string;
  name: string;
  handle: string;
  platform: "TikTok" | "Instagram" | "YouTube";
  tier: "nano" | "micro" | "mid" | "macro";
  followers: number;
  audience: string; // one-line audience summary
  verticals: string[];
  onTimeRate: number; // 0..1, from past campaigns (agent-maintained)
  avgRevisions: number;
  responsiveHours: number; // median reply time
  rate: number;
  representedBy?: string; // talent manager
  /** Where the audience split came from. "profile" means self-reported and unconfirmed. */
  audienceSource?: "verified" | "profile";
}

/** Later Influence draft-review states, plus the stages around them. */
export type DeliverableStage =
  | "briefed"
  | "drafting"
  | "submitted"
  | "in-review"
  | "revisions"
  | "approved"
  | "live"
  | "verified"
  | "paid";

export interface Deliverable {
  id: string;
  partnershipId: string;
  kind: string; // "TikTok video", "IG Story ×2"
  stage: DeliverableStage;
  draftDue: ISODate;
  goLive: ISODate;
  lastCreatorContact: ISODate;
  remindersSent: number;
}

export interface Partnership {
  id: string;
  campaignId: string;
  creatorId: string;
  fee: number;
  whitelisting: boolean;
  usageRightsDays: number;
  status: "proposed" | "backup" | "confirmed" | "replaced";
}

/** Who wrote an entry: the rules engine, the agent, or a named person. */
export type Actor = "system" | "agent" | (string & {});

/**
 * What an action touched. internal: reversible inside the tool. external: sent to a
 * creator or client. spend: money committed. Only internal actions can be undone.
 */
export type Effect = "internal" | "external" | "spend";

/** One record, any actor (principles §2): every entry names who did it and what it touched. */
export interface ActivityEntry {
  id: string;
  at: ISODate;
  actor: Actor;
  action: string;
  target: string;
  effect: Effect;
  /** The campaign it is about. When set, the rail scopes by id alone, never by name. */
  campaignId?: string;
}

/** What has happened outside the system is permanent; a correction is a new action. */
export const isUndoable = (e: Pick<ActivityEntry, "effect">): boolean => e.effect === "internal";

/** A message the agent has queued to go out on a date. Same shape as a reviewable draft. */
export interface ScheduledMessage {
  id: string;
  campaignId: string;
  sendAt: ISODate;
  kind: "creator brief" | "client email";
  to: string;
  target: string;
  subject: string;
  body: string;
}

/** One campaign's result next to similar past campaigns on the same metric. */
export interface Comparison {
  campaignId: string;
  metric: string;
  unit?: Kpi["unit"];
  value: number;
  peers: { name: string; value: number }[];
}

/** What to compare against when there are no similar campaigns yet. */
export interface Benchmark {
  metric: string;
  unit?: Kpi["unit"];
  value: number;
}
