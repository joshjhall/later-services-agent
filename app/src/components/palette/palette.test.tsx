import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { toast } from "sonner";
import * as world from "@/domain/fixtures";
import { StoreProvider } from "@/domain/store";
import type { Route } from "@/router";
import { crumbs, href } from "@/router";
import { FindOrAskButton, openFindOrAsk, useFindOrAskShortcut } from "@/shell/FindOrAsk";
import { ConversationProvider, useConversation } from "./chat";
import { FindOrAskPalette } from "./FindOrAskPalette";
import { ACTIVITY_LABEL, buildItems, contextLine, filterItems, subjectFor } from "./items";
import { answerTo, fallbackFor, onSparklingCitrus, replyTo } from "./responses";

// The real Toaster needs matchMedia, which jsdom lacks, so assert the call instead.
vi.mock("sonner", async (actual) => ({
  ...(await actual<typeof import("sonner")>()),
  toast: vi.fn(),
}));

afterEach(() => {
  location.hash = "";
  vi.mocked(toast).mockClear();
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
    expect(crumbs(item.route!, world).at(-1)?.notFound, item.label).toBeUndefined();
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

test("a compare question about another creator gets an honest decline, not Mei's numbers", () => {
  const decline = "I only have Mei's Reel live to compare right now.";
  for (const route of [citrus, today]) {
    for (const name of ["Ben", "Jules", "Rio", "Sky"]) {
      expect(replyTo(`How does ${name} compare with their last three?`, route), name).toBe(decline);
      // Mei's comparison is with her own last three, so naming a second creator still declines.
      expect(replyTo(`How does Mei compare with ${name}?`, route), name).toBe(decline);
      expect(replyTo(`How does ${name} compare with Mei's Reel?`, route), name).toBe(decline);
    }
    // A Shift+Enter follow-up splits the name and the ask across lines.
    expect(replyTo("Ben?\nHow does he compare with his last three?", route)).toBe(decline);
    // The decline wins over the risk summary too.
    expect(replyTo("Compare Rio this week", route)).toBe(decline);
  }
  // Naming a creator without asking to compare doesn't trigger it.
  expect(replyTo("What's Jules up to?", citrus)).toBe(fallbackFor(citrus));
});

test("naming Mei says whose post it means, so the comparison answers from anywhere", () => {
  for (const route of [
    today,
    { view: "roster" },
    { view: "campaign", id: "cmp-spring-serum" },
  ] as Route[]) {
    expect(replyTo("How does Mei's Reel compare with her last three?", route)).toMatch(
      /early performance/,
    );
  }
  // The "whose post?" prompt never points at a post the agent would then decline.
  expect(replyTo(COMPARE_Q, today)).not.toMatch(/another creator/);
});

test("asking about similar campaigns answers with the compare widget, only on one campaign", () => {
  const SIMILAR = "How does this campaign compare with similar campaigns?";
  for (const route of [
    citrus,
    { view: "goal", id: "cmp-spring-serum" },
    { view: "lineup", id: "cmp-holiday-gifting" },
  ] as Route[]) {
    expect(answerTo(SIMILAR, route).widget, JSON.stringify(route)).toBe("compare");
  }
  // With no single campaign in view there's nothing to fill the widget with, so ask which.
  for (const route of [today, { view: "account", id: "acc-brightside" }] as Route[]) {
    expect(answerTo(SIMILAR, route)).toEqual({ text: expect.stringMatching(/^Which campaign\?/) });
  }
  // Naming a creator doesn't turn a campaign question into a post question.
  for (const q of [
    "How does Mei's campaign compare with similar campaigns?",
    "Compare Ben with similar campaigns",
  ]) {
    expect(answerTo(q, citrus).widget, q).toBe("compare");
  }
  // Off a campaign it still asks which campaign, rather than declining about the creator.
  expect(answerTo("Compare Ben with similar campaigns", today).text).toMatch(/^Which campaign\?/);
  // Ana comes first: naming her gets her story, without a widget.
  expect(answerTo("Compare Ana with similar campaigns", citrus)).toEqual({
    text: expect.stringMatching(/Ben is the approved backup/),
  });
  // Post questions still get Mei's Reel, as text.
  expect(answerTo(COMPARE_Q, citrus)).toEqual({ text: replyTo(COMPARE_Q, citrus) });
  expect(answerTo(COMPARE_Q, citrus).text).toMatch(/early performance/);
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
    expect(fallbackFor(route)).not.toMatch(/similar campaigns/);
  }
  // Any one campaign can be compared with similar ones; only Sparkling Citrus has Mei's Reel.
  for (const route of [
    citrus,
    { view: "goal", id: "cmp-spring-serum" },
    { view: "lineup", id: "cmp-holiday-gifting" },
  ] as Route[]) {
    expect(fallbackFor(route), JSON.stringify(route)).toMatch(/similar campaigns/);
  }
  expect(fallbackFor({ view: "goal", id: "cmp-spring-serum" })).not.toMatch(/Mei/);
});

/** Uses the conversation hook with no provider above it. */
function Orphan() {
  useConversation();
  return null;
}

test("the conversation hook needs its provider", () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  expect(() => render(<Orphan />)).toThrow(/ConversationProvider/);
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
  // A compare question that also mentions the week is still a compare question.
  expect(replyTo("How does her Reel compare this week?", citrus)).toMatch(/early performance/);
  expect(ask("How does her Reel compare this week?")).toMatch(/^Whose post do you mean\?/);
  // Words that only contain a keyword get the fallback.
  // Ana's story needs her name, not just "late".
  for (const q of ["comparable", "analytics", "template", "brisk", "Is the lineup late?"]) {
    expect(ask(q)).toBe(fallbackFor(today));
  }
});

function Shortcuts() {
  useFindOrAskShortcut();
  return null;
}

const harness = (route: Route) => (
  <StoreProvider>
    <ConversationProvider>
      <Shortcuts />
      <FindOrAskButton />
      <FindOrAskPalette route={route} />
    </ConversationProvider>
  </StoreProvider>
);

/** Render the palette (open) with the shortcut hook and top-bar button; `navigate` changes the route in place. */
function renderPalette(route: Route = citrus) {
  const view = render(harness(route));
  act(() => openFindOrAsk());
  return {
    dialog: screen.getByRole("dialog", { name: "Find or ask" }),
    navigate: (to: Route) => view.rerender(harness(to)),
  };
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

const doActions = items.filter((i) => i.group === "Do" && i.route);

test.each(doActions.map((i) => [i.label, i] as const))(
  "%s goes where it points and closes the palette",
  (label, item) => {
    location.hash = "#activity"; // every action points somewhere else
    const { dialog } = renderPalette();
    fireEvent.click(within(dialog).getByRole("option", { name: label }));
    // biome-ignore lint/style/noNonNullAssertion: filtered to route-bearing actions
    expect(location.hash).toBe(href(item.route!));
    expect(screen.queryByRole("dialog", { name: "Find or ask" })).toBeNull();
  },
);

test("Nudge Ana says her follow-up decision waits in Today", () => {
  const { dialog } = renderPalette();
  fireEvent.click(within(dialog).getByRole("option", { name: "Nudge Ana" }));
  expect(toast).toHaveBeenCalledWith("Ana is in Today: choose how to follow up.");
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

test("⌘K is left to the browser while a conversation is open, and claimed otherwise", () => {
  const { dialog } = renderPalette();
  fireEvent.click(within(dialog).getByRole("option", { name: /Start a conversation/ }));
  // fireEvent returns false when the event was default-prevented.
  expect(fireEvent.keyDown(window, { key: "k", metaKey: true })).toBe(true);

  fireEvent.keyDown(screen.getByRole("dialog", { name: "Conversation" }), { key: "Escape" });
  expect(fireEvent.keyDown(window, { key: "k", metaKey: true })).toBe(false);
  expect(screen.getByRole("dialog", { name: "Find or ask" })).toBeInTheDocument();
});

test("closing a conversation returns focus to the Find or ask button", async () => {
  const { dialog } = renderPalette();
  fireEvent.click(within(dialog).getByRole("option", { name: /Start a conversation/ }));
  fireEvent.keyDown(screen.getByRole("dialog", { name: "Conversation" }), { key: "Escape" });
  expect(screen.queryByRole("dialog", { name: "Conversation" })).toBeNull();
  // Radix restores focus on the next tick.
  await waitFor(() =>
    expect(document.activeElement).toBe(screen.getByRole("button", { name: /Find or ask/ })),
  );
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
  const { dialog, navigate } = renderPalette(today);
  fireEvent.change(within(dialog).getByRole("combobox"), { target: { value: COMPARE_Q } });
  fireEvent.click(within(dialog).getByRole("option", { name: /Start a conversation/ }));
  const chat = screen.getByRole("dialog", { name: "Conversation" });
  expect(chat).toHaveTextContent(/Whose post do you mean/);

  // Browser Back (or any hash change) lands on Sparkling Citrus while the chat is open.
  navigate(citrus);
  expect(within(chat).getByText(/^About:/)).toHaveTextContent(/^About: Portfolio$/);

  fireEvent.change(within(chat).getByRole("textbox", { name: "Message" }), {
    target: { value: "Compare it with her last three" },
  });
  fireEvent.click(within(chat).getByRole("button", { name: /Send/ }));
  expect(within(chat).getAllByText(/^Whose post do you mean/)).toHaveLength(2);
  expect(chat).not.toHaveTextContent(/compared early performance/);
});

test("a conversation started on Sparkling Citrus keeps answering about Mei after leaving", () => {
  const { dialog, navigate } = renderPalette(citrus);
  fireEvent.click(within(dialog).getByRole("option", { name: /Start a conversation/ }));
  navigate(today);
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

test("a new conversation picks up the page it was started from", () => {
  const { dialog, navigate } = renderPalette(citrus);
  fireEvent.click(within(dialog).getByRole("option", { name: /Start a conversation/ }));
  fireEvent.keyDown(screen.getByRole("dialog", { name: "Conversation" }), { key: "Escape" });

  navigate(today);
  act(() => openFindOrAsk());
  fireEvent.change(screen.getByRole("combobox"), { target: { value: COMPARE_Q } });
  fireEvent.click(screen.getByRole("option", { name: /Start a conversation/ }));

  const chat = screen.getByRole("dialog", { name: "Conversation" });
  expect(within(chat).getByText(/^About:/)).toHaveTextContent(/^About: Portfolio$/);
  expect(chat).toHaveTextContent(/Whose post do you mean/);
});
