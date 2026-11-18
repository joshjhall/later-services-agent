/**
 * The "agent": deterministic rules over the fixtures. It produces the
 * decision queue (proposals that need the CM) and the risk warnings shown on
 * campaign widgets. A real build would put an LLM/orchestrator behind the
 * same `Proposal` contract (framing §5, flows §8).
 *
 * Tunables live in AGENT_POLICY so a live demo change is one edit.
 */
import { DEMO_TODAY } from "@/domain/fixtures";
import type { Campaign, Creator, Deliverable, Partnership } from "@/domain/types";

export const AGENT_POLICY = {
  /** Escalate a quiet creator when go-live is this many days away or fewer. */
  escalateWithinDays: 7,
  /** Days without creator contact before a deliverable counts as "quiet". */
  quietAfterDays: 4,
  /** Reminders the agent sends on its own before escalating. */
  autoReminders: 2,
  /** A KPI below this share of target (time-adjusted) is "below forecast". */
  belowForecastRatio: 0.8,
} as const;

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
  lane: Lane;
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
    | "state-goal";
  severity: Severity;
  campaignId: string;
  title: string;
  summary: string;
  evidence: Evidence[];
  options: Option[];
  confidence: "high" | "medium" | "low";
  dueInDays: number;
}

const day = 86_400_000;
export const daysBetween = (a: string, b: string) =>
  Math.round((Date.parse(b) - Date.parse(a)) / day);

interface World {
  campaigns: Campaign[];
  creators: Creator[];
  partnerships: Partnership[];
  deliverables: Deliverable[];
}

export function deriveProposals(w: World, today = DEMO_TODAY): Proposal[] {
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
      quietFor >= AGENT_POLICY.quietAfterDays &&
      d.remindersSent >= AGENT_POLICY.autoReminders &&
      toGoLive <= AGENT_POLICY.escalateWithinDays
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
          { id: "call", label: `Call ${c.name.split(" ")[0]}`, primary: true, lane: "human" },
          { id: "extend", label: "Extend 2 days", lane: "propose" },
          ...(backupCreator
            ? [
                {
                  id: "swap",
                  label: `Swap to ${backupCreator.name.split(" ")[0]}`,
                  lane: "propose" as const,
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
        title: `Review ${c.name}'s draft`,
        summary: `${d.kind}. Agent's brief check: 6 of 7 requirements met; disclosure placement needs a look.`,
        evidence: [
          { label: "Key message", value: "Met", tone: "good" },
          { label: "Product on screen ≥ 3s", value: "Met", tone: "good" },
          { label: "#ad in first line", value: "Partly: in caption, not on-screen", tone: "bad" },
        ],
        options: [
          { id: "approve", label: "Approve", primary: true, lane: "human" },
          { id: "corrections", label: "Approve with corrections", lane: "human" },
          { id: "needs-work", label: "Needs work", lane: "human" },
        ],
        confidence: "high",
        dueInDays: Math.max(0, daysBetween(today, d.goLive) - 3),
      });
    }

    if (d.stage === "live" && p.whitelisting) {
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
          { label: "Proposed spend", value: "$8,000 of $36,000 reserve", tone: "neutral" },
        ],
        options: [
          { id: "boost", label: "Boost $8,000", primary: true, lane: "propose" },
          { id: "smaller", label: "Boost $4,000", lane: "propose" },
          { id: "skip", label: "Not now", lane: "human" },
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
        options: [{ id: "open", label: "Review goal", primary: true, lane: "human" }],
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
        options: [{ id: "open", label: "Review lineup", primary: true, lane: "human" }],
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
      if (elapsed > 0.25 && k.actual < expected * AGENT_POLICY.belowForecastRatio) {
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
            { id: "plan", label: "See next-wave options", primary: true, lane: "propose" },
            { id: "note", label: "Note for client update", lane: "human" },
          ],
          confidence: "medium",
          dueInDays: 3,
        });
      }
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
