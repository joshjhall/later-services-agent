import { act, renderHook } from "@testing-library/react";
import { type MessageDraft, messageDrafts } from "@/agent/drafts";
import { StoreProvider, useStore } from "@/domain/store";

// The rail scopes activity by `campaignId`; an entry without it falls back to
// loose name matching (#49). These pin where each new entry takes its id from.

const base = messageDrafts["fix:d-rio-1"];

function setup() {
  return renderHook(() => useStore(), { wrapper: StoreProvider });
}

function entry(result: ReturnType<typeof setup>["result"], id: string) {
  const found = result.current.activity.find((a) => a.id === id);
  if (!found) throw new Error(`no activity entry ${id}`);
  return found;
}

test("resolve stamps the proposal's campaign id", () => {
  const { result } = setup();
  const p = result.current.proposals[0];
  act(() => result.current.resolve(p, p.options[0].id));
  expect(result.current.activity[0].id).toBe(`act-${p.id}`);
  expect(entry(result, `act-${p.id}`).campaignId).toBe(p.campaignId);
});

test("send with answers takes the proposal's campaign id over the draft's", () => {
  const { result } = setup();
  const p = result.current.proposals[0];
  const draft: MessageDraft = { ...base, id: "t-answers", campaignId: "cmp-draft-only" };
  expect(p.campaignId).not.toBe(draft.campaignId);
  act(() => result.current.send(draft, { proposal: p, optionId: p.options[0].id }));
  expect(entry(result, "act-sent-t-answers").campaignId).toBe(p.campaignId);
});

test("send without answers takes the draft's campaign id", () => {
  const { result } = setup();
  const draft: MessageDraft = { ...base, id: "t-draft", campaignId: "cmp-draft-only" };
  act(() => result.current.send(draft));
  expect(entry(result, "act-sent-t-draft").campaignId).toBe("cmp-draft-only");
});

test("send leaves the campaign id undefined when the draft has none", () => {
  const { result } = setup();
  const { campaignId: _, ...rest } = base;
  const draft = { ...rest, id: "t-none" } as MessageDraft;
  act(() => result.current.send(draft));
  expect(entry(result, "act-sent-t-none").campaignId).toBeUndefined();
});
