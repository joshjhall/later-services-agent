import { campaigns, creators, deliverables, partnerships } from "@/domain/fixtures";
import { AGENT_POLICY, capEvidence, deriveProposals } from "./rules";

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

  test("boost card shows the agent's spending cap from AGENT_POLICY", () => {
    const boost = proposals.find((p) => p.kind === "boost-post");
    expect(boost?.evidence.find((e) => e.label === "Agent cap")).toEqual(capEvidence([8000, 4000]));
    // The default policy, as the card shows it today.
    expect(capEvidence([8000, 4000]).value).toBe(
      "$200 per test, $1,000/day · above it, so it needs you",
    );
    expect(boost?.options.map((o) => o.label)).toEqual(["Boost $8,000", "Boost $4,000", "Not now"]);
  });

  test("cap evidence: above, partly within, at, within, and no options", () => {
    const policy = (maxDailySpend: number) => ({ ...AGENT_POLICY, maxDailySpend });
    expect(capEvidence([8000, 4000], policy(1000)).value).toBe(
      "$200 per test, $1,000/day · above it, so it needs you",
    );
    expect(capEvidence([8000, 4000], policy(5000)).value).toBe(
      "$200 per test, $5,000/day · $4,000 is within it; the rest needs you",
    );
    expect(capEvidence([8000], policy(8000)).value).toBe("$200 per test, $8,000/day · within it");
    expect(capEvidence([8000, 4000], policy(10000)).value).toBe(
      "$200 per test, $10,000/day · within it",
    );
    expect(capEvidence([], policy(10000)).value).toMatch(/above it, so it needs you$/);
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

  test("information request: never raised without a drafted email behind it", () => {
    // Ben is a core lineup member on the roster; flag him as profile-only too. He has no drafted email.
    const ben = creators.map((c) =>
      c.handle === "@benpours" ? { ...c, audienceSource: "profile" as const } : c,
    );
    const ids = deriveProposals({ ...world, creators: ben })
      .filter((p) => p.kind === "info-request")
      .map((p) => p.id);
    expect(ids).toEqual(["info:cmp-holiday-gifting:cr-ana"]);
  });
});
