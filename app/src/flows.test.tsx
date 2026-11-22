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
  // Only lineup members count: as a backup, Hana keeps her chip but leaves the tally.
  fireEvent.click(hana.getByRole("radio", { name: "Backup" }));
  expect(screen.getByText("Needs: rate and usage rights")).toBeInTheDocument();
  expect(screen.queryByText("Open items")).not.toBeInTheDocument();
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
  expect(lineupTotals(candidates, { ...all, "@hanahosts": "backup" }, 72_000)).toMatchObject({
    open: 0,
  });
  // Every incomplete lineup member counts.
  const twoOpen = candidates.map((c) =>
    c.handle === "@riocooks" ? { ...c, missing: ["rate"] } : c,
  );
  expect(lineupTotals(twoOpen, all, 72_000)).toMatchObject({ open: 2 });
});

test("open-item copy uses the Oxford comma and plural wording", async () => {
  const { needsLabel, openItemsLabel } = await import("@/views/LineupView");
  expect(needsLabel(["rate", "usage rights", "term"])).toBe("Needs: rate, usage rights, and term");
  expect(openItemsLabel(1)).toBe("1 member still needs details");
  expect(openItemsLabel(2)).toBe("2 members still need details");
});

/** One record, any actor: explicit actors, and undo only for what never left the system. */

const entry = (text: RegExp) =>
  screen
    .getAllByTestId("activity-entry")
    .find((el) => text.test(el.textContent ?? "")) as HTMLElement;

test("activity: one record shows system, agent, and named people as explicit actors", () => {
  renderApp();
  go("#activity");
  expect(screen.getByRole("heading", { level: 1, name: "Activity" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /Activity/ })).toBeInTheDocument();
  expect(within(entry(/Draft reminder sent to Ana/)).getByText("system")).toBeInTheDocument();
  expect(within(entry(/Pulled 72h metrics/)).getByText("agent")).toBeInTheDocument();
  expect(within(entry(/Called Ana/)).getByText("Jordan")).toBeInTheDocument();
  expect(within(entry(/Approved lineup/)).getByText("Maya")).toBeInTheDocument();
});

test("activity: internal actions can be undone; anything sent is permanent", () => {
  renderApp();
  go("#activity");
  expect(
    within(entry(/Pulled 72h metrics/)).getByRole("button", { name: /Undo/ }),
  ).toBeInTheDocument();
  const reminder = entry(/Draft reminder sent to Ana/);
  expect(within(reminder).queryByRole("button", { name: /Undo/ })).toBeNull();
  expect(reminder).toHaveTextContent("Permanent: Sent");
});

test("activity: a decision that sends is recorded under Maya with no undo", () => {
  renderApp();
  const card = screen
    .getByText(/Rio Castillo's draft misses/)
    .closest("[data-severity]") as HTMLElement;
  fireEvent.click(within(card).getByRole("button", { name: "Send fix request" }));
  go("#activity");
  const decision = entry(/Chose "Send fix request"/);
  expect(within(decision).getByText("Maya")).toBeInTheDocument();
  expect(within(decision).queryByRole("button", { name: /Undo/ })).toBeNull();
});

test("undo rule and the #log alias", async () => {
  const { isUndoable } = await import("@/domain/types");
  const { parse } = await import("@/router");
  expect(isUndoable({ effect: "internal" })).toBe(true);
  expect(isUndoable({ effect: "external" })).toBe(false);
  expect(isUndoable({ effect: "spend" })).toBe(false);
  expect(parse("#log")).toEqual({ view: "activity" });
});

test("activity: the outcome of a call is recorded as permanent", () => {
  renderApp();
  const card = screen.getByText(/Ana Reyes is quiet/).closest("[data-severity]") as HTMLElement;
  fireEvent.click(within(card).getByRole("button", { name: "Call Ana" }));
  fireEvent.click(
    within(screen.getByRole("dialog")).getByRole("button", { name: /She'll deliver Friday/ }),
  );
  go("#activity");
  const outcome = entry(/Chose "Extend 2 days"/);
  expect(within(outcome).getByText("Maya")).toBeInTheDocument();
  expect(within(outcome).queryByRole("button", { name: /Undo/ })).toBeNull();
  expect(outcome).toHaveTextContent("Permanent: Sent");
});

test("activity: spending from the reserve is recorded as permanent", () => {
  renderApp();
  const card = screen.getByText(/post from reserve/).closest("[data-severity]") as HTMLElement;
  fireEvent.click(within(card).getByRole("button", { name: "Boost $8,000" }));
  go("#activity");
  const spend = entry(/Chose "Boost \$8,000"/);
  expect(within(spend).queryByRole("button", { name: /Undo/ })).toBeNull();
  expect(spend).toHaveTextContent("Permanent: Spent");
});

test("store: an option it can't match is recorded as permanent, never undoable", async () => {
  const { renderHook } = await import("@testing-library/react");
  const { StoreProvider, useStore } = await import("@/domain/store");
  const { result } = renderHook(() => useStore(), { wrapper: StoreProvider });
  const p = result.current.proposals[0];
  act(() => result.current.resolve(p, "no-such-option"));
  expect(result.current.activity[0]).toMatchObject({ actor: "Maya", effect: "external" });
});
