import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { App } from "@/App";
import { ThemeProvider } from "@/theme/ThemeProvider";

/** The three moments the brief requires: state the goal, review the lineup, the hard moment. */

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

test("stating the goal: agent draft is editable and changing the objective is called out", () => {
  renderApp();
  go("#goal/cmp-spring-serum");
  expect(screen.getByRole("heading", { level: 1, name: /Goal: Spring serum/ })).toBeInTheDocument();
  const reach = screen.getByLabelText("Reach target") as HTMLInputElement;
  fireEvent.change(reach, { target: { value: "30M" } });
  expect(reach.value).toBe("30M");
  fireEvent.click(screen.getByRole("radio", { name: "Conversion" }));
  expect(screen.getByText(/You changed the objective/)).toBeInTheDocument();
});

test("reviewing the lineup: conflicted creator starts removed; fees update live", () => {
  renderApp();
  go("#lineup/cmp-holiday-gifting");
  const theo = within(screen.getByRole("radiogroup", { name: "Role for Theo Grant" }));
  expect(theo.getByRole("radio", { name: "Remove" })).toHaveAttribute("aria-checked", "true");
  expect(screen.getByRole("button", { name: /Approve lineup/ })).toBeEnabled();
  // Default picks: $37.5K of $72K. Lowering the budget isn't possible here, so
  // check the guard via the summary instead: adding Theo stays within budget.
  fireEvent.click(theo.getByRole("radio", { name: "In lineup" }));
  expect(screen.getByText("$54K / $72K")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Approve lineup/ })).toBeEnabled();
});

test("reviewing the lineup: an incomplete candidate shows its gaps and can still join", () => {
  renderApp();
  go("#lineup/cmp-holiday-gifting");
  expect(screen.getByText("Needs: rate and usage rights")).toBeInTheDocument();
  const hana = within(screen.getByRole("radiogroup", { name: "Role for Hana Sato" }));
  expect(hana.getByRole("radio", { name: "In lineup" })).toHaveAttribute("aria-checked", "true");
  expect(screen.getByText("1 member still needs details")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Approve lineup/ })).toBeEnabled();
});

test("hard moment: Call opens the brief, and the outcome resolves the escalation", () => {
  renderApp();
  const card = screen.getByText(/Ana Reyes is quiet/).closest("[data-severity]") as HTMLElement;
  fireEvent.click(within(card).getByRole("button", { name: "Call Ana" }));
  const sheet = screen.getByRole("dialog");
  expect(within(sheet).getByText(/Call brief: Ana/)).toBeInTheDocument();
  // Same action, same label on the card and in the sheet.
  expect(within(sheet).getByRole("button", { name: "Swap to Ben" })).toBeInTheDocument();
  fireEvent.click(within(sheet).getByRole("button", { name: /She'll deliver Friday/ }));
  expect(within(card).getByText(/Extend 2 days · logged/)).toBeInTheDocument();
});

test("lineup totals block approval when creator fees exceed the budget", async () => {
  const { lineupTotals } = await import("@/views/LineupView");
  const { lineupDrafts } = await import("@/agent/drafts");
  const { candidates } = lineupDrafts["cmp-holiday-gifting"];
  const all = Object.fromEntries(candidates.map((c) => [c.handle, "core" as const]));
  // Hana's open rate and usage rights are counted but don't block approval.
  expect(lineupTotals(candidates, all, 72_000)).toMatchObject({
    fees: 58_000,
    over: false,
    open: 1,
  });
  expect(lineupTotals(candidates, all, 50_000)).toMatchObject({ over: true });
});
