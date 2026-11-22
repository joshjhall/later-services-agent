import { render, screen } from "@testing-library/react";
import { ShellLayout } from "@/shell/ShellLayout";

test("the rail slot renders beside the core only when there is a rail", () => {
  const { rerender } = render(<ShellLayout>core</ShellLayout>);
  expect(screen.getByRole("main")).toHaveTextContent("core");
  expect(screen.queryByRole("complementary", { name: "Context rail" })).toBeNull();

  rerender(<ShellLayout rail={<p>widget</p>}>core</ShellLayout>);
  expect(screen.getByRole("complementary", { name: "Context rail" })).toHaveTextContent("widget");
  expect(screen.getByRole("main")).toHaveTextContent("core");
});
