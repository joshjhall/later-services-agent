import { fireEvent, render, screen } from "@testing-library/react";
import { AGENT_POLICY, deriveProposals } from "@/agent/rules";
import * as fx from "@/domain/fixtures";
import { autoRun, StoreProvider } from "@/domain/store";
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

const boostAt = (maxDailySpend: number) => {
  const policy = { ...AGENT_POLICY, maxDailySpend };
  const p = deriveProposals(fx, fx.DEMO_TODAY, undefined, policy).find(
    (x) => x.kind === "boost-post",
  );
  if (!p) throw new Error("fixtures should yield a boost-post proposal");
  render(
    <StoreProvider policy={policy}>
      <ProposalCard proposal={p} />
    </StoreProvider>,
  );
};

test("a within-cap option the agent didn't recommend waits for the CM, marked Pre-approved", () => {
  boostAt(5_000);
  const group = (name: string) => screen.getByRole("button", { name }).parentElement;
  expect(group("Boost $4,000")).toHaveTextContent("Pre-approved");
  expect(group("Boost $8,000")).toHaveTextContent("Needs approval");
  expect(screen.queryByText("Automatic")).toBeNull();
});

test("a recommended boost within the cap arrives done by the agent", () => {
  boostAt(8_000);
  expect(screen.queryByRole("button", { name: /Boost/ })).toBeNull();
  expect(screen.getByText(/Boost \$8,000 · done by the agent · logged/)).toBeInTheDocument();
});

test("a card the CM resolves is never attributed to the agent", () => {
  boostAt(AGENT_POLICY.maxDailySpend);
  fireEvent.click(screen.getByRole("button", { name: "Not now" }));
  expect(screen.getByText(/Not now · logged/)).toBeInTheDocument();
  expect(screen.queryByText(/done by the agent/)).toBeNull();
});

test("a boost the campaign total holds back shows Needs approval, never Pre-approved", () => {
  const policy = { ...AGENT_POLICY, maxDailySpend: 10_000 };
  const boost = deriveProposals(fx, fx.DEMO_TODAY, undefined, policy).find(
    (x) => x.kind === "boost-post",
  );
  if (!boost) throw new Error("fixtures should yield a boost-post proposal");
  // A second boost in the same campaign, after the agent already ran $8,000.
  const held = autoRun([boost, { ...boost, id: `${boost.id}:twin` }], policy).proposals[1];
  render(
    <StoreProvider policy={policy}>
      <ProposalCard proposal={held} />
    </StoreProvider>,
  );
  const group = (name: string) => screen.getByRole("button", { name }).parentElement;
  expect(group("Boost $8,000")).toHaveTextContent("Needs approval");
  expect(group("Boost $4,000")).toHaveTextContent("Needs approval");
  expect(screen.queryByText("Pre-approved")).toBeNull();
  expect(screen.getByText(/\$8,000 already spent · above it, so it needs you/)).toBeInTheDocument();
});
