import { type Campaign, type CampaignPhase, campaignPhase, kpiPct } from "./types";

// Source of truth: docs/information-architecture.md ("Plan → Make → Run"). Hard-coded so drift fails here.
test.each<[Campaign["stage"], CampaignPhase]>([
  ["goal", "Plan"],
  ["lineup", "Plan"],
  ["production", "Make"],
  ["live", "Run"],
  ["wrap", "Run"],
])("the %s stage is in the %s phase", (stage, phase) => {
  expect(campaignPhase({ stage })).toBe(phase);
});

test("kpiPct paces against target, caps at 100, and treats a target of 0 as empty", () => {
  expect(kpiPct({ target: 200, actual: 50 })).toBe(25);
  expect(kpiPct({ target: 100, actual: 250 })).toBe(100);
  expect(kpiPct({ target: 0, actual: 120 })).toBe(0);
  expect(kpiPct({ target: 0, actual: 0 })).toBe(0);
});
