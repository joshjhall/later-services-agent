import {
  accounts,
  activity,
  campaigns,
  creators,
  deliverables,
  partnerships,
} from "@/domain/fixtures";
import { audienceMarket, infoRequestDraft, messageDrafts } from "./drafts";
import { deriveProposals } from "./rules";

const proposals = deriveProposals({ accounts, campaigns, creators, partnerships, deliverables });
const sending = proposals.flatMap((p) => p.options.filter((o) => o.draft).map((o) => ({ p, o })));

describe("message drafts", () => {
  test("each draft's id matches its key", () => {
    for (const [key, d] of Object.entries(messageDrafts)) expect(d.id).toBe(key);
  });

  test("sending options carry their draft, about the proposal's campaign", () => {
    // `draft` marks a sending option in the type, so a new one is covered here automatically.
    expect(sending.length).toBeGreaterThan(0);
    for (const { p, o } of sending)
      expect(o.draft?.campaignId, `${p.id}/${o.id}`).toBe(p.campaignId);
  });

  test("options that don't send carry no draft", () => {
    const review = proposals.find((p) => p.id === "review:d-rio-1");
    expect(review?.options.find((o) => o.id === "send-fix")?.draft).toBeDefined();
    expect(review?.options.find((o) => o.id === "approve")?.draft).toBeUndefined();
  });
});

describe("info request draft", () => {
  const holiday = campaigns.find((c) => c.id === "cmp-holiday-gifting");
  const ana = creators.find((c) => c.id === "cr-ana");
  if (!holiday || !ana) throw new Error("fixtures changed");

  test("names the creator, the market from the profile, the client, and the manager", () => {
    const d = infoRequestDraft({ creator: ana, campaign: holiday, client: "Brightside Beverages" });
    expect(d).toMatchObject({
      id: "info:cmp-holiday-gifting:cr-ana",
      to: "Northstar Talent (Ana Reyes's manager)",
      target: "Ana Reyes · Holiday gifting",
      campaignId: "cmp-holiday-gifting",
    });
    expect(d.body).toMatch(/Brightside Beverages Holiday gifting campaign/);
    expect(d.body).toMatch(/mostly US\./);
    expect(d.body).toMatch(/Ana's latest TikTok analytics/);
  });

  test("takes the market from the audience line, not a fixed country", () => {
    const mei = { ...ana, name: "Mei Tanaka", audience: "US/CA, 25–40, 80% women; wellness" };
    expect(audienceMarket(mei)).toBe("US/CA");
    expect(infoRequestDraft({ creator: mei, campaign: holiday }).body).toMatch(/mostly US\/CA\./);
  });

  test("with no manager, goes to the creator directly", () => {
    const { representedBy: _, ...solo } = ana;
    const d = infoRequestDraft({ creator: solo, campaign: holiday });
    expect(d.to).toBe("Ana Reyes");
    expect(d.body.startsWith("Hi Ana,")).toBe(true);
    expect(d.body).toMatch(/your latest TikTok analytics/);
    expect(d.body).toMatch(/the Holiday gifting campaign/);
  });
});

test("every message draft and seeded activity entry names a real campaign, so the rail scopes by id", () => {
  const ids = new Set(campaigns.map((c) => c.id));
  expect(Object.keys(messageDrafts).length).toBeGreaterThan(0);
  expect(activity.length).toBeGreaterThan(0);
  for (const d of Object.values(messageDrafts)) expect(ids, d.id).toContain(d.campaignId);
  for (const { o } of sending) expect(ids, o.draft?.id).toContain(o.draft?.campaignId);
  for (const e of activity) expect(ids, e.id).toContain(e.campaignId);
});
