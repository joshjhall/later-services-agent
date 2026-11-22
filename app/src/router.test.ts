import { accounts, campaigns } from "@/domain/fixtures";
import { crumbs } from "@/router";

const world = { accounts, campaigns };
const labels = (r: Parameters<typeof crumbs>[0]) => crumbs(r, world).map((c) => c.label);

test("today is the portfolio root, with no link to itself", () => {
  expect(crumbs({ view: "today" }, world)).toEqual([{ label: "Portfolio" }]);
});

test("account, campaign, and lineup build the object path", () => {
  expect(labels({ view: "account", id: "acc-brightside" })).toEqual([
    "Portfolio",
    "Brightside Beverages",
  ]);
  expect(labels({ view: "campaign", id: "cmp-holiday-gifting" })).toEqual([
    "Portfolio",
    "Brightside Beverages",
    "Holiday gifting",
  ]);
  const trail = crumbs({ view: "lineup", id: "cmp-holiday-gifting" }, world);
  expect(trail.map((c) => c.label)).toEqual([
    "Portfolio",
    "Brightside Beverages",
    "Holiday gifting",
    "Lineup",
  ]);
  expect(trail.slice(0, -1).every((c) => c.to)).toBe(true);
  expect(trail.at(-1)?.to).toBeUndefined();
  expect(trail[2].to).toEqual({ view: "campaign", id: "cmp-holiday-gifting" });
});

test("roster, log, and unknown ids", () => {
  expect(labels({ view: "roster" })).toEqual(["Portfolio", "Roster"]);
  expect(labels({ view: "log" })).toEqual(["Portfolio", "Agent log"]);
  expect(labels({ view: "campaign", id: "nope" })).toEqual(["Portfolio", "Not found"]);
  expect(labels({ view: "account", id: "nope" })).toEqual(["Portfolio", "Not found"]);
});
