import { act, fireEvent, render, screen, within } from "@testing-library/react";
import * as world from "@/domain/fixtures";
import { StoreProvider } from "@/domain/store";
import type { Route } from "@/router";
import { crumbs, LABELS } from "@/router";
import { openFindOrAsk } from "@/shell/FindOrAsk";
import { FindOrAskPalette } from "./FindOrAskPalette";
import { ACTIVITY_LABEL, buildItems, contextLine, filterItems, subjectFor } from "./items";
import { fallbackFor, onSparklingCitrus, replyTo } from "./responses";

afterEach(() => {
  location.hash = "";
  vi.restoreAllMocks();
});

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

test("every suggestion leads to a page that exists", () => {
  for (const item of items.filter((i) => i.route)) {
    // biome-ignore lint/style/noNonNullAssertion: filtered above
    expect(crumbs(item.route!, world).at(-1)?.label, item.label).not.toBe(LABELS.notFound);
  }
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

const today: Route = { view: "today" };
const citrus: Route = { view: "campaign", id: "cmp-sparkling-launch" };
const COMPARE_Q = "How does this compare with her last three?";

test("from Sparkling Citrus, the compare question names the dimension it chose and offers the others", () => {
  for (const route of [citrus, { view: "lineup", id: "cmp-sparkling-launch" } as Route]) {
    const reply = replyTo(COMPARE_Q, route);
    expect(reply).toMatch(/early performance/);
    expect(reply).toMatch(/wording, audience, or expected outcome/);
  }
  expect(replyTo("what's the weather", citrus)).toBe(fallbackFor(citrus));
});

test("elsewhere, the compare question asks whose post it means instead of assuming Mei", () => {
  for (const route of [today, { view: "goal", id: "cmp-spring-serum" } as Route]) {
    const reply = replyTo(COMPARE_Q, route);
    expect(reply).toMatch(/^Whose post do you mean\?/);
    expect(reply).not.toMatch(/early performance/);
  }
});

test("only Sparkling Citrus pages count as Mei's campaign", () => {
  const yes: Route[] = [
    citrus,
    { view: "goal", id: "cmp-sparkling-launch" },
    { view: "lineup", id: "cmp-sparkling-launch" },
  ];
  const no: Route[] = [
    today,
    { view: "roster" },
    { view: "activity" },
    { view: "campaign", id: "cmp-spring-serum" },
    { view: "account", id: "cmp-sparkling-launch" },
  ];
  for (const r of yes) expect(onSparklingCitrus(r), JSON.stringify(r)).toBe(true);
  for (const r of no) expect(onSparklingCitrus(r), JSON.stringify(r)).toBe(false);
});

test("the fallback only suggests questions that make sense for the context", () => {
  expect(fallbackFor(citrus)).toMatch(/Mei's Reel compares with her last three/);
  for (const route of [today, { view: "roster" }, { view: "activity" }] as Route[]) {
    expect(fallbackFor(route)).not.toMatch(/\bher\b|Mei|last three/);
    expect(fallbackFor(route)).toMatch(/why Ana is late/);
  }
});

test("each scripted reply matches whole words, not fragments", () => {
  const ask = (q: string) => replyTo(q, today);
  expect(ask("Why is Ana's draft late?")).toMatch(/Ben is the approved backup/);
  expect(ask("What's at risk this week?")).toMatch(/Three things need you/);
  expect(ask("Show risks")).toMatch(/Three things need you/);
  // First match wins: a question naming Ana gets her story even if it mentions risk.
  expect(ask("Is Ana at risk this week?")).toMatch(/Ben is the approved backup/);
  // A compare question that names its subject gets that subject, wherever it's asked.
  expect(ask("How does Ana compare with Ben?")).toMatch(/Ben is the approved backup/);
  expect(replyTo("How does Ana compare with Ben?", citrus)).toMatch(/Ben is the approved backup/);
  // Words that only contain a keyword get the fallback.
  // Ana's story needs her name, not just "late".
  for (const q of ["comparable", "analytics", "template", "brisk", "Is the lineup late?"]) {
    expect(ask(q)).toBe(fallbackFor(today));
  }
});

function renderPalette(route: Route = citrus) {
  const view = render(
    <StoreProvider>
      <FindOrAskPalette route={route} />
    </StoreProvider>,
  );
  act(() => openFindOrAsk());
  return { dialog: screen.getByRole("dialog", { name: "Find or ask" }), ...view };
}

const options = (dialog: HTMLElement) =>
  within(dialog)
    .getAllByRole("option")
    .map((o) => o.textContent);

test("typing filters suggestions, and the conversation option always stays", () => {
  const { dialog } = renderPalette();
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
  const { dialog } = renderPalette();
  fireEvent.change(within(dialog).getByRole("combobox"), {
    target: { value: COMPARE_Q },
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
  const { dialog } = renderPalette();
  fireEvent.click(within(dialog).getByRole("option", { name: ACTIVITY_LABEL }));
  expect(location.hash).toBe("#activity");
  expect(screen.queryByRole("dialog", { name: "Find or ask" })).toBeNull();
});

test("Nudge Ana opens Today, where her follow-up decision waits", () => {
  location.hash = "#activity";
  const { dialog } = renderPalette();
  fireEvent.click(within(dialog).getByRole("option", { name: "Nudge Ana" }));
  expect(location.hash).toBe("#today");
});

test("a new conversation starts with an empty draft", () => {
  const { dialog } = renderPalette();
  fireEvent.click(within(dialog).getByRole("option", { name: /Start a conversation/ }));
  const message = () => screen.getByRole("textbox", { name: "Message" });
  fireEvent.change(message(), { target: { value: "half-typed" } });
  fireEvent.keyDown(screen.getByRole("dialog", { name: "Conversation" }), { key: "Escape" });
  expect(screen.queryByRole("dialog", { name: "Conversation" })).toBeNull();

  act(() => openFindOrAsk());
  fireEvent.click(screen.getByRole("option", { name: /Start a conversation/ }));
  expect(message()).toHaveValue("");
});

test("⌘K does nothing while a conversation is open", () => {
  const { dialog } = renderPalette();
  fireEvent.click(within(dialog).getByRole("option", { name: /Start a conversation/ }));
  act(() => openFindOrAsk());
  expect(screen.queryByRole("dialog", { name: "Find or ask" })).toBeNull();
  expect(screen.getByRole("dialog", { name: "Conversation" })).toBeInTheDocument();
});

test("a blank message isn't sent, and Enter sends without Shift", () => {
  const { dialog } = renderPalette();
  fireEvent.click(within(dialog).getByRole("option", { name: /Start a conversation/ }));
  const chat = screen.getByRole("dialog", { name: "Conversation" });
  const message = within(chat).getByRole("textbox", { name: "Message" });
  const sent = () => within(chat).queryAllByText("You").length;

  fireEvent.change(message, { target: { value: "   " } });
  fireEvent.click(within(chat).getByRole("button", { name: /Send/ }));
  expect(sent()).toBe(0);

  fireEvent.change(message, { target: { value: "Why is Ana late?" } });
  // Shift+Enter and the Enter that commits an IME word add a line, not a message.
  expect(fireEvent.keyDown(message, { key: "Enter", shiftKey: true })).toBe(true);
  expect(fireEvent.keyDown(message, { key: "Enter", keyCode: 229 })).toBe(true);
  expect(fireEvent.keyDown(message, { key: "Enter", isComposing: true })).toBe(true);
  expect(sent()).toBe(0);

  const scroll = vi.spyOn(Element.prototype, "scrollIntoView");
  // A plain Enter sends, cancels the newline, and brings the reply into view.
  expect(fireEvent.keyDown(message, { key: "Enter" })).toBe(false);
  expect(sent()).toBe(1);
  expect(message).toHaveValue("");
  expect(scroll).toHaveBeenCalled();
});

test("the conversation keeps the subject it started from when the route changes", () => {
  const { dialog, rerender } = renderPalette(today);
  fireEvent.change(within(dialog).getByRole("combobox"), { target: { value: COMPARE_Q } });
  fireEvent.click(within(dialog).getByRole("option", { name: /Start a conversation/ }));
  const chat = screen.getByRole("dialog", { name: "Conversation" });
  expect(chat).toHaveTextContent(/Whose post do you mean/);

  // Browser Back (or any hash change) lands on Sparkling Citrus while the chat is open.
  rerender(
    <StoreProvider>
      <FindOrAskPalette route={citrus} />
    </StoreProvider>,
  );
  expect(within(chat).getByText(/^About:/)).toHaveTextContent(/^About: Portfolio$/);

  fireEvent.change(within(chat).getByRole("textbox", { name: "Message" }), {
    target: { value: "Compare it with her last three" },
  });
  fireEvent.click(within(chat).getByRole("button", { name: /Send/ }));
  expect(within(chat).getAllByText(/^Whose post do you mean/)).toHaveLength(2);
  expect(chat).not.toHaveTextContent(/compared early performance/);
});

test("a conversation started on Sparkling Citrus keeps answering about Mei after leaving", () => {
  const { dialog, rerender } = renderPalette(citrus);
  fireEvent.click(within(dialog).getByRole("option", { name: /Start a conversation/ }));
  rerender(
    <StoreProvider>
      <FindOrAskPalette route={today} />
    </StoreProvider>,
  );
  const chat = screen.getByRole("dialog", { name: "Conversation" });
  expect(within(chat).getByText(/^About:/)).toHaveTextContent(
    "About: Portfolio › Brightside Beverages › Sparkling Citrus launch",
  );
  fireEvent.change(within(chat).getByRole("textbox", { name: "Message" }), {
    target: { value: COMPARE_Q },
  });
  fireEvent.click(within(chat).getByRole("button", { name: /Send/ }));
  expect(chat).toHaveTextContent(/compared early performance/);
});
