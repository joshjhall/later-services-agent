import { render, screen } from "@testing-library/react";
import { campaigns } from "@/domain/fixtures";
import { StoreProvider } from "@/domain/store";
import type { Campaign } from "@/domain/types";
import { CampaignWidget } from "./CampaignWidget";

// The badge leads with the phase and keeps the stage as secondary text.
test.each<[Campaign["stage"], string]>([
  ["goal", "Plan · stating the goal"],
  ["lineup", "Plan · reviewing lineup"],
  ["production", "Make · in production"],
  ["live", "Run · live"],
  ["wrap", "Run · wrapping up"],
])("a %s campaign's badge reads “%s”", (stage, label) => {
  const { container } = render(
    <StoreProvider>
      <CampaignWidget campaign={{ ...campaigns[0], stage }} />
    </StoreProvider>,
  );
  const badge = container.querySelector('[data-slot="badge"]');
  expect(badge).not.toBeNull();
  expect(badge?.textContent).toBe(label);
});

// Screen readers get each KPI bar's metric, percent, and "actual of target".
// Literal values, so a regression in kpiPct or fmt can't hide on both sides.
test("KPI bars expose their value to assistive tech", () => {
  render(
    <StoreProvider>
      <CampaignWidget campaign={campaigns[0]} />
    </StoreProvider>,
  );
  const impressions = screen.getByRole("progressbar", { name: "Impressions" });
  expect(impressions).toHaveAttribute("aria-valuenow", "38");
  expect(impressions).toHaveAttribute("aria-valuetext", "11.4M of 30.0M");
  // Over target clamps to a full bar but still reads the real numbers.
  const engagement = screen.getByRole("progressbar", { name: "Engagement rate" });
  expect(engagement).toHaveAttribute("aria-valuenow", "100");
  expect(engagement).toHaveAttribute("aria-valuetext", "5.1% of 4.5%");
});
