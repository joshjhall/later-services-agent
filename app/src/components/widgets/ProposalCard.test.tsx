import { render, screen } from "@testing-library/react";
import { deriveProposals } from "@/agent/rules";
import * as fx from "@/domain/fixtures";
import { StoreProvider } from "@/domain/store";
import { ProposalCard } from "./ProposalCard";

const review = deriveProposals(fx).find((p) => p.kind === "review-draft");

test("draft review shows the decline-unless hint under the fix request", () => {
  if (!review) throw new Error("fixtures should yield a review-draft proposal");
  render(
    <StoreProvider>
      <ProposalCard proposal={review} />
    </StoreProvider>,
  );
  expect(screen.getByRole("button", { name: "Send fix request" })).toBeInTheDocument();
  expect(screen.getByText("Decline unless fixed")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Approve with changes" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Approve" })).toBeInTheDocument();
});
