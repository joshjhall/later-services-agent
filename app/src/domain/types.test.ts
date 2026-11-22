import { type Campaign, type CampaignPhase, campaignPhase } from "./types";

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
