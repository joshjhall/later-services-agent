import { fireEvent, render, screen, within } from "@testing-library/react";
import { App } from "@/App";
import { ThemeProvider } from "@/theme/ThemeProvider";

/** The core view, not the context rail. The innermost <main> is ShellLayout's. */
const core = () => screen.getAllByRole("main").at(-1) as HTMLElement;

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
  const first = within(core()).getAllByText(/is quiet/)[0];
  expect(first).toHaveTextContent("Ana Reyes is quiet");
  expect(document.getElementById("md3-palette")?.textContent).toContain("--primary:");
});

test("resolving a proposal records it once and logs it", () => {
  renderApp();
  const card = within(core())
    .getByText(/Ana Reyes is quiet/)
    .closest("[data-severity]") as HTMLElement;
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
  // The fictional-data notice lives in the top bar, so collapsing the sidebar never hides it.
  const topBar = screen.getByRole("button", { name: /Find or ask/ }).closest("header");
  expect(topBar).toHaveTextContent(/Prototype · fictional data/);
});

test("Find or ask opens from the button, ⌘K, Ctrl+K, and /, but not / while typing", async () => {
  renderApp();
  const dialog = () => screen.queryByRole("dialog", { name: "Find or ask" });
  const close = () => fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });

  fireEvent.click(screen.getByRole("button", { name: /Find or ask/ }));
  expect(await screen.findByRole("dialog", { name: "Find or ask" })).toBeInTheDocument();
  close();
  expect(dialog()).toBeNull();

  // fireEvent returns false when the handler called preventDefault().
  for (const init of [{ key: "k", metaKey: true }, { key: "k", ctrlKey: true }, { key: "/" }]) {
    expect(fireEvent.keyDown(document.body, init)).toBe(false);
    expect(dialog()).toBeInTheDocument();
    close();
  }

  expect(fireEvent.keyDown(document.body, { key: "/", ctrlKey: true })).toBe(true);
  expect(dialog()).toBeNull();

  const editable = document.createElement("div");
  editable.contentEditable = "true";
  // jsdom does not implement isContentEditable.
  Object.defineProperty(editable, "isContentEditable", { value: true });
  const fields = [
    ..."input textarea select".split(" ").map((t) => document.createElement(t)),
    editable,
  ];
  for (const field of fields) {
    document.body.append(field);
    expect(fireEvent.keyDown(field, { key: "/" })).toBe(true);
    expect(dialog()).toBeNull();
    field.remove();
  }

  // Autofill keydowns carry no key; IME composition must pass through.
  const errors: unknown[] = [];
  const onError = (e: ErrorEvent) => {
    errors.push(e.error);
    e.preventDefault();
  };
  addEventListener("error", onError);
  document.body.dispatchEvent(new Event("keydown", { bubbles: true }));
  removeEventListener("error", onError);
  expect(errors).toEqual([]);
  expect(fireEvent.keyDown(document.body, { key: "k", metaKey: true, isComposing: true })).toBe(
    true,
  );
  expect(dialog()).toBeNull();
});

test("every destination stays reachable from the sidebar", () => {
  renderApp();
  const links = {
    Today: "#today",
    "Brightside Beverages": "#account/acc-brightside",
    Roster: "#roster",
    Activity: "#activity",
  };
  for (const [name, target] of Object.entries(links)) {
    expect(screen.getByRole("link", { name })).toHaveAttribute("href", target);
  }
});
