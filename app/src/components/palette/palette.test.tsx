import { act, fireEvent, render, screen, within } from "@testing-library/react";
import * as world from "@/domain/fixtures";
import { StoreProvider } from "@/domain/store";
import { openFindOrAsk } from "@/shell/FindOrAsk";
import { FindOrAskPalette } from "./FindOrAskPalette";
import { ACTIVITY_LABEL, buildItems, contextLine, filterItems, subjectFor } from "./items";
import { FALLBACK, replyTo } from "./responses";

const items = buildItems(world);
const labels = (q: string) => filterItems(items, q).map((i) => i.label);

test("an empty query suggests every place and action", () => {
  expect(items.find((i) => i.label === ACTIVITY_LABEL)?.route).toEqual({ view: "activity" });
  expect(filterItems(items, "")).toHaveLength(items.length);
  expect(labels("")).toContain(ACTIVITY_LABEL);
});

test("a campaign matches by its account's name as well as its own", () => {
  expect(labels("brightside")).toEqual(
    expect.arrayContaining(["Brightside Beverages", "Sparkling Citrus launch", "Holiday gifting"]),
  );
  expect(labels("brightside")).not.toContain("Trail season");
});

test("actions filter as you type, and every word must match", () => {
  expect(filterItems(items, "nudge").map((i) => i.group)).toEqual(["Do"]);
  expect(labels("nudge ana")).toEqual(["Nudge Ana"]);
  expect(labels("nudge ben")).toEqual([]);
});

test("a long question matches no place or action", () => {
  expect(labels("how does this compare with her last three")).toEqual([]);
});

test("the conversation is about the current object", () => {
  expect(subjectFor({ view: "today" }, world)).toBe("your portfolio");
  expect(subjectFor({ view: "campaign", id: "cmp-sparkling-launch" }, world)).toBe(
    "Sparkling Citrus launch",
  );
  expect(subjectFor({ view: "lineup", id: "cmp-holiday-gifting" }, world)).toBe(
    "the Holiday gifting lineup",
  );
  // A stale link doesn't name "Not found" as the subject.
  expect(subjectFor({ view: "campaign", id: "cmp-gone" }, world)).toBe("your portfolio");
  expect(contextLine({ view: "campaign", id: "cmp-gone" }, world)).toBe("Portfolio");
});

test("the compare question names the dimension it chose and offers the others", () => {
  const reply = replyTo("How does this compare with her last three?");
  expect(reply).toMatch(/early performance/);
  expect(reply).toMatch(/wording, audience, or expected outcome/);
  expect(replyTo("what's the weather")).toBe(FALLBACK);
});

test("each scripted reply matches whole words, not fragments", () => {
  expect(replyTo("Why is Ana's draft late?")).toMatch(/Ben is the approved backup/);
  expect(replyTo("What's at risk this week?")).toMatch(/Three things need you/);
  expect(replyTo("Show risks")).toMatch(/Three things need you/);
  // Words that only contain a keyword get the fallback.
  for (const q of ["comparable", "analytics", "template", "brisk"]) {
    expect(replyTo(q)).toBe(FALLBACK);
  }
});

function renderPalette() {
  render(
    <StoreProvider>
      <FindOrAskPalette route={{ view: "campaign", id: "cmp-sparkling-launch" }} />
    </StoreProvider>,
  );
  act(() => openFindOrAsk());
  return screen.getByRole("dialog", { name: "Find or ask" });
}

const options = (dialog: HTMLElement) =>
  within(dialog)
    .getAllByRole("option")
    .map((o) => o.textContent);

test("typing filters suggestions, and the conversation option always stays", () => {
  const dialog = renderPalette();
  const input = within(dialog).getByRole("combobox");
  const ask = "Start a conversation about Sparkling Citrus launch";

  expect(options(dialog)).toContain(ask);
  expect(options(dialog).length).toBeGreaterThan(5);

  fireEvent.change(input, { target: { value: "nudge" } });
  expect(options(dialog)).toEqual(["Nudge Ana", ask]);

  fireEvent.change(input, { target: { value: "how does this compare with her last three" } });
  expect(options(dialog)).toEqual([ask]);
});

test("choosing the conversation opens it full screen with context and a scripted answer", () => {
  const dialog = renderPalette();
  fireEvent.change(within(dialog).getByRole("combobox"), {
    target: { value: "How does this compare with her last three?" },
  });
  fireEvent.click(within(dialog).getByRole("option", { name: /Start a conversation/ }));

  const chat = screen.getByRole("dialog", { name: "Conversation" });
  expect(chat).toHaveTextContent(
    "About: Portfolio › Brightside Beverages › Sparkling Citrus launch",
  );
  expect(chat).toHaveTextContent("How does this compare with her last three?");
  expect(chat).toHaveTextContent(/compared early performance/);

  fireEvent.change(within(chat).getByRole("textbox", { name: "Message" }), {
    target: { value: "Why is Ana late?" },
  });
  fireEvent.click(within(chat).getByRole("button", { name: /Send/ }));
  expect(chat).toHaveTextContent(/Ben is the approved backup/);
});

test("choosing a suggestion goes there and closes the palette", () => {
  location.hash = "";
  const dialog = renderPalette();
  fireEvent.click(within(dialog).getByRole("option", { name: ACTIVITY_LABEL }));
  expect(location.hash).toBe("#activity");
  expect(screen.queryByRole("dialog", { name: "Find or ask" })).toBeNull();
});

test("Nudge Ana opens Today, where her follow-up decision waits", () => {
  location.hash = "#activity";
  const dialog = renderPalette();
  fireEvent.click(within(dialog).getByRole("option", { name: "Nudge Ana" }));
  expect(location.hash).toBe("#today");
});

test("a new conversation starts with an empty draft", () => {
  const dialog = renderPalette();
  fireEvent.click(within(dialog).getByRole("option", { name: /Start a conversation/ }));
  const message = () => screen.getByRole("textbox", { name: "Message" });
  fireEvent.change(message(), { target: { value: "half-typed" } });
  fireEvent.keyDown(screen.getByRole("dialog", { name: "Conversation" }), { key: "Escape" });
  expect(screen.queryByRole("dialog", { name: "Conversation" })).toBeNull();

  act(() => openFindOrAsk());
  fireEvent.click(screen.getByRole("option", { name: /Start a conversation/ }));
  expect(message()).toHaveValue("");
});
