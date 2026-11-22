import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { App } from "@/App";
import { openFindOrAsk } from "@/shell/FindOrAsk";
import { ThemeProvider } from "@/theme/ThemeProvider";

const SIMILAR_Q = "How does this campaign compare with similar campaigns?";

const rail = () => screen.getByRole("complementary", { name: "Context rail" });
const fullScreen = () => screen.queryByRole("dialog", { name: "Conversation" });
/** Navigate and route now: jsdom fires `hashchange` asynchronously. */
const go = (hash: string) =>
  act(() => {
    location.hash = hash;
    dispatchEvent(new HashChangeEvent("hashchange"));
  });

function renderApp(hash = "#campaign/cmp-sparkling-launch") {
  location.hash = hash;
  return render(
    <ThemeProvider>
      <App />
    </ThemeProvider>,
  );
}

/** Opens Find or ask and starts a conversation, asking `question` if given. */
function ask(question = "") {
  act(() => openFindOrAsk());
  fireEvent.change(screen.getByRole("combobox"), { target: { value: question } });
  fireEvent.click(screen.getByRole("option", { name: /Start a conversation/ }));
  return fullScreen() as HTMLElement;
}

function sendIn(frame: HTMLElement, text: string) {
  fireEvent.change(within(frame).getByRole("textbox", { name: "Message" }), {
    target: { value: text },
  });
  fireEvent.click(within(frame).getByRole("button", { name: /Send/ }));
}

beforeEach(() => {
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

afterEach(() => {
  location.hash = "";
});

test("docking moves the conversation into the rail, in place of the widgets", () => {
  renderApp();
  expect(rail().querySelector('[data-widget="compare"]')).not.toBeNull();
  fireEvent.click(within(ask("Why is Ana late?")).getByRole("button", { name: /Dock/ }));

  expect(fullScreen()).toBeNull();
  const docked = within(rail()).getByRole("region", { name: "Conversation" });
  expect(docked).toHaveTextContent(/Ben is the approved backup/);
  expect(rail().querySelector("[data-widget]")).toBeNull();
  // The text entry is the last thing in the rail.
  const box = within(docked).getByRole("textbox", { name: "Message" });
  expect(docked.lastElementChild?.contains(box)).toBe(true);
});

test("an unsent draft survives Dock and Expand", () => {
  renderApp();
  const chat = ask();
  fireEvent.change(within(chat).getByRole("textbox", { name: "Message" }), {
    target: { value: "half-typed" },
  });
  fireEvent.click(within(chat).getByRole("button", { name: /Dock/ }));
  expect(within(rail()).getByRole("textbox", { name: "Message" })).toHaveValue("half-typed");
  fireEvent.click(within(rail()).getByRole("button", { name: "Expand" }));
  expect(within(fullScreen() as HTMLElement).getByRole("textbox", { name: "Message" })).toHaveValue(
    "half-typed",
  );
});

test("a docked conversation survives navigation and follows the page", () => {
  renderApp();
  fireEvent.click(within(ask("Why is Ana late?")).getByRole("button", { name: /Dock/ }));

  // Roster and activity have no widget rail, but the docked conversation still shows.
  for (const hash of ["#roster", "#today"]) {
    go(hash);
    expect(within(rail()).getByText(/Ben is the approved backup/)).toBeInTheDocument();
  }
  const docked = within(rail()).getByRole("region", { name: "Conversation" });
  expect(within(docked).getByText(/^About:/)).toHaveTextContent(/^About: Portfolio$/);

  // Follow-ups are about the page you're on: Today has no post in view.
  sendIn(docked, "How does this compare with her last three?");
  expect(docked).toHaveTextContent(/Whose post do you mean/);

  // ⌘K still opens the palette while docked.
  act(() => openFindOrAsk());
  expect(screen.getByRole("dialog", { name: "Find or ask" })).toBeInTheDocument();
});

test("expand brings the same conversation back full screen, about the page you're on", () => {
  renderApp();
  fireEvent.click(within(ask("Why is Ana late?")).getByRole("button", { name: /Dock/ }));
  go("#today");
  fireEvent.click(within(rail()).getByRole("button", { name: "Expand" }));

  const chat = fullScreen() as HTMLElement;
  expect(chat).toHaveTextContent(/Ben is the approved backup/);
  expect(within(chat).getByText(/^About:/)).toHaveTextContent(/^About: Portfolio$/);
  // The full-screen dialog hides the page from assistive tech, so look past that.
  const behind = screen.getByRole("complementary", { name: "Context rail", hidden: true });
  expect(within(behind).queryByRole("region", { hidden: true })).toBeNull();
  expect(behind.querySelector('[data-widget="summary"]')).not.toBeNull();
});

test("closing the docked conversation gives the rail back to its widgets", () => {
  renderApp();
  fireEvent.click(within(ask()).getByRole("button", { name: /Dock/ }));
  fireEvent.change(within(rail()).getByRole("textbox", { name: "Message" }), {
    target: { value: "half-typed" },
  });
  fireEvent.click(within(rail()).getByRole("button", { name: "Close" }));
  expect(screen.queryByRole("region", { name: "Conversation" })).toBeNull();
  expect(rail().querySelector('[data-widget="compare"]')).not.toBeNull();
  // The closed conversation's draft doesn't carry into the next one.
  expect(within(ask()).getByRole("textbox", { name: "Message" })).toHaveValue("");
});

test("starting a new conversation while one is docked replaces it, full screen", () => {
  renderApp();
  fireEvent.click(within(ask("Why is Ana late?")).getByRole("button", { name: /Dock/ }));
  fireEvent.change(within(rail()).getByRole("textbox", { name: "Message" }), {
    target: { value: "half-typed" },
  });

  const chat = ask();
  expect(chat).not.toHaveTextContent(/Ben is the approved backup/);
  expect(within(chat).getByRole("textbox", { name: "Message" })).toHaveValue("");
  const behind = screen.getByRole("complementary", { name: "Context rail", hidden: true });
  expect(within(behind).queryByRole("region", { hidden: true })).toBeNull();
});

test("an answer can be a widget from the rail library, full screen and docked", () => {
  renderApp();
  const chat = ask(SIMILAR_Q);
  const answer = within(chat)
    .getByText(/same compare widget as the rail/)
    .closest("li");
  expect(answer?.querySelector('[data-widget="compare"]')).toHaveTextContent(
    /Engagement rate: \d+ of \d+ similar campaigns/,
  );

  fireEvent.click(within(chat).getByRole("button", { name: /Dock/ }));
  // Docked on another campaign, the widget answers about that one.
  go("#campaign/cmp-spring-serum");
  const docked = within(rail()).getByRole("region", { name: "Conversation" });
  sendIn(docked, SIMILAR_Q);
  expect(docked.querySelectorAll('[data-widget="compare"]')).toHaveLength(2);
});

test("docking puts focus in the rail's message box, not back on Find or ask", async () => {
  renderApp();
  fireEvent.click(within(ask("Why is Ana late?")).getByRole("button", { name: /Dock/ }));
  const docked = within(rail()).getByRole("region", { name: "Conversation" });
  // Radix restores focus on the next tick.
  await waitFor(() =>
    expect(document.activeElement).toBe(within(docked).getByRole("textbox", { name: "Message" })),
  );
});
