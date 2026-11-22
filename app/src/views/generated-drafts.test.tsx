import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { App } from "@/App";
import { ThemeProvider } from "@/theme/ThemeProvider";

/**
 * Drafts the agent generated, not the hand-written ones the demo fixtures use.
 * Ben flagged as profile-only raises an info request, and Mei's live Reel moved
 * back to submitted raises a draft review. Neither has a draft in `messageDrafts`,
 * so each card can only open the draft carried on its option.
 */
vi.mock("@/domain/fixtures", async (importOriginal) => {
  const fx = await importOriginal<typeof import("@/domain/fixtures")>();
  return {
    ...fx,
    creators: fx.creators.map((c) =>
      c.handle === "@benpours" ? { ...c, audienceSource: "profile" as const } : c,
    ),
    deliverables: fx.deliverables.map((d) =>
      d.id === "d-mei-1" ? { ...d, stage: "submitted" as const } : d,
    ),
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

const card = (title: RegExp): HTMLElement => {
  const found = screen.getByText(title).closest<HTMLElement>("[data-severity]");
  if (!found) throw new Error(`No proposal card holds ${title}`);
  return found;
};

const entries = (text: RegExp) =>
  screen.getAllByTestId("activity-entry").filter((el) => text.test(el.textContent ?? ""));

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

test("generated info request: the card opens the agent's email, and sending records it once", () => {
  renderApp();
  fireEvent.click(
    within(card(/Confirm Ben's audience is mostly US/)).getByRole("button", {
      name: "Draft the email",
    }),
  );
  const sheet = screen.getByRole("dialog");
  expect(within(sheet).getByText(/Draft: info request to/)).toBeInTheDocument();
  expect(within(sheet).getByLabelText("Subject")).toHaveValue(
    "Quick check on Ben's audience split",
  );
  fireEvent.click(within(sheet).getByRole("button", { name: /Send/ }));
  go("#activity");
  const sent = entries(/Sent info request to .*Ben Okafor/);
  expect(sent).toHaveLength(1);
  expect(sent[0]).toHaveTextContent("Permanent");
});

test("generated fix request: the card opens the agent's email, and sending records it once", () => {
  renderApp();
  fireEvent.click(
    within(card(/Mei Tanaka's draft misses/)).getByRole("button", { name: "Send fix request" }),
  );
  const sheet = screen.getByRole("dialog");
  expect(within(sheet).getByText(/Draft: fix request to Mei Tanaka/)).toBeInTheDocument();
  expect(within(sheet).getByLabelText("Subject")).toHaveValue(
    "One fix before we approve your IG Reel + Story ×2",
  );
  fireEvent.click(within(sheet).getByRole("button", { name: /Send/ }));
  go("#activity");
  const sent = entries(/Sent fix request to Mei Tanaka/);
  expect(sent).toHaveLength(1);
  expect(sent[0]).toHaveTextContent("Permanent");
});
