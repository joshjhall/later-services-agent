import { act, renderHook } from "@testing-library/react";
import { type MessageDraft, messageDrafts } from "@/agent/drafts";
import { AGENT_POLICY, deriveProposals, type Proposal } from "@/agent/rules";
import * as fx from "@/domain/fixtures";
import { autoRun, StoreProvider, useStore } from "@/domain/store";
import { isUndoable } from "@/domain/types";

// The rail scopes activity by `campaignId`; an entry without it falls back to
// loose name matching (#49). These pin where each new entry takes its id from.

const base = messageDrafts["fix:d-rio-1"];

function renderStore() {
  return renderHook(() => useStore(), { wrapper: StoreProvider });
}

/** The draft behind a proposal's sending option. */
function draftOf(p: Proposal, optionId = "draft-email") {
  const d = p.options.find((o) => o.id === optionId)?.draft;
  if (!d) throw new Error(`no draft behind ${p.id}/${optionId}`);
  return d;
}

function entry(result: ReturnType<typeof renderStore>["result"], id: string) {
  const found = result.current.activity.find((a) => a.id === id);
  if (!found) throw new Error(`no activity entry ${id}`);
  return found;
}

test("resolve stamps the proposal's campaign id", () => {
  const { result } = renderStore();
  const p = result.current.proposals[0];
  act(() => result.current.resolve(p, p.options[0].id));
  expect(result.current.activity[0].id).toBe(`act-${p.id}`);
  expect(entry(result, `act-${p.id}`).campaignId).toBe(p.campaignId);
});

test("send with answers takes the proposal's campaign id over the draft's", () => {
  const { result } = renderStore();
  const p = result.current.proposals[0];
  const draft: MessageDraft = { ...base, id: "t-answers", campaignId: "cmp-draft-only" };
  expect(p.campaignId).not.toBe(draft.campaignId);
  act(() => result.current.send(draft, { proposal: p, optionId: p.options[0].id }));
  expect(entry(result, "act-sent-t-answers").campaignId).toBe(p.campaignId);
});

test("send without answers takes the draft's campaign id", () => {
  const { result } = renderStore();
  const draft: MessageDraft = { ...base, id: "t-draft", campaignId: "cmp-draft-only" };
  act(() => result.current.send(draft));
  expect(entry(result, "act-sent-t-draft").campaignId).toBe("cmp-draft-only");
});

test("send leaves the campaign id undefined when the draft has none", () => {
  const { result } = renderStore();
  const { campaignId: _, ...rest } = base;
  const draft = { ...rest, id: "t-none" } as MessageDraft;
  act(() => result.current.send(draft));
  expect(entry(result, "act-sent-t-none").campaignId).toBeUndefined();
});

test("store: sending a draft for an already-resolved proposal keeps the first decision", () => {
  const { result } = renderStore();
  const p = result.current.proposals.find((x) => x.id === "info:cmp-holiday-gifting:cr-ana");
  if (!p) throw new Error("info request missing");
  act(() => result.current.resolve(p, "confirmed"));
  const before = result.current.activity.length;
  act(() => result.current.send(draftOf(p), { proposal: p, optionId: "draft-email" }));
  act(() => result.current.send(draftOf(p), { proposal: p, optionId: "draft-email" }));
  expect(result.current.resolved[p.id].optionId).toBe("confirmed");
  // The message still went out, once.
  expect(result.current.activity.length).toBe(before + 1);
});

test("store: an action label names the decision; without one, the option label is used", () => {
  const { result } = renderStore();
  const goal = result.current.proposals.find((x) => x.id === "goal:cmp-spring-serum");
  const info = result.current.proposals.find((x) => x.id === "info:cmp-holiday-gifting:cr-ana");
  if (!goal || !info) throw new Error("proposal missing");
  // The goal view's no-email path: resolve directly with the decision.
  act(() => result.current.resolve(goal, "open", "Confirmed goal"));
  expect(result.current.resolved[goal.id].label).toBe("Confirmed goal");
  expect(result.current.activity[0]).toMatchObject({ actor: "Maya", action: "Confirmed goal" });
  // An earlier decision keeps its label, whatever a later call names.
  act(() => result.current.resolve(goal, "open", "Approved lineup"));
  expect(result.current.resolved[goal.id].label).toBe("Confirmed goal");
  // A draft that answers a proposal without an action keeps the option label.
  act(() => result.current.send(draftOf(info), { proposal: info, optionId: "draft-email" }));
  const option = info.options.find((o) => o.id === "draft-email");
  expect(result.current.resolved[info.id].label).toBe(option?.label);
});

test("store: resolving a proposal twice records one entry", () => {
  const { result } = renderStore();
  const p = result.current.proposals[0];
  const before = result.current.activity.length;
  act(() => result.current.resolve(p, p.options[0].id));
  act(() => result.current.resolve(p, p.options[0].id));
  expect(result.current.activity.length).toBe(before + 1);
});

test("store: a double click within one render still records one entry", () => {
  const { result } = renderStore();
  const p = result.current.proposals[0];
  const before = result.current.activity.length;
  act(() => {
    result.current.resolve(p, p.options[0].id);
    result.current.resolve(p, p.options[1].id);
  });
  expect(result.current.activity.length).toBe(before + 1);
  expect(result.current.resolved[p.id].optionId).toBe(p.options[0].id);
});

test("store: a sent answer and a later resolve of the same proposal record the decision once", () => {
  const { result } = renderStore();
  const p = result.current.proposals.find((x) => x.id === "info:cmp-holiday-gifting:cr-ana");
  if (!p) throw new Error("info request missing");
  const before = result.current.activity.length;
  // In one render: the send lands first, so the resolve is a no-op.
  act(() => {
    result.current.send(draftOf(p), { proposal: p, optionId: "draft-email" });
    result.current.resolve(p, "confirmed");
  });
  act(() => result.current.resolve(p, "confirmed"));
  // One entry: the message that went out. No separate "Chose" entry.
  expect(result.current.activity.length).toBe(before + 1);
  expect(result.current.resolved[p.id].optionId).toBe("draft-email");
});

test("store: live entry ids stay unique and never reuse the seeded act-N form", () => {
  const { result } = renderStore();
  for (const p of result.current.proposals) {
    act(() => result.current.resolve(p, p.options[0].id));
  }
  act(() => result.current.send(messageDrafts["fix:d-rio-1"]));
  const ids = result.current.activity.map((e) => e.id);
  expect(new Set(ids).size).toBe(ids.length);
  const seeded = new Set(fx.activity.map((e) => e.id));
  const live = ids.filter((id) => !seeded.has(id));
  // One entry per decision and per send, keyed by what it records.
  expect(live.toSorted()).toEqual(
    [...result.current.proposals.map((p) => `act-${p.id}`), "act-sent-fix:d-rio-1"].toSorted(),
  );
  for (const id of live) expect(id).not.toMatch(/^act-\d+$/);
});

test("store: an option it can't match is recorded as permanent, never undoable", () => {
  const { result } = renderStore();
  const p = result.current.proposals[0];
  act(() => result.current.resolve(p, "no-such-option"));
  expect(result.current.activity[0]).toMatchObject({ actor: "Maya", effect: "external" });
  expect(isUndoable(result.current.activity[0])).toBe(false);
});

/** What autoRun returns when the agent did nothing on its own; the proposals are not compared. */
const NOTHING_RAN = { resolved: {}, entries: [], proposals: expect.any(Array) };

test("store: at the default cap the agent runs nothing on its own", () => {
  expect(autoRun(deriveProposals(fx))).toEqual(NOTHING_RAN);
});

test("store: a recommended boost within the cap is resolved and logged as the agent's spend", () => {
  const policy = { ...AGENT_POLICY, maxDailySpend: 8_000 };
  const boost = deriveProposals(fx, fx.DEMO_TODAY, undefined, policy).find(
    (p) => p.kind === "boost-post",
  );
  if (!boost) throw new Error("fixtures should yield a boost-post proposal");
  const { result } = renderHook(() => useStore(), {
    wrapper: ({ children }) => <StoreProvider policy={policy}>{children}</StoreProvider>,
  });
  expect(result.current.resolved[boost.id]).toMatchObject({ optionId: "boost", by: "agent" });
  expect(entry(result, `act-auto-${boost.id}`)).toMatchObject({
    actor: "agent",
    effect: "spend",
    campaignId: boost.campaignId,
  });
  // Already decided: a later click records nothing new.
  const before = result.current.activity.length;
  act(() => result.current.resolve(boost, "smaller"));
  expect(result.current.activity).toHaveLength(before);
  expect(result.current.resolved[boost.id].optionId).toBe("boost");
});

test("store: the cap is per campaign, so two boosts in one campaign never jointly exceed it", () => {
  const policy = { ...AGENT_POLICY, maxDailySpend: 10_000 };
  const boost = deriveProposals(fx, fx.DEMO_TODAY, undefined, policy).find(
    (p) => p.kind === "boost-post",
  );
  if (!boost) throw new Error("fixtures should yield a boost-post proposal");
  expect(boost.options.find((o) => o.primary)?.amount).toBe(8_000);
  const twin = { ...boost, id: `${boost.id}:twin` };
  const elsewhere = { ...boost, id: `${boost.id}:other`, campaignId: "elsewhere" };
  const { resolved, entries } = autoRun([boost, twin, elsewhere], policy);
  // $8,000 runs; a second $8,000 in the same campaign would reach $16,000, so it waits.
  expect(Object.keys(resolved).toSorted()).toEqual([boost.id, elsewhere.id].toSorted());
  expect(entries.map((e) => e.campaignId).toSorted()).toEqual(
    [boost.campaignId, "elsewhere"].toSorted(),
  );
});

test("store: a boost the campaign total holds back reads as needing approval, not pre-approved", () => {
  const policy = { ...AGENT_POLICY, maxDailySpend: 10_000 };
  const boost = deriveProposals(fx, fx.DEMO_TODAY, undefined, policy).find(
    (p) => p.kind === "boost-post",
  );
  if (!boost) throw new Error("fixtures should yield a boost-post proposal");
  const twin = { ...boost, id: `${boost.id}:twin` };
  const { proposals } = autoRun([boost, twin], policy);
  // The first boost is untouched: nothing was spent before it.
  expect(proposals[0]).toBe(boost);
  // $8,000 already spent: neither $8,000 nor $4,000 fits under $10,000 on top of it.
  const held = proposals[1];
  expect(held.options.filter((o) => o.effect === "spend").map((o) => o.lane)).toEqual([
    "propose",
    "propose",
  ]);
  expect(held.evidence.find((e) => e.label === "Agent cap")?.value).toBe(
    "$10,000/day, if spent in one day · $8,000 already spent · above it, so it needs you",
  );
  // Non-spend options keep their lanes.
  expect(held.options.find((o) => o.id === "skip")?.lane).toBe("human");
});

test("store: an auto spend with no amount fails closed and waits for a person", () => {
  const policy = { ...AGENT_POLICY, maxDailySpend: 10_000 };
  const boost = deriveProposals(fx, fx.DEMO_TODAY, undefined, policy).find(
    (p) => p.kind === "boost-post",
  );
  if (!boost) throw new Error("fixtures should yield a boost-post proposal");
  const unpriced = {
    ...boost,
    options: boost.options.map(({ amount: _, ...o }) => o),
  };
  expect(autoRun([unpriced], policy)).toEqual(NOTHING_RAN);
});

test("store: spend that lands exactly on the cap runs; anything external never runs unasked", () => {
  const policy = { ...AGENT_POLICY, maxDailySpend: 8_000 };
  const boost = deriveProposals(fx, fx.DEMO_TODAY, undefined, policy).find(
    (p) => p.kind === "boost-post",
  );
  if (!boost) throw new Error("fixtures should yield a boost-post proposal");
  const half = {
    ...boost,
    options: boost.options.map((o) => (o.primary ? { ...o, amount: 4_000 } : o)),
  };
  const pair = [half, { ...half, id: `${half.id}:twin` }];
  // $4,000 + $4,000 = $8,000, exactly the cap: both run.
  expect(Object.keys(autoRun(pair, policy).resolved)).toHaveLength(2);
  const external = {
    ...boost,
    options: boost.options.map((o) => (o.primary ? { ...o, effect: "external" as const } : o)),
  };
  expect(autoRun([external], policy)).toEqual(NOTHING_RAN);
});

test("store: an internal auto option runs unasked and never counts toward the spending cap", () => {
  const policy = { ...AGENT_POLICY, maxDailySpend: 8_000 };
  const boost = deriveProposals(fx, fx.DEMO_TODAY, undefined, policy).find(
    (p) => p.kind === "boost-post",
  );
  if (!boost) throw new Error("fixtures should yield a boost-post proposal");
  const internal = {
    ...boost,
    id: `${boost.id}:internal`,
    options: boost.options.map(({ amount: _, ...o }) =>
      o.primary ? { ...o, effect: "internal" as const } : o,
    ),
  };
  // The internal change goes first; the $8,000 boost after it must still fit the cap.
  const { resolved, entries } = autoRun([internal, boost], policy);
  expect(resolved[internal.id]).toMatchObject({ by: "agent" });
  expect(resolved[boost.id]).toMatchObject({ by: "agent" });
  expect(entries.find((e) => e.id === `act-auto-${internal.id}`)).toMatchObject({
    actor: "agent",
    effect: "internal",
  });
});

test("store: a boost skipped for the cap does not block a smaller one that still fits", () => {
  const policy = { ...AGENT_POLICY, maxDailySpend: 10_000 };
  const boost = deriveProposals(fx, fx.DEMO_TODAY, undefined, policy).find(
    (p) => p.kind === "boost-post",
  );
  if (!boost) throw new Error("fixtures should yield a boost-post proposal");
  const priced = (id: string, amount: number) => ({
    ...boost,
    id,
    options: boost.options.map((o) => (o.primary ? { ...o, amount } : o)),
  });
  // In list order: $8,000 runs, the next $8,000 would reach $16,000 and waits, and
  // $2,000 then lands exactly on the $10,000 cap and runs. Earlier proposals spend first.
  const { resolved } = autoRun(
    [priced("big", 8_000), priced("big2", 8_000), priced("small", 2_000)],
    policy,
  );
  expect(Object.keys(resolved).toSorted()).toEqual(["big", "small"]);
});
