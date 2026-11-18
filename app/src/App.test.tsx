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
