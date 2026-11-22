import { fireEvent, render, screen, within } from "@testing-library/react";
import { StoreProvider, useStore } from "@/domain/store";
import type { Comparison } from "@/domain/types";
import type { Route } from "@/router";
import { useRail } from "./Rail";
import { CompareView, WIDGETS } from "./widgets";

const peer = (name: string, value: number) => ({ name, value });
const comparison = (peers: Comparison["peers"]): Comparison => ({
  campaignId: "x",
  metric: "CTR",
  unit: "%",
  value: 1,
  peers,
});

test("compare: no comparables falls back to the category benchmark", () => {
  const { container } = render(
    <CompareView name="This" benchmark={{ metric: "CTR", unit: "%", value: 0.9 }} />,
  );
  expect(container.querySelector("[data-layout]")).toHaveAttribute("data-layout", "none");
  expect(screen.getByText("No comparable campaigns yet.")).toBeInTheDocument();
  expect(screen.getByText(/Category benchmark: CTR 0.9%/)).toBeInTheDocument();
});

test("compare: one comparable shows side by side", () => {
  const { container } = render(
    <CompareView name="This" comparison={comparison([peer("Last spring", 1.4)])} />,
  );
  expect(container.querySelector("[data-layout]")).toHaveAttribute("data-layout", "pair");
  expect(screen.getAllByRole("listitem")).toHaveLength(2);
});

test("compare: several comparables show a ranked list with this one marked", () => {
  const { container } = render(
    <CompareView
      name="This"
      comparison={comparison([peer("A", 2), peer("B", 0.5), peer("C", 1.5)])}
    />,
  );
  expect(container.querySelector("[data-layout]")).toHaveAttribute("data-layout", "ranked");
  const rows = screen.getAllByRole("listitem");
  expect(rows.map((r) => r.textContent?.split(/\d/)[0].trim())).toEqual([
    "A",
    "C",
    "This (this one)",
    "B",
  ]);
  expect(rows[2]).toHaveAttribute("aria-current", "true");
  expect(screen.getByText("CTR: 3 of 4 similar campaigns")).toBeInTheDocument();
});

// Each widget's own empty state, given a scope with nothing in it.
test.each<[keyof typeof WIDGETS, RegExp]>([
  ["summary", /Nothing needs you here/],
  ["activity", /No activity here yet/],
  ["next-message", /Nothing scheduled/],
  ["compare", /Open a campaign to compare it/],
])("%s has an empty state", (id, text) => {
  const { Widget } = WIDGETS[id];
  render(
    <StoreProvider>
      <Widget scope={[]} />
    </StoreProvider>,
  );
  expect(screen.getByText(text)).toBeInTheDocument();
});

function RailHarness({ route }: { route: Route }) {
  const rail = useRail(route);
  const { activity } = useStore();
  return (
    <>
      <div data-testid="rail">{rail}</div>
      <output data-testid="count">{activity.length}</output>
    </>
  );
}

const widgets = () =>
  [...screen.getByTestId("rail").querySelectorAll("[data-widget]")].map((w) =>
    w.getAttribute("data-widget"),
  );

test("a campaign's rail renders the selected widgets, with its own comparison", () => {
  render(
    <StoreProvider>
      <RailHarness route={{ view: "campaign", id: "cmp-trail-season" }} />
    </StoreProvider>,
  );
  expect(widgets()).toEqual(["summary", "compare", "next-message", "activity"]);
  expect(screen.getByText("CTR, side by side")).toBeInTheDocument();
});

test("send now records one entry, and the widget drops out once nothing is queued", () => {
  render(
    <StoreProvider>
      <RailHarness route={{ view: "campaign", id: "cmp-trail-season" }} />
    </StoreProvider>,
  );
  const before = Number(screen.getByTestId("count").textContent);
  const card = screen
    .getByTestId("rail")
    .querySelector('[data-widget="next-message"]') as HTMLElement;
  fireEvent.click(within(card).getByRole("button", { name: /Send now/ }));
  expect(Number(screen.getByTestId("count").textContent)).toBe(before + 1);
  expect(widgets()).toEqual(["summary", "compare", "activity"]);
});

test("no rail on the roster", () => {
  render(
    <StoreProvider>
      <RailHarness route={{ view: "roster" }} />
    </StoreProvider>,
  );
  expect(screen.getByTestId("rail")).toBeEmptyDOMElement();
});
