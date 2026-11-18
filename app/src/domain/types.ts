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

/** What the agent did on its own: logged and undoable (framing §5). */
export interface AgentLogEntry {
  id: string;
  at: ISODate;
  action: string;
  target: string;
  undoable: boolean;
}
