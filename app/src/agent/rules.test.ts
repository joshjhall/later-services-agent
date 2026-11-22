import { campaigns, creators, DEMO_TODAY, deliverables, partnerships } from "@/domain/fixtures";
import type { Effect } from "@/domain/types";
import { messageDrafts } from "./drafts";
import {
  AGENT_POLICY,
  type AgentPolicy,
  autoOption,
  capEvidence,
  daysBetween,
  deriveProposals,
  fmt,
  type Option,
  type Proposal,
  withinCap,
  withSpent,
} from "./rules";

const world = { campaigns, creators, partnerships, deliverables };

describe("deriveProposals", () => {
  const proposals = deriveProposals(world);

  test("escalates the quiet creator as the top critical item", () => {
    expect(proposals[0]).toMatchObject({
      kind: "quiet-creator",
      severity: "critical",
      id: "quiet:d-ana-1",
    });
    expect(proposals[0].options.map((o) => o.id)).toEqual(["call", "extend", "swap"]);
  });

  test("ids are stable idempotency keys: same world, same ids", () => {
    expect(deriveProposals(world).map((p) => p.id)).toEqual(proposals.map((p) => p.id));
  });

  test("does not escalate before the agent has sent its own reminders", () => {
    const fresh = deliverables.map((d) =>
      d.id === "d-ana-1" ? { ...d, remindersSent: AGENT_POLICY.autoReminders - 1 } : d,
    );
    expect(
      deriveProposals({ ...world, deliverables: fresh }).some((p) => p.kind === "quiet-creator"),
    ).toBe(false);
  });

  test("only proposes a boost when whitelisting is in contract", () => {
    const noRights = partnerships.map((p) => ({ ...p, whitelisting: false }));
    expect(
      deriveProposals({ ...world, partnerships: noRights }).some((p) => p.kind === "boost-post"),
    ).toBe(false);
  });

  test("boost card shows the agent's daily cap, stating the one-day assumption", () => {
    const boost = proposals.find((p) => p.kind === "boost-post");
    expect(boost?.evidence.find((e) => e.label === "Agent cap")?.value).toBe(
      "$1,000/day, if spent in one day · above it, so it needs you",
    );
    // Both amounts are over the default cap, so both wait for the CM.
    expect(boost?.options.map((o) => o.lane)).toEqual(["propose", "propose", "human"]);
    expect(boost?.options.map((o) => o.label)).toEqual(["Boost $8,000", "Boost $4,000", "Not now"]);
  });

  test("the cap decides each boost option's lane: at or under is automatic, above needs approval", () => {
    const boostAt = (maxDailySpend: number) =>
      deriveProposals(world, undefined, undefined, { ...AGENT_POLICY, maxDailySpend }).find(
        (p) => p.kind === "boost-post",
      );
    const lanes = (cap: number) => boostAt(cap)?.options.map((o) => o.lane);
    expect(lanes(5_000)).toEqual(["propose", "auto", "human"]);
    expect(boostAt(5_000)?.evidence.find((e) => e.label === "Agent cap")?.value).toBe(
      "$5,000/day, if spent in one day · $4,000 is within it; the rest needs you",
    );
    // Exactly at an amount, that amount is automatic.
    expect(lanes(4_000)).toEqual(["propose", "auto", "human"]);
    expect(lanes(3_999)).toEqual(["propose", "propose", "human"]);
    expect(lanes(10_000)).toEqual(["auto", "auto", "human"]);
    // A zero cap lets nothing through, and a negative cap fails closed: nothing is automatic.
    expect(lanes(0)).toEqual(["propose", "propose", "human"]);
    expect(lanes(-1)).toEqual(["propose", "propose", "human"]);
    expect(boostAt(10_000)?.evidence.find((e) => e.label === "Agent cap")?.value).toBe(
      "$10,000/day, if spent in one day · within it",
    );
  });

  test("the agent runs a boost on its own only when its recommendation fits the cap", () => {
    const boostAt = (maxDailySpend: number) =>
      deriveProposals(world, undefined, undefined, { ...AGENT_POLICY, maxDailySpend }).find(
        (p) => p.kind === "boost-post",
      );
    const auto = (cap: number) => {
      const p = boostAt(cap);
      if (!p) throw new Error("fixtures should yield a boost-post proposal");
      return autoOption(p)?.id;
    };
    expect(auto(AGENT_POLICY.maxDailySpend)).toBeUndefined();
    // Only the smaller, non-recommended amount fits: never spent unasked.
    expect(auto(5_000)).toBeUndefined();
    expect(auto(8_000)).toBe("boost");
  });

  test("withinCap rounds only toward caution: amount up, cap down", () => {
    expect(withinCap(4000, { maxDailySpend: 4000 })).toBe(true);
    expect(withinCap(4000, { maxDailySpend: 4000.9 })).toBe(true);
    expect(withinCap(4000.4, { maxDailySpend: 4000 })).toBe(false);
    // Never a fraction of a dollar over a fractional cap.
    expect(withinCap(4000.6, { maxDailySpend: 4000.5 })).toBe(false);
    expect(withinCap(0.4, { maxDailySpend: 0 })).toBe(false);
    expect(withinCap(0, { maxDailySpend: 0 })).toBe(true);
    expect(withinCap(1, { maxDailySpend: 0 })).toBe(false);
  });

  test("withinCap fails closed on a malformed amount or cap", () => {
    expect(withinCap(4000, { maxDailySpend: Number.POSITIVE_INFINITY })).toBe(false);
    expect(withinCap(4000, { maxDailySpend: Number.NaN })).toBe(false);
    expect(withinCap(Number.NaN, { maxDailySpend: 5000 })).toBe(false);
    expect(withinCap(-1, { maxDailySpend: 5000 })).toBe(false);
    expect(withinCap(1000, { maxDailySpend: -5 })).toBe(false);
    // Rounds to -0, which would otherwise let a $0 amount through.
    expect(withinCap(0, { maxDailySpend: -0.3 })).toBe(false);
  });

  test("cap evidence counts what the campaign already spent and says so", () => {
    const policy = { maxDailySpend: 10_000 };
    expect(capEvidence([8000, 4000], policy, 0).value).toBe(
      "$10,000/day, if spent in one day · within it",
    );
    expect(capEvidence([8000, 4000], policy, 3000).value).toBe(
      "$10,000/day, if spent in one day · $3,000 already spent · $4,000 is within it; the rest needs you",
    );
    expect(capEvidence([8000, 4000], policy, 8000).value).toBe(
      "$10,000/day, if spent in one day · $8,000 already spent · above it, so it needs you",
    );
  });

  test("withSpent re-lanes spend options against prior campaign spend and leaves the rest alone", () => {
    const policy = { ...AGENT_POLICY, maxDailySpend: 10_000 };
    const boost = deriveProposals(world, undefined, undefined, policy).find(
      (p) => p.kind === "boost-post",
    );
    if (!boost) throw new Error("fixtures should yield a boost-post proposal");
    expect(withSpent(boost, 0, policy)).toBe(boost);
    const lanes = (p: typeof boost) => Object.fromEntries(p.options.map((o) => [o.id, o.lane]));
    expect(lanes(boost)).toEqual({ boost: "auto", smaller: "auto", skip: "human" });
    expect(lanes(withSpent(boost, 3000, policy))).toEqual({
      boost: "propose",
      smaller: "auto",
      skip: "human",
    });
    expect(lanes(withSpent(boost, 8000, policy))).toEqual({
      boost: "propose",
      smaller: "propose",
      skip: "human",
    });
    // The input is not mutated, and a proposal with no spend options comes back as is.
    expect(lanes(boost).boost).toBe("auto");
    const other = deriveProposals(world).find((p) => !p.options.some((o) => o.effect === "spend"));
    if (!other) throw new Error("fixtures should yield a proposal without spend");
    expect(withSpent(other, 8000, policy)).toBe(other);
  });

  test("withSpent fails a spend option with no amount closed, and leaves priced ones to the cap", () => {
    const policy = { ...AGENT_POLICY, maxDailySpend: 10_000 };
    const boost = deriveProposals(world, undefined, undefined, policy).find(
      (p) => p.kind === "boost-post",
    );
    if (!boost) throw new Error("fixtures should yield a boost-post proposal");
    const unpriced = {
      ...boost,
      options: boost.options.map(({ amount, ...o }) => (o.id === "smaller" ? o : { ...o, amount })),
    };
    const lanes = (p: typeof boost) => Object.fromEntries(p.options.map((o) => [o.id, o.lane]));
    // $1,000 + $8,000 still fits; the option with no amount cannot be checked, so it needs a person.
    expect(lanes(withSpent(unpriced, 1000, policy))).toEqual({
      boost: "auto",
      smaller: "propose",
      skip: "human",
    });
  });

  test("withSpent under a non-finite cap shows it as not set and sends every spend to a person", () => {
    const boost = deriveProposals(world).find((p) => p.kind === "boost-post");
    if (!boost) throw new Error("fixtures should yield a boost-post proposal");
    // Start from auto lanes so the re-laning is visible.
    const auto = {
      ...boost,
      options: boost.options.map((o) =>
        o.effect === "spend" ? { ...o, lane: "auto" as const } : o,
      ),
    };
    for (const maxDailySpend of [Number.POSITIVE_INFINITY, Number.NaN]) {
      const p = withSpent(auto, 3000, { maxDailySpend });
      expect(p.evidence.find((e) => e.label === "Agent cap")?.value).toBe(
        "Not set · every amount needs you",
      );
      expect(p.options.filter((o) => o.effect === "spend").every((o) => o.lane === "propose")).toBe(
        true,
      );
    }
  });

  test("cap evidence shows a malformed cap as not set, not as a dollar amount", () => {
    for (const maxDailySpend of [
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
      Number.NaN,
      -5,
      -0.3,
    ]) {
      expect(capEvidence([8000, 4000], { maxDailySpend }).value).toBe(
        "Not set · every amount needs you",
      );
    }
  });

  test("the cap row, the proposed spend, the boost buttons, and their lanes share one list of amounts", () => {
    const boost = proposals.find((p) => p.kind === "boost-post");
    const boosts = (boost?.options ?? []).filter((o) => o.effect === "spend");
    const amount = (label: string) => Number(label.replace(/[^0-9]/g, ""));
    expect(boosts.length).toBeGreaterThan(1);
    // Each button's amount flips the cap verdict exactly at that amount, so the cap row reads the same list.
    for (const o of boosts) {
      const at = deriveProposals(world, undefined, undefined, {
        ...AGENT_POLICY,
        maxDailySpend: amount(o.label),
      }).find((p) => p.kind === "boost-post");
      const below = deriveProposals(world, undefined, undefined, {
        ...AGENT_POLICY,
        maxDailySpend: amount(o.label) - 1,
      }).find((p) => p.kind === "boost-post");
      // The verdict only: the part after "·", so the cap figure itself never matches.
      const cap = (p?: typeof boost) =>
        p?.evidence.find((e) => e.label === "Agent cap")?.value.split("· ")[1];
      const shown = o.label.replace("Boost ", "");
      const listed = (v?: string) => v === "within it" || !!v?.startsWith(`${shown} is within`);
      expect(listed(cap(at))).toBe(true);
      expect(cap(below)).not.toContain(`${shown} is within`);
      expect(cap(below)).not.toBe("within it");
      // The button's lane flips at the same amount, so the row and the lane never disagree.
      const lane = (p?: typeof boost) => p?.options.find((x) => x.id === o.id)?.lane;
      expect(lane(at)).toBe("auto");
      expect(lane(below)).toBe("propose");
    }
    const primary = boosts.find((o) => o.primary);
    expect(primary).toBeDefined();
    expect(boost?.evidence.find((e) => e.label === "Proposed spend")?.value).toMatch(
      new RegExp(`^\\${primary?.label.replace("Boost ", "")} of`),
    );
  });

  test("maxTestSpend is not read yet: changing it changes no proposal", () => {
    const changed = deriveProposals(world, undefined, undefined, {
      ...AGENT_POLICY,
      maxTestSpend: AGENT_POLICY.maxTestSpend * 100,
    });
    expect(changed).toEqual(proposals);
  });

  test("cap evidence: above, partly within, at, within, and no options, in plain English", () => {
    const policy = (maxDailySpend: number) => ({ maxDailySpend });
    expect(capEvidence([8000, 4000], policy(1000)).value).toBe(
      "$1,000/day, if spent in one day · above it, so it needs you",
    );
    expect(capEvidence([8000, 4000], policy(5000)).value).toBe(
      "$5,000/day, if spent in one day · $4,000 is within it; the rest needs you",
    );
    expect(capEvidence([8000], policy(8000)).value).toBe(
      "$8,000/day, if spent in one day · within it",
    );
    expect(capEvidence([8000, 4000], policy(10000)).value).toBe(
      "$10,000/day, if spent in one day · within it",
    );
    expect(capEvidence([8000, 3000, 2000], policy(4000)).value).toBe(
      "$4,000/day, if spent in one day · $3,000 and $2,000 are within it; the rest needs you",
    );
    expect(capEvidence([8000, 3000, 2000, 1000], policy(4000)).value).toMatch(
      /· \$3,000, \$2,000, and \$1,000 are within it; the rest needs you$/,
    );
    expect(capEvidence([], policy(10000)).value).toMatch(/above it, so it needs you$/);
  });

  test("the quiet-creator and below-forecast thresholds read the policy passed in", () => {
    const kinds = (overrides: Partial<AgentPolicy>) =>
      new Set(
        deriveProposals(world, undefined, undefined, { ...AGENT_POLICY, ...overrides }).map(
          (p) => p.kind,
        ),
      );
    expect(kinds({})).toContain("quiet-creator");
    expect(kinds({ autoReminders: 99 })).not.toContain("quiet-creator");
    // Loosening a threshold makes a proposal fire where the default would not.
    const fresh = deliverables.map((d) =>
      d.id === "d-ana-1" ? { ...d, remindersSent: AGENT_POLICY.autoReminders - 1 } : d,
    );
    const loosened = deriveProposals({ ...world, deliverables: fresh }, undefined, undefined, {
      ...AGENT_POLICY,
      autoReminders: AGENT_POLICY.autoReminders - 1,
    });
    expect(loosened.some((p) => p.kind === "quiet-creator")).toBe(true);
    expect(kinds({ quietAfterDays: 999 })).not.toContain("quiet-creator");
    expect(kinds({ escalateWithinDays: -999 })).not.toContain("quiet-creator");
    expect(kinds({})).toContain("below-forecast");
    expect(kinds({ belowForecastRatio: 0 })).not.toContain("below-forecast");
    const forecasts = (ratio: number) =>
      deriveProposals(world, undefined, undefined, {
        ...AGENT_POLICY,
        belowForecastRatio: ratio,
      }).filter((p) => p.kind === "below-forecast").length;
    // Raising the ratio flags KPIs the default does not.
    expect(forecasts(100)).toBeGreaterThan(forecasts(AGENT_POLICY.belowForecastRatio));
  });

  test("the quiet-creator thresholds are inclusive at their boundaries", () => {
    // Pins `>=` on quietAfterDays and `<=` on escalateWithinDays: the tunables a presenter edits live.
    const ana = deliverables.find((d) => d.id === "d-ana-1");
    if (!ana) throw new Error("fixture d-ana-1 missing");
    const quietFor = daysBetween(ana.lastCreatorContact, DEMO_TODAY);
    const toGoLive = daysBetween(DEMO_TODAY, ana.goLive);
    const fires = (overrides: Partial<AgentPolicy>) =>
      deriveProposals(world, undefined, undefined, { ...AGENT_POLICY, ...overrides }).some(
        (p) => p.id === "quiet:d-ana-1",
      );
    expect(fires({ quietAfterDays: quietFor })).toBe(true);
    expect(fires({ quietAfterDays: quietFor + 1 })).toBe(false);
    expect(fires({ escalateWithinDays: toGoLive })).toBe(true);
    expect(fires({ escalateWithinDays: toGoLive - 1 })).toBe(false);
  });

  test("cap evidence rounds odd amounts to whole dollars", () => {
    expect(capEvidence([8001, 4000.5], { maxDailySpend: 5000 }).value).toBe(
      "$5,000/day, if spent in one day · $4,001 is within it; the rest needs you",
    );
  });

  test("cap evidence rounds only toward caution, as withinCap does", () => {
    // Cents over a whole-dollar cap need a person.
    expect(capEvidence([5000.4], { maxDailySpend: 5000 }).value).toBe(
      "$5,000/day, if spent in one day · above it, so it needs you",
    );
    // A fractional cap is shown, and compared, rounded down.
    expect(capEvidence([5000], { maxDailySpend: 4999.6 }).value).toBe(
      "$4,999/day, if spent in one day · above it, so it needs you",
    );
    expect(capEvidence([4999], { maxDailySpend: 4999.6 }).value).toBe(
      "$4,999/day, if spent in one day · within it",
    );
  });

  test("covers the three demo moments: goal, lineup, hard moment", () => {
    const kinds = new Set(proposals.map((p) => p.kind));
    for (const k of ["state-goal", "approve-lineup", "quiet-creator"] as const)
      expect(kinds).toContain(k);
  });

  test("action hierarchy: every proposal has exactly one primary action", () => {
    for (const p of proposals) expect(p.options.filter((o) => o.primary)).toHaveLength(1);
  });

  test("draft review is exceptions first: the fix request leads", () => {
    const review = proposals.find((p) => p.kind === "review-draft");
    expect(review?.options.find((o) => o.primary)?.id).toBe("send-fix");
    expect(review?.evidence[0].tone).toBe("bad");
  });

  test("draft review follows the decision outcomes: fix request, with changes, approve", () => {
    const review = proposals.find((p) => p.kind === "review-draft");
    expect(review?.options.map((o) => o.id)).toEqual(["send-fix", "corrections", "approve"]);
    expect(review?.options.map((o) => o.label)).toEqual([
      "Send fix request",
      "Approve with changes",
      "Approve",
    ]);
    expect(review?.options[0].hint).toBe("Decline unless fixed");
  });

  test("information request: states its assumption and what changes if it's wrong", () => {
    const requests = proposals.filter((p) => p.kind === "info-request");
    expect(requests).toHaveLength(1);
    expect(requests[0]).toMatchObject({ id: "info:cmp-holiday-gifting:cr-ana" });
    expect(requests[0].assumption).toMatch(/assumed Ana's audience is mostly US/);
    expect(requests[0].ifWrong).toMatch(/reach estimate drops/);
  });

  test("information request: none once the audience split is verified", () => {
    const verified = creators.map((c) => ({ ...c, audienceSource: "verified" as const }));
    expect(
      deriveProposals({ ...world, creators: verified }).some((p) => p.kind === "info-request"),
    ).toBe(false);
  });

  test("information request: only core lineup members known to the roster, at the lineup stage", async () => {
    const { lineupDrafts } = await import("./drafts");
    const base = lineupDrafts["cmp-holiday-gifting"];
    const withAna = (role: "core" | "backup", handle = "@anamakesthings") => ({
      "cmp-holiday-gifting": {
        ...base,
        candidates: base.candidates.map((c) =>
          c.handle === "@anamakesthings" ? { ...c, role, handle } : c,
        ),
      },
    });
    const count = (w: typeof world, l: typeof lineupDrafts) =>
      deriveProposals(w, undefined, l).filter((p) => p.kind === "info-request").length;
    expect(count(world, withAna("core"))).toBe(1);
    expect(count(world, withAna("backup"))).toBe(0);
    expect(count(world, withAna("core", "@not-on-roster"))).toBe(0);
    const pastLineup = campaigns.map((c) =>
      c.id === "cmp-holiday-gifting" ? { ...c, stage: "production" as const } : c,
    );
    expect(count({ ...world, campaigns: pastLineup }, withAna("core"))).toBe(0);
  });

  test("information request: raised for any profile-only core member, with its own email", () => {
    // Ben is a core lineup member on the roster; flag him as profile-only too.
    const ben = creators.map((c) =>
      c.handle === "@benpours" ? { ...c, audienceSource: "profile" as const } : c,
    );
    const requests = deriveProposals({ ...world, creators: ben }).filter(
      (p) => p.kind === "info-request",
    );
    expect(requests.map((p) => p.id)).toEqual([
      "info:cmp-holiday-gifting:cr-ana",
      "info:cmp-holiday-gifting:cr-ben",
    ]);
    const benDraft = requests[1].options.find((o) => o.id === "draft-email")?.draft;
    expect(benDraft?.id).toBe(requests[1].id);
    expect(benDraft?.target).toBe("Ben Okafor · Holiday gifting");
    expect(requests[1].title).toBe("Confirm Ben's audience is mostly US");
    expect(requests[1].assumption).toMatch(/mostly US from the TikTok profile/);
  });

  test("information request: the email names the client when accounts are known", async () => {
    const { accounts } = await import("@/domain/fixtures");
    const body = (w: typeof world & { accounts?: typeof accounts }) =>
      deriveProposals(w)
        .find((p) => p.id === "info:cmp-holiday-gifting:cr-ana")
        ?.options.find((o) => o.id === "draft-email")?.draft?.body;
    expect(body({ ...world, accounts })).toMatch(
      /the Brightside Beverages Holiday gifting campaign/,
    );
    expect(body(world)).toMatch(/proposing Ana for the Holiday gifting campaign\./);
  });

  test("draft review: any submitted draft gets a review with a fix request to send", () => {
    // Mei's live Reel, moved back to submitted: no hand-written fix request exists for it.
    const submitted = deliverables.map((d) =>
      d.id === "d-mei-1" ? { ...d, stage: "submitted" as const } : d,
    );
    const review = deriveProposals({ ...world, deliverables: submitted }).find(
      (p) => p.id === "review:d-mei-1",
    );
    expect(review?.options.map((o) => o.id)).toEqual(["send-fix", "corrections", "approve"]);
    const draft = review?.options[0].draft;
    expect(draft).toMatchObject({
      id: "fix:d-mei-1",
      to: "Mei Tanaka",
      target: "Mei Tanaka · Sparkling Citrus launch",
      campaignId: review?.campaignId,
    });
    expect(draft?.body).toMatch(/^Hi Mei,/);
    expect(draft?.body).toMatch(/Go-live stays Nov 15\./);
  });

  test("draft review: still offers a fix request when the campaign is missing", () => {
    const orphan = campaigns.filter((c) => c.id !== "cmp-sparkling-launch");
    const submitted = deliverables.map((d) =>
      d.id === "d-mei-1" ? { ...d, stage: "submitted" as const } : d,
    );
    const review = deriveProposals({ ...world, campaigns: orphan, deliverables: submitted }).find(
      (p) => p.id === "review:d-mei-1",
    );
    expect(review?.options[0].draft).toMatchObject({
      campaignId: "cmp-sparkling-launch",
      target: "Mei Tanaka · IG Reel + Story ×2",
    });
  });

  test("draft review: a hand-written fix request wins over the generated one", async () => {
    const { messageDrafts } = await import("./drafts");
    const review = deriveProposals(world).find((p) => p.id === "review:d-rio-1");
    expect(review?.options[0].draft).toBe(messageDrafts["fix:d-rio-1"]);
  });
});

/**
 * What each option touches, by proposal kind. Effect decides undo in the Activity
 * record, so a change here (e.g. a boost turning `internal`) must be deliberate.
 */
const EFFECTS: Record<string, Effect> = {
  "quiet-creator:call": "external",
  "quiet-creator:extend": "external",
  "quiet-creator:swap": "external",
  "review-draft:send-fix": "external",
  "review-draft:corrections": "external",
  "review-draft:approve": "external",
  "boost-post:boost": "spend",
  "boost-post:smaller": "spend",
  "boost-post:skip": "internal",
  "state-goal:open": "internal",
  "approve-lineup:open": "internal",
  "below-forecast:plan": "internal",
  "below-forecast:note": "internal",
  "info-request:draft-email": "external",
  "info-request:confirmed": "internal",
};

describe("option effects", () => {
  const options = deriveProposals(world).flatMap((p) =>
    p.options.map((o) => ({ key: `${p.kind}:${o.id}`, effect: o.effect })),
  );

  test.each(options)("$key is $effect", ({ key, effect }) => {
    expect(EFFECTS[key]).toBe(effect);
  });

  test("every option in the table is still offered", () => {
    const offered = new Set(options.map((o) => o.key));
    expect(Object.keys(EFFECTS).filter((k) => !offered.has(k))).toEqual([]);
  });
});

describe("fmt", () => {
  test.each([
    [12.345, "12.3%"],
    [0, "0.0%"],
    [2500, "2500.0%"],
    [-0.04, "0.0%"],
    [-12.345, "-12.3%"],
  ])("percent: fmt(%d) -> %s, never K/M-scaled", (n, out) => {
    expect(fmt(n, "%")).toBe(out);
  });

  test.each([
    [0, "0"],
    [999.4, "999"],
    [1000, "1K"],
    [12_499, "12K"],
    [1_000_000, "1.0M"],
    [2_460_000, "2.5M"],
  ])("bare: fmt(%d) -> %s", (n, out) => {
    expect(fmt(n)).toBe(out);
  });

  test.each([
    [450, "$450"],
    [85_000, "$85K"],
    [1_200_000, "$1.2M"],
  ])("dollar: fmt(%d) -> %s", (n, out) => {
    expect(fmt(n, "$")).toBe(out);
  });

  test.each([
    [999_499, "", "999K"],
    [999_500, "", "1.0M"],
    [999_500, "$", "$1.0M"],
  ])("K/M boundary: fmt(%d, %j) -> %s, never 1000K", (n, unit, out) => {
    expect(fmt(n, unit as "" | "$")).toBe(out);
  });

  test.each([
    [999.4, "", "999"],
    [999.5, "", "1K"],
    [999.6, "", "1K"],
    [999.6, "$", "$1K"],
  ])("bare/K boundary: fmt(%d, %j) -> %s, never 1000", (n, unit, out) => {
    expect(fmt(n, unit as "" | "$")).toBe(out);
  });

  test.each([
    [999_949_999, "", "999.9M"],
    [999_950_000, "", "1.0B"],
    [1_200_000_000, "", "1.2B"],
    [2_460_000_000, "$", "$2.5B"],
  ])("M/B boundary: fmt(%d, %j) -> %s, never 1000.0M", (n, unit, out) => {
    expect(fmt(n, unit as "" | "$")).toBe(out);
  });

  test("B is the ceiling: a trillion stays in B rather than adding a T tier", () => {
    expect(fmt(1e12)).toBe("1000.0B");
  });

  test.each([NaN, Infinity, -Infinity].flatMap((n) => ["", "$", "%"].map((u) => [n, u])))(
    "non-finite: fmt(%d, %j) -> the no-value dash",
    (n, unit) => {
      expect(fmt(n as number, unit as "" | "$" | "%")).toBe("—");
    },
  );

  test.each([
    [-5000, "", "-5K"],
    [-2_460_000, "", "-2.5M"],
    [-450, "", "-450"],
    [-999_500, "", "-1.0M"],
    [-999.6, "", "-1K"],
    [-999_950_000, "", "-1.0B"],
    [-0.4, "", "0"],
    [-0.4, "$", "$0"],
    [-85_000, "$", "-$85K"],
  ])("negative: fmt(%d, %j) -> %s, scaled like positives", (n, unit, out) => {
    expect(fmt(n, unit as "" | "$")).toBe(out);
  });

  test("the unit defaults to bare", () => {
    expect(fmt(5000)).toBe(fmt(5000, ""));
  });
});

describe("autoOption", () => {
  const base: Proposal = {
    id: "p",
    kind: "boost-post",
    severity: "info",
    campaignId: "c",
    title: "t",
    summary: "s",
    evidence: [],
    confidence: "high",
    dueInDays: 1,
    options: [],
  };
  const opt = (o: Partial<Option>): Option => ({
    id: "o",
    label: "O",
    lane: "auto",
    effect: "internal",
    ...o,
  });

  test("runs nothing when there is no recommendation", () => {
    expect(autoOption({ ...base, options: [opt({})] })).toBeUndefined();
  });

  test("never runs an auto option that is not the recommendation", () => {
    const options = [opt({ id: "a", lane: "propose", primary: true }), opt({ id: "b" })];
    expect(autoOption({ ...base, options })).toBeUndefined();
  });

  test("never sends a drafted message on its own, even in the auto lane", () => {
    const draft = Object.values(messageDrafts)[0];
    expect(autoOption({ ...base, options: [opt({ primary: true, draft })] })).toBeUndefined();
  });

  test("runs the recommendation when it is in the auto lane", () => {
    expect(autoOption({ ...base, options: [opt({ id: "go", primary: true })] })?.id).toBe("go");
  });
});
