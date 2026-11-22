import { groupByNeed, NEED_LABEL, needOf, PROPOSAL_PHASE } from "./needs";
import type { Proposal } from "./rules";

type Kind = Proposal["kind"];
const p = (kind: Kind, severity: Proposal["severity"] = "info") => ({ kind, severity });

test("needOf sorts every kind into a need", () => {
  expect(needOf(p("approve-lineup", "warning"))).toBe("now");
  expect(needOf(p("state-goal"))).toBe("now");
  expect(needOf(p("review-draft"))).toBe("ready");
  expect(needOf(p("boost-post"))).toBe("ready");
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

test("every proposal kind has a campaign phase", () => {
  const kinds: Kind[] = [
    "quiet-creator",
    "review-draft",
    "boost-post",
    "below-forecast",
    "approve-lineup",
    "state-goal",
  ];
  for (const k of kinds) expect(["Plan", "Make", "Run"]).toContain(PROPOSAL_PHASE[k]);
});
