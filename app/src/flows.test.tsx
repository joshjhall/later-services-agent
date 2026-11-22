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

const entry = (text: RegExp): HTMLElement => {
  const found = screen
    .getAllByTestId("activity-entry")
    .find((el) => text.test(el.textContent ?? ""));
  if (!found) throw new Error(`No activity entry matches ${text}`);
  return found;
};

test("activity: one record shows system, agent, and named people as explicit actors", () => {
  renderApp();
  go("#activity");
  expect(screen.getByRole("heading", { level: 1, name: "Activity" })).toBeInTheDocument();
  // Sidebar and breadcrumb both link here now that the top bar exists.
  const links = screen.getAllByRole("link", { name: /Activity/ });
  expect(links.some((l) => l.getAttribute("href") === "#activity")).toBe(true);
  expect(within(entry(/Draft reminder sent to Ana/)).getByText("system")).toBeInTheDocument();
  expect(within(entry(/Pulled 72h metrics/)).getByText("agent")).toBeInTheDocument();
  expect(within(entry(/Called Ana/)).getByText("Jordan")).toBeInTheDocument();
  const approval = entry(/Approved Mei's draft/);
  expect(within(approval).getByText("Maya")).toBeInTheDocument();
  // The approval reached the creator, so it is permanent.
  expect(within(approval).queryByRole("button", { name: /Undo/ })).toBeNull();
});

test("activity: the seeded record agrees with the campaign data it describes", async () => {
  const fx = await import("@/domain/fixtures");
  const names = [...fx.creators, ...fx.campaigns].map((x) => x.name);
  for (const e of fx.activity) {
    // Each target names a real creator or campaign, and nothing is dated in the future.
    expect(names.some((n) => e.target.includes(n.split(" ")[0]))).toBe(true);
    expect(e.at <= fx.DEMO_TODAY).toBe(true);
  }
  // Ana is quiet: no one has reached her since her last contact.
  const ana = fx.deliverables.find((d) => d.id === "d-ana-1");
  const anaContact = fx.activity.filter(
    (e) => e.target.startsWith("Ana") && /draft moved|replied|confirmed/i.test(e.action),
  );
  expect(ana?.stage).toBe("drafting");
  expect(anaContact).toEqual([]);
});

test("activity: internal actions can be undone; anything sent is permanent", () => {
  renderApp();
  go("#activity");
  expect(
    within(entry(/Pulled 72h metrics/)).getByRole("button", { name: /Undo/ }),
  ).toBeInTheDocument();
  const reminder = entry(/Draft reminder sent to Ana/);
  expect(within(reminder).queryByRole("button", { name: /Undo/ })).toBeNull();
  expect(reminder).toHaveTextContent("Permanent");
});

test("draft: a fix request opens an editable draft, and sending records it once", () => {
  renderApp();
  const card = screen
    .getByText(/Rio Castillo's draft misses/)
    .closest("[data-severity]") as HTMLElement;
  fireEvent.click(within(card).getByRole("button", { name: "Send fix request" }));
  const sheet = screen.getByRole("dialog");
  expect(within(sheet).getByText(/Draft: fix request to Rio Castillo/)).toBeInTheDocument();
  const body = within(sheet).getByLabelText("Message") as HTMLTextAreaElement;
  fireEvent.change(body, { target: { value: "Hi Rio, one fix: #ad on screen, please." } });
  expect(body.value).toMatch(/one fix/);
  fireEvent.click(within(sheet).getByRole("button", { name: /Send/ }));
  expect(within(card).getByText(/Send fix request · logged/)).toBeInTheDocument();
  go("#activity");
  const sent = entry(/Sent fix request to Rio Castillo · from Maya's team/);
  expect(within(sent).getByText("Maya")).toBeInTheDocument();
  expect(within(sent).queryByRole("button", { name: /Undo/ })).toBeNull();
  expect(sent).toHaveTextContent("Permanent");
  // One record per send: no separate "Chose" entry for the same decision.
  expect(screen.queryByText(/Chose "Send fix request"/)).toBeNull();
});

test("draft: closing without sending records nothing and leaves the card open", () => {
  renderApp();
  const card = screen
    .getByText(/Rio Castillo's draft misses/)
    .closest("[data-severity]") as HTMLElement;
  fireEvent.click(within(card).getByRole("button", { name: "Send fix request" }));
  fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Not yet" }));
  expect(within(card).getByRole("button", { name: "Send fix request" })).toBeInTheDocument();
  go("#activity");
  expect(screen.queryByText(/Sent fix request/)).toBeNull();
});

test("information request: names its class, assumption, and consequence; drafts the email", () => {
  renderApp();
  const card = screen
    .getByText(/Confirm Ana's audience is mostly US/)
    .closest("[data-severity]") as HTMLElement;
  expect(within(card).getByText("Information request")).toBeInTheDocument();
  expect(within(card).getByText("Assumed")).toBeInTheDocument();
  expect(within(card).getByText(/assumed Ana's audience is mostly US/)).toBeInTheDocument();
  expect(within(card).getByText(/reach estimate drops/)).toBeInTheDocument();
  fireEvent.click(within(card).getByRole("button", { name: "Draft the email" }));
  const sheet = screen.getByRole("dialog");
  expect(within(sheet).getByText(/Draft: info request to Northstar Talent/)).toBeInTheDocument();
  fireEvent.click(within(sheet).getByRole("button", { name: /Send/ }));
  go("#activity");
  expect(entry(/Sent info request to Northstar Talent/)).toHaveTextContent("Permanent");
});

test("information request: marking it confirmed stays inside the tool, so it can be undone", () => {
  renderApp();
  const card = screen
    .getByText(/Confirm Ana's audience is mostly US/)
    .closest("[data-severity]") as HTMLElement;
  fireEvent.click(within(card).getByRole("button", { name: "Mark confirmed" }));
  go("#activity");
  const decision = entry(/Chose "Mark confirmed"/);
  expect(within(decision).getByRole("button", { name: /Undo/ })).toBeInTheDocument();
});

test("stating the goal: confirming opens the client email draft, and sending logs it", () => {
  renderApp();
  go("#goal/cmp-spring-serum");
  fireEvent.click(screen.getByRole("button", { name: "Confirm and draft client email" }));
  const sheet = screen.getByRole("dialog");
  expect(within(sheet).getByText(/Draft: client email to Priya Rao/)).toBeInTheDocument();
  fireEvent.click(within(sheet).getByRole("button", { name: /Send/ }));
  expect(screen.getByText(/Ready for client · logged/)).toBeInTheDocument();
  go("#activity");
  expect(entry(/Sent client email to Priya Rao/)).toHaveTextContent("Permanent");
});

test("stating the goal: closing the client email draft leaves the goal unconfirmed", () => {
  renderApp();
  go("#goal/cmp-spring-serum");
  fireEvent.click(screen.getByRole("button", { name: "Confirm and draft client email" }));
  fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Not yet" }));
  expect(screen.queryByText(/Ready for client · logged/)).toBeNull();
  expect(
    screen.getByRole("button", { name: "Confirm and draft client email" }),
  ).toBeInTheDocument();
});

test("draft: a double-click on Send records one entry", () => {
  renderApp();
  const card = screen
    .getByText(/Rio Castillo's draft misses/)
    .closest("[data-severity]") as HTMLElement;
  fireEvent.click(within(card).getByRole("button", { name: "Send fix request" }));
  const send = within(screen.getByRole("dialog")).getByRole("button", { name: /Send/ });
  act(() => {
    send.click();
    send.click();
  });
  go("#activity");
  expect(screen.getAllByText(/Sent fix request to Rio Castillo/)).toHaveLength(1);
});

test("store: sending a draft for an already-resolved proposal keeps the first decision", async () => {
  const { renderHook } = await import("@testing-library/react");
  const { StoreProvider, useStore } = await import("@/domain/store");
  const { messageDrafts } = await import("@/agent/drafts");
  const { result } = renderHook(() => useStore(), { wrapper: StoreProvider });
  const p = result.current.proposals.find((x) => x.id === "info:cmp-holiday-gifting:cr-ana");
  if (!p) throw new Error("info request missing");
  act(() => result.current.resolve(p, "confirmed"));
  const before = result.current.activity.length;
  act(() =>
    result.current.send(messageDrafts["info:cr-ana"], { proposal: p, optionId: "draft-email" }),
  );
  act(() =>
    result.current.send(messageDrafts["info:cr-ana"], { proposal: p, optionId: "draft-email" }),
  );
  expect(result.current.resolved[p.id].optionId).toBe("confirmed");
  // The message still went out, once.
  expect(result.current.activity.length).toBe(before + 1);
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
  expect(outcome).toHaveTextContent("Permanent");
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

test("activity: a decision that stays inside the tool can be undone", async () => {
  renderApp();
  const card = screen.getByText(/post from reserve/).closest("[data-severity]") as HTMLElement;
  fireEvent.click(within(card).getByRole("button", { name: "Not now" }));
  go("#activity");
  const decision = entry(/Chose "Not now"/);
  expect(within(decision).getByText("Maya")).toBeInTheDocument();
  fireEvent.click(within(decision).getByRole("button", { name: /Undo/ }));
  expect(await screen.findByText("Undo is simulated in the prototype.")).toBeInTheDocument();
});

test("today: the handled count is the agent's own work, not people's decisions", () => {
  renderApp();
  const handled = /The agent handled 2 things on its own today/;
  expect(screen.getByText(handled)).toBeInTheDocument();
  const card = screen.getByText(/post from reserve/).closest("[data-severity]") as HTMLElement;
  fireEvent.click(within(card).getByRole("button", { name: "Not now" }));
  expect(screen.getByText(handled)).toBeInTheDocument();
});

test("store: an option it can't match is recorded as permanent, never undoable", async () => {
  const { renderHook } = await import("@testing-library/react");
  const { StoreProvider, useStore } = await import("@/domain/store");
  const { result } = renderHook(() => useStore(), { wrapper: StoreProvider });
  const p = result.current.proposals[0];
  act(() => result.current.resolve(p, "no-such-option"));
  expect(result.current.activity[0]).toMatchObject({ actor: "Maya", effect: "external" });
});

test("today: proposals sit under need headings, and on-track campaigns collapse to a count", () => {
  renderApp();
  const headings = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
  expect(headings[0]).toMatch(/^Needs you now/);
  const order = [
    "Needs you now",
    "Ready to move",
    "Waiting on someone",
    "Things to do",
    "On track",
  ];
  const seen = order.filter((l) => headings.some((h) => h?.startsWith(l)));
  expect(headings.map((h) => order.find((l) => h?.startsWith(l)))).toEqual(seen);
  const now = screen.getByRole("region", { name: /Needs you now/ });
  expect(within(now).getAllByText(/is quiet/)[0]).toHaveTextContent("Ana Reyes is quiet");
  const onTrack = screen.getByRole("button", { name: /On track · \d+ campaigns?/ });
  expect(onTrack).toHaveAttribute("aria-expanded", "false");
});

test("campaign: tabs default to the campaign's current phase", () => {
  renderApp();
  const expected = {
    "cmp-holiday-gifting": "Plan",
    "cmp-spring-serum": "Plan",
    "cmp-trail-season": "Run",
    "cmp-sparkling-launch": "Make",
  } as const;
  for (const [id, phase] of Object.entries(expected)) {
    go(`#campaign/${id}`);
    expect(screen.getByRole("tab", { selected: true })).toHaveTextContent(phase);
  }
});

test("campaign: choosing a tab deep-links it, and goal and lineup links still land", () => {
  renderApp();
  go("#campaign/cmp-holiday-gifting");
  const plan = screen.getByRole("tabpanel");
  expect(within(plan).getByRole("link", { name: /Lineup/ })).toHaveAttribute(
    "href",
    "#lineup/cmp-holiday-gifting",
  );
  fireEvent.mouseDown(screen.getByRole("tab", { name: /Make/ }));
  expect(location.hash).toBe("#campaign/cmp-holiday-gifting/make");
  go("#campaign/cmp-holiday-gifting/make");
  expect(screen.getByRole("tab", { selected: true })).toHaveTextContent("Make");
  expect(screen.getByText("Creators and deliverables")).toBeInTheDocument();
  go("#lineup/cmp-holiday-gifting");
  expect(
    screen.getByRole("heading", { level: 1, name: /Lineup: Holiday gifting/ }),
  ).toBeInTheDocument();
  go("#goal/cmp-spring-serum");
  expect(screen.getByRole("heading", { level: 1, name: /Goal: Spring serum/ })).toBeInTheDocument();
});

test("campaign: the Run tab shows pacing and only Run proposals", () => {
  renderApp();
  go("#campaign/cmp-trail-season/run");
  const run = screen.getByRole("tabpanel");
  expect(within(run).getByText("Pacing against targets")).toBeInTheDocument();
  expect(within(run).getAllByRole("progressbar").length).toBeGreaterThan(0);
  expect(within(run).queryByText("Creators and deliverables")).toBeNull();
  expect(within(run).queryByText(/is quiet/)).toBeNull();
});

test("today: on track counts campaigns with nothing on screen, and expands to them", () => {
  // Every demo campaign has a proposal on screen, so none is on track.
  renderApp();
  const trigger = screen.getByRole("button", { name: "On track · 0 campaigns" });
  fireEvent.click(trigger);
  expect(trigger).toHaveAttribute("aria-expanded", "true");
  const region = screen.getByRole("region", { name: /On track/ });
  expect(within(region).getByText("Every campaign needs something today.")).toBeInTheDocument();
  // Resolving a campaign's last card keeps it out of On track: it is still on screen.
  const card = screen.getByText(/Ana Reyes is quiet/).closest("[data-severity]") as HTMLElement;
  fireEvent.click(within(card).getByRole("button", { name: "Extend 2 days" }));
  expect(screen.getByRole("button", { name: "On track · 0 campaigns" })).toBeInTheDocument();
});

test("campaign: Plan explains a missing goal and lineup instead of showing no entry point", () => {
  renderApp();
  go("#campaign/cmp-trail-season/plan");
  expect(screen.getByText(/approved before this campaign moved on/)).toBeInTheDocument();
});
