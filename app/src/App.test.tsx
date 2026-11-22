import { fireEvent, render, screen, within } from "@testing-library/react";
import { App } from "@/App";
import { ThemeProvider } from "@/theme/ThemeProvider";

const renderApp = () =>
  render(
    <ThemeProvider>
      <App />
    </ThemeProvider>,
  );

beforeEach(() => {
  location.hash = "";
  // jsdom lacks matchMedia, which the sidebar's mobile hook uses.
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

test("Today shows the quiet-creator escalation first, and injects the palette", () => {
  renderApp();
  expect(screen.getByRole("heading", { level: 1, name: "Today" })).toBeInTheDocument();
  const first = screen.getAllByText(/is quiet/)[0];
  expect(first).toHaveTextContent("Ana Reyes is quiet");
  expect(document.getElementById("md3-palette")?.textContent).toContain("--primary:");
});

test("resolving a proposal records it once and logs it", () => {
  renderApp();
  const card = screen.getByText(/Ana Reyes is quiet/).closest("[data-severity]") as HTMLElement;
  fireEvent.click(within(card).getByRole("button", { name: "Extend 2 days" }));
  expect(within(card).getByText(/Extend 2 days · logged/)).toBeInTheDocument();
  expect(within(card).queryByRole("button", { name: "Swap to Ben" })).toBeNull();
});

test("the top bar breadcrumb follows the route", async () => {
  location.hash = "#lineup/cmp-holiday-gifting";
  renderApp();
  const crumb = within(screen.getByRole("navigation", { name: "breadcrumb" }));
  expect(crumb.getByRole("link", { name: "Brightside Beverages" })).toHaveAttribute(
    "href",
    "#account/acc-brightside",
  );
  expect(crumb.getByRole("link", { name: "Holiday gifting" })).toHaveAttribute(
    "href",
    "#campaign/cmp-holiday-gifting",
  );
  expect(crumb.getByText("Lineup")).toHaveAttribute("aria-current", "page");
});

test("Find or ask opens from the button, ⌘K, and /, but not / while typing", async () => {
  renderApp();
  const dialog = () => screen.queryByRole("dialog", { name: "Find or ask" });
  const close = () => fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });

  fireEvent.click(screen.getByRole("button", { name: /Find or ask/ }));
  expect(await screen.findByRole("dialog", { name: "Find or ask" })).toBeInTheDocument();
  close();
  expect(dialog()).toBeNull();

  fireEvent.keyDown(document.body, { key: "k", metaKey: true });
  expect(dialog()).toBeInTheDocument();
  close();

  fireEvent.keyDown(document.body, { key: "/" });
  expect(dialog()).toBeInTheDocument();
  close();

  const input = document.createElement("input");
  document.body.append(input);
  fireEvent.keyDown(input, { key: "/" });
  expect(dialog()).toBeNull();
  input.remove();
});

test("every destination stays reachable", () => {
  renderApp();
  for (const name of ["Today", "Brightside Beverages", "Roster", "Agent log"]) {
    expect(screen.getAllByRole("link", { name: new RegExp(name) }).length).toBeGreaterThan(0);
  }
});
