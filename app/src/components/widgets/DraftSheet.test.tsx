import { fireEvent, render, screen, within } from "@testing-library/react";
import { messageDrafts } from "@/agent/drafts";
import { StoreProvider, useStore } from "@/domain/store";
import { DraftSheet } from "./DraftSheet";

const draft = messageDrafts["fix:d-rio-1"];

/** Shows what the store recorded as sent, so the test reads the real payload. */
function Sent() {
  const { sent } = useStore();
  const s = sent[draft.id];
  return <output aria-label="sent">{s ? `${s.subject} | ${s.body}` : "nothing"}</output>;
}

test("sends the subject and body as edited, not the agent's draft", () => {
  render(
    <StoreProvider>
      <DraftSheet draft={draft} open onOpenChange={() => {}} />
      <Sent />
    </StoreProvider>,
  );
  const sheet = within(screen.getByRole("dialog"));
  fireEvent.change(sheet.getByLabelText("Subject"), { target: { value: "Quick fix, Rio" } });
  fireEvent.change(sheet.getByLabelText("Message"), {
    target: { value: "#ad on screen, please." },
  });
  expect(screen.getByLabelText("sent")).toHaveTextContent("nothing");
  fireEvent.click(sheet.getByRole("button", { name: /Send/ }));
  expect(screen.getByLabelText("sent")).toHaveTextContent(
    "Quick fix, Rio | #ad on screen, please.",
  );
});
