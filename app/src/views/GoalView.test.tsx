import { fireEvent, render, screen, within } from "@testing-library/react";
import { clientEmailDraft, goalDrafts } from "@/agent/drafts";
import { StoreProvider } from "@/domain/store";
import { GoalView } from "./GoalView";

const goal = goalDrafts["cmp-spring-serum"];
const agentDraft = clientEmailDraft({
  goal,
  campaign: { id: "cmp-spring-serum", name: "Spring serum" },
  account: { name: "Lumen Skin", contact: "Priya Rao, VP Marketing" },
  objective: goal.objective.proposed,
  targets: Object.fromEntries(goal.kpis.map((k) => [k.metric, k.target])),
});

const renderGoal = () =>
  render(
    <StoreProvider>
      <GoalView id="cmp-spring-serum" />
    </StoreProvider>,
  );
const openEmail = () => {
  fireEvent.click(screen.getByRole("button", { name: /Confirm and draft/ }));
  return within(screen.getByRole("dialog"));
};

test("goal: reopening the client email after Not yet shows the agent's draft again", () => {
  renderGoal();

  let sheet = openEmail();
  fireEvent.change(sheet.getByLabelText("Subject"), {
    target: { value: "Edited, then abandoned" },
  });
  fireEvent.click(sheet.getByRole("button", { name: "Not yet" }));
  expect(screen.queryByRole("dialog")).toBeNull();

  sheet = openEmail();
  expect(sheet.getByLabelText("Subject")).toHaveValue(agentDraft.subject);
  expect(sheet.getByLabelText("Message")).toHaveValue(agentDraft.body);
  // Not yet records nothing: the goal is still open.
  expect(screen.queryByText(/Ready for client/)).toBeNull();
});

test("goal: an edited target carries into the client email, and Send logs the goal", () => {
  renderGoal();
  fireEvent.change(screen.getByLabelText("Reach target"), { target: { value: "20M" } });

  const sheet = openEmail();
  const body = (sheet.getByLabelText("Message") as HTMLTextAreaElement).value;
  expect(body).toContain("reach 20M");
  expect(body).not.toContain("25M");

  fireEvent.click(sheet.getByRole("button", { name: "Send" }));
  expect(screen.getByText(/Ready for client · logged/)).toBeInTheDocument();
});

test("goal: a changed objective carries into the client email without the old KPIs", () => {
  renderGoal();
  fireEvent.click(screen.getByRole("radio", { name: "Consideration" }));

  const body = (openEmail().getByLabelText("Message") as HTMLTextAreaElement).value;
  expect(body).toContain("Objective: consideration.");
  expect(body).not.toContain("KPIs:");
  // The awareness-only question leaves the page and the email together.
  expect(body).not.toContain("brand-lift");
  expect(screen.queryByText(/brand-lift/)).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Not yet" }));

  // Switching back restores the agent's draft: KPIs, summary, and the awareness question.
  fireEvent.click(screen.getByRole("radio", { name: "Awareness" }));
  expect(openEmail().getByLabelText("Message")).toHaveValue(agentDraft.body);
  expect(screen.getAllByText(/brand-lift/).length).toBeGreaterThan(0);
});

test("goal: a campaign with no goal draft shows the fallback heading", () => {
  render(
    <StoreProvider>
      <GoalView id="cmp-holiday-gifting" />
    </StoreProvider>,
  );
  expect(
    screen.getByRole("heading", { name: "No goal draft for this campaign" }),
  ).toBeInTheDocument();
});
