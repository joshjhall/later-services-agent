import { render, screen } from "@testing-library/react";
import { KpiBar } from "./KpiBar";

// The bar is named by its metric and reads "actual of target", in the KPI's unit.
// Literal values, so a regression in kpiPct or fmt can't hide on both sides.
test("names the bar by its metric and reads actual of target", () => {
  render(<KpiBar kpi={{ metric: "Spend", target: 40000, actual: 10000, unit: "$" }} />);
  const bar = screen.getByRole("progressbar", { name: "Spend" });
  expect(bar).toHaveAttribute("aria-valuenow", "25");
  expect(bar).toHaveAttribute("aria-valuetext", "$10K of $40K");
  expect(screen.getByText("$10K / $40K")).toBeInTheDocument();
});

// A target of 0 has nothing to pace against: an empty bar, real numbers still read.
test("a zero target shows an empty bar", () => {
  render(<KpiBar kpi={{ metric: "Saves", target: 0, actual: 12 }} />);
  const bar = screen.getByRole("progressbar", { name: "Saves" });
  expect(bar).toHaveAttribute("aria-valuenow", "0");
  expect(bar).toHaveAttribute("aria-valuetext", "12 of 0");
});
