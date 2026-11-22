import { render } from "@testing-library/react";
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
