import { campaigns, creators, deliverables, partnerships } from "@/domain/fixtures";
import { AGENT_POLICY, deriveProposals } from "./rules";

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
});
