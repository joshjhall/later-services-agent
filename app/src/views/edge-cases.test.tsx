import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { App } from "@/App";
import { ThemeProvider } from "@/theme/ThemeProvider";

/**
 * Cases the demo fixtures never hit: a campaign with nothing open (so On track
 * has an entry) and a KPI with a target of 0. One extra campaign covers both.
 */
vi.mock("@/domain/fixtures", async (importOriginal) => {
  const fx = await importOriginal<typeof import("@/domain/fixtures")>();
  return {
    ...fx,
    campaigns: [
      ...fx.campaigns,
      {
        id: "cmp-quiet-week",
        accountId: "acc-brightside",
        name: "Quiet week",
        objective: "awareness",
        // Actuals over a target of 0 are never below forecast, so this campaign has no
        // card; unguarded, 120 / 0 is Infinity and the bar would read as full.
        kpis: [{ metric: "Saves", target: 0, actual: 120 }],
        budget: 10_000,
        committed: 8_000,
        reserve: 2_000,
        start: "2026-11-01",
        end: "2026-11-30",
        stage: "live",
      },
    ],
  };
});

const go = (hash: string) =>
  act(() => {
    location.hash = hash;
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  });

const renderApp = () =>
  render(
    <ThemeProvider>
      <App />
    </ThemeProvider>,
  );

beforeEach(() => {
  location.hash = "";
  window.matchMedia ??= ((q: string) => ({
    matches: false,
    media: q,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
});

test("today: a campaign with nothing open is listed under On track, linked", () => {
  renderApp();
  const trigger = screen.getByRole("button", { name: "On track · 1 campaign" });
  fireEvent.click(trigger);
  const region = screen.getByRole("region", { name: /On track/ });
  expect(within(region).getByRole("link", { name: "Quiet week" })).toHaveAttribute(
    "href",
    "#campaign/cmp-quiet-week",
  );
  expect(within(region).queryByText(/None yet/)).toBeNull();
});

test("campaign: a KPI with a target of 0 shows an empty bar, not a full one or NaN", () => {
  renderApp();
  go("#campaign/cmp-quiet-week");
  expect(screen.getByRole("tab", { selected: true })).toHaveTextContent("Run");
  const run = screen.getByRole("tabpanel");
  expect(within(run).getByText("Saves")).toBeInTheDocument();
  // Empty bar: the indicator is shifted fully left. (Progress sets no aria-valuenow.)
  const indicator = within(run)
    .getByRole("progressbar")
    .querySelector<HTMLElement>('[data-slot="progress-indicator"]');
  expect(indicator?.style.transform).toBe("translateX(-100%)");
  expect(run.textContent).not.toMatch(/NaN|Infinity/);
});
