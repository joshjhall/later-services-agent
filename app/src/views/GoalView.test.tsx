import { fireEvent, render, screen, within } from "@testing-library/react";
import { messageDrafts } from "@/agent/drafts";
import { StoreProvider } from "@/domain/store";
import { GoalView } from "./GoalView";

const agentDraft = messageDrafts["client:cmp-spring-serum"];

test("goal: reopening the client email after Not yet shows the agent's draft again", () => {
  render(
    <StoreProvider>
      <GoalView id="cmp-spring-serum" />
    </StoreProvider>,
  );
  const open = () => fireEvent.click(screen.getByRole("button", { name: /Confirm and draft/ }));

  open();
  let sheet = within(screen.getByRole("dialog"));
  fireEvent.change(sheet.getByLabelText("Subject"), {
    target: { value: "Edited, then abandoned" },
  });
  fireEvent.click(sheet.getByRole("button", { name: "Not yet" }));
  expect(screen.queryByRole("dialog")).toBeNull();

  open();
  sheet = within(screen.getByRole("dialog"));
  expect(sheet.getByLabelText("Subject")).toHaveValue(agentDraft.subject);
  // Not yet records nothing: the goal is still open.
  expect(screen.queryByText(/Ready for client/)).toBeNull();
});
