import {
  groupByNeed,
  NEED_LABEL,
  needOf,
  PHASE_TAB,
  PROPOSAL_PHASE,
  proposalTab,
  splitToday,
} from "./needs";
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

test("an unmapped kind falls back to Things to do instead of vanishing", () => {
  expect(needOf({ kind: "new-kind" as Kind, severity: "info" })).toBe("todo");
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

test("splitToday moves settled proposals out of their group, hiding a group left empty", () => {
  const a = { id: "a", ...p("review-draft") };
  const b = { id: "b", ...p("quiet-creator") };
  const c = { id: "c", ...p("boost-post") };
  const d = { id: "d", ...p("review-draft") };
  const { groups, handled } = splitToday([a, b, c, d], (x) => x.id === "b" || x.id === "c");
  expect(groups.map((g) => g.label)).toEqual([NEED_LABEL.ready]);
  expect(groups[0].items).toEqual([a, d]);
  expect(handled).toEqual([b, c]);
  expect(splitToday([a], () => false)).toEqual({ groups: groupByNeed([a]), handled: [] });
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

test("proposalTab puts each kind on its phase's tab", () => {
  const tabs = Object.fromEntries(
    (Object.keys(PROPOSAL_PHASE) as Kind[]).map((kind) => [kind, proposalTab({ kind })]),
  );
  expect(tabs).toEqual({
    "state-goal": "plan",
    "approve-lineup": "plan",
    "info-request": "plan",
    "quiet-creator": "make",
    "review-draft": "make",
    "boost-post": "run",
    "below-forecast": "run",
  });
  expect(new Set(Object.values(PHASE_TAB))).toEqual(new Set(["plan", "make", "run"]));
});
