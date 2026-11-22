import { render, screen } from "@testing-library/react";
import { fmt } from "@/agent/rules";
import { campaigns } from "@/domain/fixtures";
import { StoreProvider } from "@/domain/store";
import { type Campaign, kpiPct } from "@/domain/types";
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
test("KPI bars expose their value to assistive tech", () => {
  const campaign = campaigns[0];
  render(
    <StoreProvider>
      <CampaignWidget campaign={campaign} />
    </StoreProvider>,
  );
  for (const k of campaign.kpis) {
    const bar = screen.getByRole("progressbar", { name: k.metric });
    expect(bar).toHaveAttribute("aria-valuenow", String(kpiPct(k)));
    expect(bar).toHaveAttribute(
      "aria-valuetext",
      `${fmt(k.actual, k.unit)} of ${fmt(k.target, k.unit)}`,
    );
  }
});
