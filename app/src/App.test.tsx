import { render, screen } from "@testing-library/react";
import { App } from "@/App";
import { ThemeProvider } from "@/theme/ThemeProvider";

test("renders the app shell and injects the generated palette", () => {
  render(
    <ThemeProvider>
      <App />
    </ThemeProvider>,
  );
  expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  expect(document.getElementById("md3-palette")?.textContent).toContain("--primary:");
});
