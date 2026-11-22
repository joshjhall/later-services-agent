import { campaigns, creators, DEMO_TODAY, deliverables, partnerships } from "@/domain/fixtures";
import type { Effect } from "@/domain/types";
import {
  AGENT_POLICY,
  type AgentPolicy,
  capEvidence,
  daysBetween,
  deriveProposals,
  withinCap,
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
    expect(boostAt(10_000)?.evidence.find((e) => e.label === "Agent cap")?.value).toBe(
      "$10,000/day, if spent in one day · within it",
    );
  });

  test("withinCap compares in whole dollars, as the cap row does", () => {
    expect(withinCap(4000, { maxDailySpend: 4000 })).toBe(true);
    expect(withinCap(4000.4, { maxDailySpend: 4000 })).toBe(true);
    expect(withinCap(4000.5, { maxDailySpend: 4000 })).toBe(false);
    expect(withinCap(4001, { maxDailySpend: 4000.5 })).toBe(true);
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

  test("cap evidence compares in whole dollars, so the row never contradicts itself", () => {
    // $5,000 shown against a $5,000 cap reads as within it, from either side of the rounding.
    expect(capEvidence([5000.4], { maxDailySpend: 5000 }).value).toBe(
      "$5,000/day, if spent in one day · within it",
    );
    expect(capEvidence([5000], { maxDailySpend: 4999.6 }).value).toBe(
      "$5,000/day, if spent in one day · within it",
    );
    expect(capEvidence([5001], { maxDailySpend: 5000 }).value).toMatch(
      /above it, so it needs you$/,
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
