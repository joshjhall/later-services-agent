import { render, screen } from "@testing-library/react";
import type { Lane } from "@/agent/rules";
import { LaneBadge } from "./LaneBadge";

// Source of truth: design-system/02-ai/autonomy-lanes.md. Hard-coded so drift fails here.
test.each<[Lane, string]>([
  ["auto", "Automatic"],
  ["propose", "Needs approval"],
  ["human", "A person only"],
])("the %s lane shows “%s”", (lane, label) => {
  render(<LaneBadge lane={lane} />);
  expect(screen.getByText(label)).toBeInTheDocument();
});
