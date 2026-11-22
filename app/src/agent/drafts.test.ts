import { campaigns, creators, deliverables, partnerships } from "@/domain/fixtures";
import { draftFor, messageDrafts } from "./drafts";
import { deriveProposals } from "./rules";

const proposals = deriveProposals({ campaigns, creators, partnerships, deliverables });

describe("message drafts", () => {
  test("each draft's id matches its key", () => {
    for (const [key, d] of Object.entries(messageDrafts)) expect(d.id).toBe(key);
  });

  test("every agent option that sends a message has a draft behind it", () => {
    // A sending option with no draft would resolve the card without anything going out.
    const sending = proposals.flatMap((p) =>
      p.options
        .filter((o) => o.id === "send-fix" || o.id === "draft-email")
        .map((o) => [p.id, o.id] as const),
    );
    expect(sending.length).toBeGreaterThan(0);
    for (const [pid, oid] of sending) expect(draftFor(pid, oid)).toBeDefined();
  });

  test("options that don't send open no draft", () => {
    expect(draftFor("review:d-rio-1", "approve")).toBeUndefined();
  });
});
