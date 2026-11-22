/**
 * The "agent": deterministic rules over the fixtures. It produces the
 * decision queue (proposals that need the CM) and the risk warnings shown on
 * campaign widgets. A real build would put an LLM/orchestrator behind the
 * same `Proposal` contract (framing §5, flows §8).
 *
 * Tunables live in AGENT_POLICY so a live demo change is one edit.
 */
import { DEMO_TODAY } from "@/domain/fixtures";
import type { Campaign, Creator, Deliverable, Effect, Partnership } from "@/domain/types";
import { lineupDrafts as defaultLineups, draftFor, type LineupDraft } from "./drafts";

export const AGENT_POLICY = {
  /** Escalate a quiet creator when go-live is this many days away or fewer. */
  escalateWithinDays: 7,
  /** Days without creator contact before a deliverable counts as "quiet". */
  quietAfterDays: 4,
  /** Reminders the agent sends on its own before escalating. */
  autoReminders: 2,
  /** A KPI below this share of target (time-adjusted) is "below forecast". */
  belowForecastRatio: 0.8,
  /** Largest test spend (USD) the agent may run on its own. */
  maxTestSpend: 200,
  /** Most the agent may spend (USD) per campaign per day; anything above needs a person. */
  maxDailySpend: 1000,
} as const;

/** AGENT_POLICY's shape with plain numbers, so a test can pass a different policy. */
export type AgentPolicy = { [K in keyof typeof AGENT_POLICY]: number };

export type Lane = "auto" | "propose" | "human";
export type Severity = "critical" | "warning" | "info";

export interface Evidence {
  label: string;
  value: string;
  tone?: "good" | "bad" | "neutral";
}

export interface Option {
  id: string;
  label: string;
  primary?: boolean;
  /** Short secondary label tying the option to its decision outcome (principles §6), e.g. "Decline unless fixed". */
  hint?: string;
  lane: Lane;
  /** What choosing this option touches; decides undo in the activity record. Required, so undo is never a silent default. */
  effect: Effect;
}

export interface Proposal {
  /** Idempotency key: the same situation always yields the same id (framing §6). */
  id: string;
  kind:
    | "quiet-creator"
    | "review-draft"
    | "boost-post"
    | "below-forecast"
    | "approve-lineup"
    | "state-goal"
    | "info-request";
  severity: Severity;
  campaignId: string;
  title: string;
  summary: string;
  evidence: Evidence[];
  options: Option[];
  confidence: "high" | "medium" | "low";
  dueInDays: number;
  /** Information requests only: what the agent assumed, and what changes if that's wrong. */
  assumption?: string;
  ifWrong?: string;
}

const day = 86_400_000;
export const daysBetween = (a: string, b: string) =>
  Math.round((Date.parse(b) - Date.parse(a)) / day);

const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

/** "a", "a and b", "a, b, and c" (Oxford comma). */
const list = (xs: string[]) =>
  xs.length < 3 ? xs.join(" and ") : `${xs.slice(0, -1).join(", ")}, and ${xs.at(-1)}`;

/**
 * The "Agent cap" evidence row for a boost: the daily cap, then which amounts fit under it.
 * Each amount is compared as if spent in one day, and the row says so: the fixtures carry no
 * boost duration, so a daily rate would be invented. The per-test cap is left out because a
 * boost is not a test. Display only: the cap does not yet change an option's lane.
 * No amounts reads as above the cap.
 */
export function capEvidence(
  amounts: number[],
  policy: Pick<AgentPolicy, "maxDailySpend"> = AGENT_POLICY,
): Evidence {
  // Compare in whole dollars, as displayed, so the row never contradicts itself at the cap.
  const cap = Math.round(policy.maxDailySpend);
  const within = amounts.filter((n) => Math.round(n) <= cap);
  const verdict =
    amounts.length === 0 || within.length === 0
      ? "above it, so it needs you"
      : within.length === amounts.length
        ? "within it"
        : `${list(within.map(usd))} ${within.length === 1 ? "is" : "are"} within it; the rest needs you`;
  return {
    label: "Agent cap",
    value: `${usd(cap)}/day, if spent in one day · ${verdict}`,
    tone: "neutral",
  };
}

interface World {
  campaigns: Campaign[];
  creators: Creator[];
  partnerships: Partnership[];
  deliverables: Deliverable[];
}

export function deriveProposals(
  w: World,
  today = DEMO_TODAY,
  lineups: Record<string, LineupDraft> = defaultLineups,
  policy: AgentPolicy = AGENT_POLICY,
): Proposal[] {
  const creator = (id: string) => w.creators.find((c) => c.id === id);
  const partnership = (id: string) => w.partnerships.find((p) => p.id === id);
  const out: Proposal[] = [];

  for (const d of w.deliverables) {
    const p = partnership(d.partnershipId);
    const c = p && creator(p.creatorId);
    if (!p || !c) continue;
    const toGoLive = daysBetween(today, d.goLive);
    const quietFor = daysBetween(d.lastCreatorContact, today);
    const late = daysBetween(d.draftDue, today);

    // Hard moment: creator quiet, draft late or close, go-live near.
    if (
      d.stage === "drafting" &&
      quietFor >= policy.quietAfterDays &&
      d.remindersSent >= policy.autoReminders &&
      toGoLive <= policy.escalateWithinDays
    ) {
      const backup = w.partnerships.find(
        (b) => b.campaignId === p.campaignId && b.status === "backup",
      );
      const backupCreator = backup && creator(backup.creatorId);
      out.push({
        id: `quiet:${d.id}`,
        kind: "quiet-creator",
        severity: late > 0 ? "critical" : "warning",
        campaignId: p.campaignId,
        title: `${c.name} is quiet${late > 0 ? `, draft ${late} day${late > 1 ? "s" : ""} late` : ""}`,
        summary: `${d.kind} goes live in ${toGoLive} days. ${d.remindersSent} reminders sent, no reply for ${quietFor} days.`,
        evidence: [
          {
            label: "On-time history",
            value: `${Math.round(c.onTimeRate * 100)}%`,
            tone: c.onTimeRate >= 0.85 ? "good" : "bad",
          },
          { label: "Usual reply time", value: `${c.responsiveHours}h`, tone: "neutral" },
          {
            label: "Slack to go-live",
            value: `${toGoLive} days`,
            tone: toGoLive <= 3 ? "bad" : "neutral",
          },
          backupCreator
            ? {
                label: "Approved backup",
                value: `${backupCreator.name} (${Math.round(backupCreator.onTimeRate * 100)}% on time)`,
                tone: "good",
              }
            : { label: "Approved backup", value: "None", tone: "bad" },
        ],
        options: [
          {
            id: "call",
            label: `Call ${c.name.split(" ")[0]}`,
            primary: true,
            lane: "human",
            effect: "external",
          },
          { id: "extend", label: "Extend 2 days", lane: "propose", effect: "external" },
          ...(backupCreator
            ? [
                {
                  id: "swap",
                  label: `Swap to ${backupCreator.name.split(" ")[0]}`,
                  lane: "propose" as const,
                  effect: "external" as const,
                },
              ]
            : []),
        ],
        confidence: c.onTimeRate >= 0.85 ? "medium" : "high",
        dueInDays: Math.max(0, toGoLive - 3),
      });
    }

    if (d.stage === "submitted") {
      out.push({
        id: `review:${d.id}`,
        kind: "review-draft",
        severity: "info",
        campaignId: p.campaignId,
        title: `${c.name}'s draft misses 1 of 7 brief checks`,
        // Exceptions first (framing §7): lead with what failed and a ready
        // fix request; passing checks collapse to one row.
        summary: `${d.kind}. Disclosure is in the caption but not on screen. The agent drafted a fix request for ${c.name.split(" ")[0]}.`,
        evidence: [
          { label: "Disclosure on screen", value: "Not met: caption only", tone: "bad" },
          { label: "Other brief checks", value: "6 of 6 met", tone: "good" },
        ],
        options: [
          {
            id: "send-fix",
            label: "Send fix request",
            hint: "Decline unless fixed",
            primary: true,
            lane: "propose",
            effect: "external",
          },
          {
            id: "corrections",
            label: "Approve with changes",
            lane: "human",
            effect: "external",
          },
          { id: "approve", label: "Approve", lane: "human", effect: "external" },
        ],
        confidence: "high",
        dueInDays: Math.max(0, daysBetween(today, d.goLive) - 3),
      });
    }

    if (d.stage === "live" && p.whitelisting) {
      // One list drives the buttons and the cap row, so a re-price updates both.
      const boosts = [
        { id: "boost", amount: 8000, primary: true },
        { id: "smaller", amount: 4000 },
      ];
      out.push({
        id: `boost:${d.id}`,
        kind: "boost-post",
        severity: "info",
        campaignId: p.campaignId,
        title: `Boost ${c.name}'s post from reserve`,
        summary: "72h engagement is 2.3× the campaign median. Whitelisting is in contract.",
        evidence: [
          { label: "Engagement vs. median", value: "2.3×", tone: "good" },
          { label: "Whitelisting", value: `Yes, ${p.usageRightsDays} days`, tone: "good" },
          {
            label: "Proposed spend",
            value: `${usd(boosts[0].amount)} of $36,000 reserve`,
            tone: "neutral",
          },
          capEvidence(
            boosts.map((b) => b.amount),
            policy,
          ),
        ],
        options: [
          ...boosts.map(
            (b): Option => ({
              id: b.id,
              label: `Boost ${usd(b.amount)}`,
              primary: b.primary,
              lane: "propose",
              effect: "spend",
            }),
          ),
          { id: "skip", label: "Not now", lane: "human", effect: "internal" },
        ],
        confidence: "medium",
        dueInDays: 1,
      });
    }
  }

  for (const cmp of w.campaigns) {
    if (cmp.stage === "goal") {
      out.push({
        id: `goal:${cmp.id}`,
        kind: "state-goal",
        severity: "info",
        campaignId: cmp.id,
        title: `Confirm goal and KPIs for ${cmp.name}`,
        summary:
          "Agent drafted an awareness framework from the client brief. Two questions for the client.",
        evidence: [
          { label: "Objective", value: "Awareness (proposed)", tone: "neutral" },
          { label: "Primary KPI", value: "Reach 25M, video views 8M", tone: "neutral" },
        ],
        options: [
          { id: "open", label: "Review goal", primary: true, lane: "human", effect: "internal" },
        ],
        confidence: "medium",
        dueInDays: 5,
      });
    }
    if (cmp.stage === "lineup") {
      out.push({
        id: `lineup:${cmp.id}`,
        kind: "approve-lineup",
        severity: "warning",
        campaignId: cmp.id,
        title: `Approve proposed lineup for ${cmp.name}`,
        summary:
          "8 creators + 3 backups proposed against the approved criteria. 1 conflict flagged.",
        evidence: [
          { label: "Criteria met", value: "8 of 8 fully, 2 backups partly", tone: "good" },
          { label: "Conflict", value: "1 creator had a competitor deal 60 days ago", tone: "bad" },
          { label: "Forecast", value: "Reach 14–19M vs. 15M target", tone: "neutral" },
        ],
        options: [
          { id: "open", label: "Review lineup", primary: true, lane: "human", effect: "internal" },
        ],
        confidence: "medium",
        dueInDays: 2,
      });
    }
    const elapsed = Math.max(
      0,
      Math.min(1, daysBetween(cmp.start, today) / Math.max(1, daysBetween(cmp.start, cmp.end))),
    );
    for (const k of cmp.kpis) {
      const expected = k.target * elapsed;
      if (elapsed > 0.25 && k.actual < expected * policy.belowForecastRatio) {
        out.push({
          id: `forecast:${cmp.id}:${k.metric}`,
          kind: "below-forecast",
          severity: "warning",
          campaignId: cmp.id,
          title: `${k.metric} pacing below forecast`,
          summary: `At ${Math.round(elapsed * 100)}% of the flight, ${k.metric.toLowerCase()} is at ${Math.round((k.actual / k.target) * 100)}% of target.`,
          evidence: [
            { label: "Expected by now", value: fmt(expected, k.unit), tone: "neutral" },
            { label: "Actual", value: fmt(k.actual, k.unit), tone: "bad" },
          ],
          options: [
            {
              id: "plan",
              label: "Plan next-wave changes",
              primary: true,
              lane: "propose",
              effect: "internal",
            },
            { id: "note", label: "Add to client update", lane: "human", effect: "internal" },
          ],
          confidence: "medium",
          dueInDays: 3,
        });
      }
    }
  }

  // Information requests: a lineup member whose audience split is only self-reported.
  for (const cmp of w.campaigns) {
    if (cmp.stage !== "lineup") continue;
    for (const cand of lineups[cmp.id]?.candidates ?? []) {
      const c = w.creators.find((x) => x.handle === cand.handle);
      if (cand.role !== "core" || c?.audienceSource !== "profile") continue;
      const id = `info:${cmp.id}:${c.id}`;
      // Only ask when there's a drafted email to send; otherwise the option would log a send that never happened.
      if (!draftFor(id, "draft-email")) continue;
      const first = c.name.split(" ")[0];
      out.push({
        id,
        kind: "info-request",
        severity: "info",
        campaignId: cmp.id,
        title: `Confirm ${first}'s audience is mostly US`,
        summary: `${first} is in the proposed lineup at ${cand.forecastReach} forecast reach.`,
        assumption: `I assumed ${first}'s audience is mostly US from the ${c.platform} profile.`,
        ifWrong: "If it's mostly UK, the lineup's reach estimate drops.",
        evidence: [
          { label: "Profile says", value: c.audience, tone: "neutral" },
          { label: "Who can confirm", value: c.representedBy ?? first, tone: "neutral" },
        ],
        options: [
          {
            id: "draft-email",
            label: "Draft the email",
            primary: true,
            lane: "propose",
            effect: "external",
          },
          { id: "confirmed", label: "Mark confirmed", lane: "human", effect: "internal" },
        ],
        confidence: "low",
        dueInDays: 2,
      });
    }
  }

  const rank = { critical: 0, warning: 1, info: 2 };
  return out.sort((a, b) => rank[a.severity] - rank[b.severity] || a.dueInDays - b.dueInDays);
}

export function fmt(n: number, unit: "%" | "$" | "" = "") {
  if (unit === "%") return `${n.toFixed(1)}%`;
  const s =
    n >= 1e6
      ? `${(n / 1e6).toFixed(1)}M`
      : n >= 1e3
        ? `${Math.round(n / 1e3)}K`
        : `${Math.round(n)}`;
  return unit === "$" ? `$${s}` : s;
}
