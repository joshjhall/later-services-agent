import { accounts, campaigns } from "@/domain/fixtures";
import { crumbs, href, parse } from "@/router";

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

test("roster, activity, and unknown ids", () => {
  expect(labels({ view: "roster" })).toEqual(["Portfolio", "Roster"]);
  expect(labels({ view: "activity" })).toEqual(["Portfolio", "Activity"]);
  expect(labels({ view: "campaign", id: "nope" })).toEqual(["Portfolio", "Not found"]);
  expect(labels({ view: "account", id: "nope" })).toEqual(["Portfolio", "Not found"]);
});

test("goal ends the trail, and broken campaign links fall back to Not found", () => {
  const trail = crumbs({ view: "goal", id: "cmp-holiday-gifting" }, world);
  expect(trail.at(-1)).toEqual({ label: "Goal" });
  expect(labels({ view: "lineup", id: "nope" })).toEqual(["Portfolio", "Not found"]);
  const orphan = { accounts: [], campaigns };
  expect(crumbs({ view: "campaign", id: "cmp-holiday-gifting" }, orphan).at(-1)?.label).toBe(
    "Not found",
  );
});

test("a campaign tab round-trips through the hash; plain and unknown tabs mean no tab", () => {
  expect(parse("#campaign/cmp-trail-season/run")).toEqual({
    view: "campaign",
    id: "cmp-trail-season",
    tab: "run",
  });
  expect(href({ view: "campaign", id: "cmp-trail-season", tab: "run" })).toBe(
    "#campaign/cmp-trail-season/run",
  );
  expect(parse("#campaign/cmp-trail-season")).toEqual({ view: "campaign", id: "cmp-trail-season" });
  expect(parse("#campaign/cmp-trail-season/bogus")).toEqual({
    view: "campaign",
    id: "cmp-trail-season",
  });
  expect(href({ view: "campaign", id: "cmp-trail-season" })).toBe("#campaign/cmp-trail-season");
});

test("goal and lineup deep links are unchanged", () => {
  expect(parse("#goal/cmp-spring-serum")).toEqual({ view: "goal", id: "cmp-spring-serum" });
  expect(parse("#lineup/cmp-holiday-gifting")).toEqual({
    view: "lineup",
    id: "cmp-holiday-gifting",
  });
});

test("a campaign tab keeps the campaign trail, with the campaign as the current page", () => {
  const trail = crumbs({ view: "campaign", id: "cmp-trail-season", tab: "run" }, world);
  expect(trail).toEqual(crumbs({ view: "campaign", id: "cmp-trail-season" }, world));
  expect(trail.at(-1)).toEqual({ label: "Trail season" });
});

test("extra segments on goal and lineup links are ignored", () => {
  expect(parse("#goal/cmp-spring-serum/extra")).toEqual({ view: "goal", id: "cmp-spring-serum" });
  expect(parse("#lineup/cmp-holiday-gifting/x/y")).toEqual({
    view: "lineup",
    id: "cmp-holiday-gifting",
  });
});
