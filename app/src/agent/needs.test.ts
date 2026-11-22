import { groupByNeed, NEED_LABEL, needOf, PROPOSAL_PHASE } from "./needs";
import type { Proposal } from "./rules";

type Kind = Proposal["kind"];
const p = (kind: Kind, severity: Proposal["severity"] = "info") => ({ kind, severity });

test("needOf sorts every kind into a need", () => {
  expect(needOf(p("approve-lineup", "warning"))).toBe("now");
  expect(needOf(p("state-goal"))).toBe("now");
  expect(needOf(p("review-draft"))).toBe("ready");
  expect(needOf(p("boost-post"))).toBe("ready");
  expect(needOf(p("info-request"))).toBe("ready");
  expect(needOf(p("quiet-creator", "warning"))).toBe("waiting");
  expect(needOf(p("below-forecast", "warning"))).toBe("todo");
});

test("critical severity always needs you now, whatever the kind", () => {
  expect(needOf(p("quiet-creator", "critical"))).toBe("now");
  expect(needOf(p("below-forecast", "critical"))).toBe("now");
});

test("groupByNeed keeps display order, drops empty groups, and keeps rank within a group", () => {
  const a = { id: "a", ...p("review-draft") };
  const b = { id: "b", ...p("quiet-creator", "critical") };
  const c = { id: "c", ...p("boost-post") };
  const groups = groupByNeed([a, b, c]);
  expect(groups.map((g) => g.label)).toEqual([NEED_LABEL.now, NEED_LABEL.ready]);
  expect(groups[0].items).toEqual([b]);
  expect(groups[1].items).toEqual([a, c]);
  expect(groupByNeed([])).toEqual([]);
});

test("each proposal kind lands on the tab of its phase", () => {
  expect(PROPOSAL_PHASE).toEqual({
    "state-goal": "Plan",
    "approve-lineup": "Plan",
    "info-request": "Plan",
    "quiet-creator": "Make",
    "review-draft": "Make",
    "boost-post": "Run",
    "below-forecast": "Run",
  });
});
