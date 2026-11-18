/**
 * Agent outputs for the two "prepare a decision" flows: the goal/KPI draft
 * (flows §2) and the proposed lineup (flows §4). Deterministic stand-ins for
 * what an LLM would produce from the brief and the roster.
 */
import type { Objective } from "@/domain/types";

export interface GoalDraft {
  campaignId: string;
  source: string; // what the agent read
  extracted: { label: string; value: string }[];
  objective: { proposed: Objective; why: string };
  kpis: { metric: string; target: string; benchmark: string; method: string }[];
  questions: string[];
}

export const goalDrafts: Record<string, GoalDraft> = {
  "cmp-spring-serum": {
    campaignId: "cmp-spring-serum",
    source: "Client brief (PDF, 4 pages) + kickoff call notes, Nov 12",
    extracted: [
      { label: "Product", value: "Lumen Spring Serum, launching Feb 1" },
      { label: "Audience", value: "US women 22–35, skincare-curious, not yet Lumen buyers" },
      { label: "Markets", value: "US only (CA excluded for this flight)" },
      { label: "Timing", value: "Feb 1 – Mar 15; hero content live by Feb 8" },
      { label: "Budget", value: "$150,000 total; brand expects ~20% held for paid" },
    ],
    objective: {
      proposed: "awareness",
      why: "The brief says “introduce the serum to people who don't know Lumen” and sets no sales target. Awareness fits; conversion can be a secondary read via the landing page.",
    },
    kpis: [
      {
        metric: "Reach",
        target: "25M",
        benchmark: "18–30M for $120K creator spend in beauty (Later 2025 report)",
        method: "Platform-reported, deduplicated estimate",
      },
      {
        metric: "Video views",
        target: "8M",
        benchmark: "~0.3× reach for TikTok-heavy mixes",
        method: "3-second views",
      },
      {
        metric: "Engagement rate",
        target: "4.0%",
        benchmark: "Micro beauty median 3.6%",
        method: "Engagements ÷ reach",
      },
    ],
    questions: [
      "Is Canada really out? Two shortlisted creators have 30%+ Canadian audiences.",
      "Does “awareness” need a brand-lift study, or are platform metrics enough for the wrap report?",
    ],
  },
};

export type Fit = "met" | "partly" | "not";

export interface LineupCandidate {
  creatorName: string;
  handle: string;
  platform: string;
  tier: string;
  role: "core" | "backup";
  fee: number;
  forecastReach: string;
  fromRoster: boolean;
  criteria: { label: string; fit: Fit; note: string }[];
  flag?: string;
}

export interface LineupDraft {
  campaignId: string;
  criteria: string[];
  budget: { creatorFees: number; reserve: number };
  forecast: string;
  candidates: LineupCandidate[];
}

const C = (
  audience: Fit,
  vertical: Fit,
  safety: Fit,
  reliability: Fit,
  notes: [string, string, string, string],
) => [
  { label: "Audience", fit: audience, note: notes[0] },
  { label: "Vertical", fit: vertical, note: notes[1] },
  { label: "Brand safety", fit: safety, note: notes[2] },
  { label: "Reliability", fit: reliability, note: notes[3] },
];

export const lineupDrafts: Record<string, LineupDraft> = {
  "cmp-holiday-gifting": {
    campaignId: "cmp-holiday-gifting",
    criteria: [
      "US 21–40",
      "Hosting, food or gifting content",
      "No alcohol-competitor deal in 90 days",
      "≥ 85% on time",
    ],
    budget: { creatorFees: 72_000, reserve: 18_000 },
    forecast: "Reach 14–19M vs. 15M target",
    candidates: [
      {
        creatorName: "Rio Castillo",
        handle: "@riocooks",
        platform: "Instagram",
        tier: "micro",
        role: "core",
        fee: 5_000,
        forecastReach: "1.1M",
        fromRoster: true,
        criteria: C("met", "met", "met", "met", [
          "US 18–34, 62% women",
          "Quick recipes",
          "Clean scan, 120 posts",
          "97% on time (12 of 12 + 1 early)",
        ]),
      },
      {
        creatorName: "Ana Reyes",
        handle: "@anamakesthings",
        platform: "TikTok",
        tier: "mid",
        role: "core",
        fee: 14_000,
        forecastReach: "3.2M",
        fromRoster: true,
        criteria: C("met", "met", "met", "partly", [
          "US 18–29, 68% women",
          "Food and hosting",
          "Clean scan",
          "90% on time; currently late on Sparkling Citrus",
        ]),
        flag: "Currently 1 day late on another Brightside deliverable. Worth confirming capacity.",
      },
      {
        creatorName: "Ben Okafor",
        handle: "@benpours",
        platform: "TikTok",
        tier: "micro",
        role: "core",
        fee: 6_500,
        forecastReach: "1.4M",
        fromRoster: true,
        criteria: C("met", "met", "met", "met", [
          "US 21–34",
          "Mixology",
          "Clean scan",
          "95% on time",
        ]),
      },
      {
        creatorName: "Hana Sato",
        handle: "@hanahosts",
        platform: "Instagram",
        tier: "mid",
        role: "core",
        fee: 12_000,
        forecastReach: "2.6M",
        fromRoster: false,
        criteria: C("met", "met", "partly", "partly", [
          "US 25–40, 71% women",
          "Hosting and tablescapes",
          "One 2024 post flagged for profanity; reviewed, low risk",
          "No history with us; 2 references",
        ]),
      },
      {
        creatorName: "Theo Grant",
        handle: "@theogifts",
        platform: "YouTube",
        tier: "mid",
        role: "core",
        fee: 16_000,
        forecastReach: "2.9M",
        fromRoster: false,
        criteria: C("met", "met", "not", "met", [
          "US 25–44",
          "Gift guides",
          "Partnered with a competing sparkling brand 60 days ago",
          "On time per 3 agency references",
        ]),
        flag: "Competitor conflict: exclusivity window may still apply. Check before outreach.",
      },
      {
        creatorName: "Mia Chen",
        handle: "@miamakes",
        platform: "TikTok",
        tier: "micro",
        role: "backup",
        fee: 4_500,
        forecastReach: "0.9M",
        fromRoster: true,
        criteria: C("met", "partly", "met", "met", [
          "US 18–29",
          "DIY gifts, some food",
          "Clean scan",
          "92% on time",
        ]),
      },
    ],
  },
};
