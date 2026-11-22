import type { Proposal } from "@/agent/rules";
import { campaigns } from "@/domain/fixtures";
import type { ActivityEntry, ScheduledMessage } from "@/domain/types";
import { activityIn, openIn, pendingIn, scopeOf } from "./scope";
import { selectRail } from "./select";

const msg = (id: string, campaignId: string, sendAt: string) =>
  ({ id, campaignId, sendAt }) as ScheduledMessage;

test("pendingIn keeps scope, drops what was sent, and sorts soonest first", () => {
  const messages = [
    msg("late", "a", "2026-12-02"),
    msg("other", "b", "2026-11-19"),
    msg("soon", "a", "2026-11-20"),
    msg("gone", "a", "2026-11-19"),
  ];
  expect(pendingIn(messages, ["a"], { gone: {} }).map((m) => m.id)).toEqual(["soon", "late"]);
  expect(pendingIn(messages, [], {})).toEqual([]);
});

test("openIn keeps scope and drops resolved proposals", () => {
  const ps = [
    { id: "1", campaignId: "a" },
    { id: "2", campaignId: "a" },
    { id: "3", campaignId: "b" },
  ] as Proposal[];
  expect(openIn(ps, { "2": {} }, ["a"]).map((p) => p.id)).toEqual(["1"]);
});

test("activityIn returns only entries about campaigns in scope", () => {
  const entries = [
    { id: "x", target: "Rio Castillo · Sparkling Citrus" },
    { id: "y", target: "Trail season" },
  ] as ActivityEntry[];
  expect(activityIn(entries, campaigns, ["cmp-trail-season"]).map((e) => e.id)).toEqual(["y"]);
  expect(activityIn(entries, campaigns, [])).toEqual([]);
});

test("scopeOf: goal is one campaign; unknown ids are empty, which hides the rail", () => {
  expect(scopeOf({ view: "goal", id: "cmp-spring-serum" }, campaigns)).toEqual([
    "cmp-spring-serum",
  ]);
  const unknown = scopeOf({ view: "campaign", id: "nope" }, campaigns);
  expect(unknown).toEqual([]);
  expect(scopeOf({ view: "account", id: "nope" }, campaigns)).toEqual([]);
  expect(
    selectRail({ view: "campaign", id: "nope" }, { campaigns: unknown.length, scheduled: 0 }),
  ).toEqual([]);
});

test("activityIn scopes by campaign id when names share a prefix", () => {
  const campaigns = [
    { id: "a", name: "Sparkling Citrus" },
    { id: "b", name: "Sparkling Citrus relaunch" },
  ];
  const entries = [
    { id: "x", target: "Ana Reyes · Sparkling Citrus", campaignId: "a" },
    { id: "y", target: "Ana Reyes · Sparkling Citrus relaunch", campaignId: "b" },
    { id: "z", target: "Sparkling Citrus relaunch" },
    // An id outside the scope excludes the entry, even though its text names an in-scope campaign.
    { id: "w", target: "Sparkling Citrus", campaignId: "other" },
  ] as ActivityEntry[];
  // With an id, an entry lands only in its own campaign.
  // Without one, "z" falls back to name matching, which is loose: its target contains both names.
  // That is a known limitation of the fallback, not a goal; tighten it if entries ever lack ids.
  expect(activityIn(entries, campaigns, ["a"]).map((e) => e.id)).toEqual(["x", "z"]);
  expect(activityIn(entries, campaigns, ["b"]).map((e) => e.id)).toEqual(["y", "z"]);
  // An account scope holding both counts each entry once.
  expect(activityIn(entries, campaigns, ["a", "b"]).map((e) => e.id)).toEqual(["x", "y", "z"]);
});
