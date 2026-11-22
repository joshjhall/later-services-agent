import type { Proposal } from "@/agent/rules";
import { isAbout } from "./scope";
import { summarize } from "./summary";

type P = Pick<Proposal, "kind" | "severity" | "title">;
const quiet: P = { kind: "quiet-creator", severity: "critical", title: "Ana is quiet" };
const review: P = {
  kind: "review-draft",
  severity: "warning",
  title: "Rio's draft misses 1 check",
};
const boost: P = { kind: "boost-post", severity: "info", title: "Boost Mei's post" };
const pacing: P = {
  kind: "below-forecast",
  severity: "warning",
  title: "CTR pacing below forecast",
};

test("nothing open says the agent is handling it", () => {
  expect(summarize([])).toBe("Nothing needs you here. The agent is handling it.");
});

test("one urgent item", () => {
  expect(summarize([quiet])).toBe("The one open item needs you now. Start with “Ana is quiet”.");
});

test("mixed needs lead with what needs you, then count the rest with an Oxford comma", () => {
  const waiting: P = { kind: "quiet-creator", severity: "warning", title: "Jules is slow" };
  expect(summarize([review, quiet, boost, waiting, pacing])).toBe(
    "1 of 5 open items needs you now. Start with “Ana is quiet”. The rest: 2 ready to move, 1 waiting on someone, and 1 to do later.",
  );
});

test("nothing urgent points at the first ready item", () => {
  expect(summarize([pacing, review])).toBe(
    "Nothing urgent in 2 open items: 1 ready to move and 1 to do later. Start with “Rio's draft misses 1 check”.",
  );
});

test("activity matches campaigns by short name", () => {
  expect(isAbout({ target: "Rio Castillo · Sparkling Citrus" }, "Sparkling Citrus launch")).toBe(
    true,
  );
  expect(isAbout({ target: "Trail season" }, "Trail season")).toBe(true);
  expect(isAbout({ target: "Trail season" }, "Sparkling Citrus launch")).toBe(false);
});
