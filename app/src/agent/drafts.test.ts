import {
  accounts,
  activity,
  campaigns,
  creators,
  deliverables,
  partnerships,
} from "@/domain/fixtures";
import { audienceMarket, fixRequestDraft, infoRequestDraft, messageDrafts } from "./drafts";
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

  test("with no client known, names the campaign alone", () => {
    const d = infoRequestDraft({ creator: ana, campaign: holiday });
    expect(d.to).toBe("Northstar Talent (Ana Reyes's manager)");
    expect(d.body).toMatch(/proposing Ana for the Holiday gifting campaign\./);
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

describe("fix request draft", () => {
  const campaign = { id: "cmp-sparkling-launch", name: "Sparkling Citrus launch" };

  test("a hand-written draft wins", () => {
    const d = fixRequestDraft({
      deliverable: { id: "d-rio-1", kind: "IG Reel", goLive: "2026-11-25" },
      creator: { name: "Rio Castillo" },
      campaign,
    });
    expect(d).toBe(messageDrafts["fix:d-rio-1"]);
  });

  test("otherwise it is built from the deliverable, creator, and go-live date", () => {
    const d = fixRequestDraft({
      deliverable: { id: "d-new", kind: "TikTok video", goLive: "2026-12-01" },
      creator: { name: "Mei Tanaka" },
      campaign,
    });
    expect(d).toMatchObject({
      id: "fix:d-new",
      kind: "fix request",
      to: "Mei Tanaka",
      target: "Mei Tanaka · Sparkling Citrus launch",
      campaignId: "cmp-sparkling-launch",
      subject: "One fix before we approve your TikTok video",
    });
    expect(d.body).toMatch(/^Hi Mei,/);
    // Read as a calendar date: the first of the month never slips to the previous day.
    expect(d.body).toMatch(/Go-live stays Dec 1\./);
  });

  test("a go-live with a time still reads as its calendar date", () => {
    const d = fixRequestDraft({
      deliverable: { id: "d-time", kind: "Reel", goLive: "2026-12-01T23:30:00-08:00" },
      creator: { name: "Mei Tanaka" },
      campaign,
    });
    expect(d.body).toMatch(/Go-live stays Dec 1\./);
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
