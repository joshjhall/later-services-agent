import { campaigns } from "@/domain/fixtures";
import type { Route } from "@/router";
import { scopeOf } from "./scope";
import { MAX_WIDGETS, MIN_WIDGETS, type RailFacts, selectRail } from "./select";

const facts = (over: Partial<RailFacts> = {}): RailFacts => ({
  campaigns: 1,
  scheduled: 1,
  ...over,
});

test.each<[string, Route, RailFacts, string[]]>([
  ["Today", { view: "today" }, facts({ campaigns: 4 }), ["summary", "next-message", "activity"]],
  [
    "an account",
    { view: "account", id: "acc-brightside" },
    facts({ campaigns: 2 }),
    ["summary", "next-message", "activity"],
  ],
  [
    "a campaign",
    { view: "campaign", id: "cmp-sparkling-launch" },
    facts(),
    ["summary", "compare", "next-message", "activity"],
  ],
  [
    "a lineup",
    { view: "lineup", id: "cmp-holiday-gifting" },
    facts({ scheduled: 0 }),
    ["summary", "compare", "activity"],
  ],
])("%s gets its widgets in order", (_, route, f, ids) => {
  expect(selectRail(route, f)).toEqual(ids);
});

test("next scheduled message drops out when nothing is queued", () => {
  expect(selectRail({ view: "today" }, facts({ campaigns: 4, scheduled: 0 }))).toEqual([
    "summary",
    "activity",
  ]);
});

test.each<Route>([
  { view: "roster" },
  { view: "activity" },
  { view: "goal", id: "cmp-spring-serum" },
])("no rail on %o", (route) => {
  expect(selectRail(route, facts())).toEqual([]);
});

test("no rail when the scope is empty, e.g. an unknown campaign", () => {
  expect(selectRail({ view: "campaign", id: "nope" }, facts({ campaigns: 0 }))).toEqual([]);
});

test("every non-empty selection has 2–4 widgets and no repeats", () => {
  const routes: Route[] = [
    { view: "today" },
    { view: "account", id: "acc-lumen" },
    { view: "campaign", id: "cmp-trail-season" },
    { view: "lineup", id: "cmp-holiday-gifting" },
  ];
  for (const route of routes)
    for (const scheduled of [0, 1, 3]) {
      const ids = selectRail(route, facts({ campaigns: 2, scheduled }));
      expect(ids.length).toBeGreaterThanOrEqual(MIN_WIDGETS);
      expect(ids.length).toBeLessThanOrEqual(MAX_WIDGETS);
      expect(new Set(ids).size).toBe(ids.length);
    }
});

test("scope follows the route", () => {
  expect(scopeOf({ view: "today" }, campaigns)).toHaveLength(campaigns.length);
  expect(scopeOf({ view: "account", id: "acc-brightside" }, campaigns)).toEqual([
    "cmp-sparkling-launch",
    "cmp-holiday-gifting",
  ]);
  expect(scopeOf({ view: "lineup", id: "cmp-holiday-gifting" }, campaigns)).toEqual([
    "cmp-holiday-gifting",
  ]);
  expect(scopeOf({ view: "roster" }, campaigns)).toEqual([]);
});
