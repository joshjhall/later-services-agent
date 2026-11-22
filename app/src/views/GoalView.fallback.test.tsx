import { fireEvent, render, screen } from "@testing-library/react";
import { StoreProvider } from "@/domain/store";
import { GoalView } from "./GoalView";

// A campaign with a goal draft but no client email drafted yet.
vi.mock("@/agent/drafts", async (importOriginal) => {
  const drafts = await importOriginal<typeof import("@/agent/drafts")>();
  const { "client:cmp-spring-serum": _, ...rest } = drafts.messageDrafts;
  return { ...drafts, messageDrafts: rest };
});

test("goal: with no client email draft, Confirm marks the goal ready without opening a sheet", () => {
  render(
    <StoreProvider>
      <GoalView id="cmp-spring-serum" />
    </StoreProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: /Confirm and draft/ }));
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(screen.getByText(/Ready for client · logged/)).toBeInTheDocument();
});
