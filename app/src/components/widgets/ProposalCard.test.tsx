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
  const hints = screen.getAllByText("Decline unless fixed");
  expect(hints).toHaveLength(1);
  const group = (name: string) => screen.getByRole("button", { name }).parentElement;
  expect(group("Send fix request")).toContainElement(hints[0]);
  expect(group("Approve with changes")).not.toContainElement(hints[0]);
  expect(group("Approve")).not.toContainElement(hints[0]);
  expect(screen.getByRole("button", { name: "Send fix request" }).nextElementSibling).toBe(
    hints[0],
  );
});

test("removing a hint removes exactly one node from its option", () => {
  if (!review) throw new Error("fixtures should yield a review-draft proposal");
  expect(review.options.some((o) => o.hint)).toBe(true);
  const childCount = (label: string) =>
    screen.getByRole("button", { name: label }).parentElement?.children.length;

  const { unmount } = render(
    <StoreProvider>
      <ProposalCard proposal={review} />
    </StoreProvider>,
  );
  const hinted = new Map(review.options.map((o) => [o.label, childCount(o.label)]));
  unmount();

  const options = review.options.map(({ hint: _hint, ...o }) => o);
  render(
    <StoreProvider>
      <ProposalCard proposal={{ ...review, options }} />
    </StoreProvider>,
  );
  expect(screen.queryByText("Decline unless fixed")).toBeNull();
  for (const o of review.options) {
    const before = hinted.get(o.label);
    if (before === undefined) throw new Error(`no hinted render for ${o.label}`);
    expect(childCount(o.label)).toBe(before - (o.hint ? 1 : 0));
  }
});

test("the campaign link goes to the card's tab, and is left out if the campaign is unknown", () => {
  if (!review) throw new Error("fixtures should yield a review-draft proposal");
  const { unmount } = render(
    <StoreProvider>
      <ProposalCard proposal={review} />
    </StoreProvider>,
  );
  expect(screen.getByRole("link", { name: "Sparkling Citrus launch" })).toHaveAttribute(
    "href",
    "#campaign/cmp-sparkling-launch/make",
  );
  unmount();
  render(
    <StoreProvider>
      <ProposalCard proposal={{ ...review, campaignId: "cmp-gone" }} />
    </StoreProvider>,
  );
  expect(screen.queryByRole("link", { name: /campaign/i })).toBeNull();
  expect(screen.queryAllByRole("link").filter((a) => !a.textContent?.trim())).toEqual([]);
});
