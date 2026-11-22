import type { WidgetId } from "@/components/rail/select";
import type { Route } from "@/router";

/**
 * Scripted answers for the Find or ask conversation. The first entry whose `match`
 * and `where` both pass wins. `where` limits an answer to the place the
 * conversation started; leave it out for answers that make sense anywhere.
 * A production build would call an agent with the current object and its data;
 * here a small table keyed on recognizable questions keeps the demo deterministic.
 */
export type ScriptedReply = {
  match: RegExp;
  where?: (route: Route) => boolean;
  reply: string;
  /** A widget from the rail library to show under the reply, filled with the campaign in view. */
  widget?: WidgetId;
};

/** A scripted answer: the text, and optionally a library widget to show with it. */
export type Answer = { text: string; widget?: WidgetId };

type CampaignRoute = Extract<Route, { view: "campaign" | "goal" | "lineup" }>;

/** Pages about exactly one campaign, so a campaign-level widget has something to show. */
export const onOneCampaign = (route: Route): route is CampaignRoute =>
  route.view === "campaign" || route.view === "goal" || route.view === "lineup";

/** Mei's live Reel belongs to this campaign, so "her last three" only makes sense here. */
export const onSparklingCitrus = (route: Route) =>
  onOneCampaign(route) && route.id === "cmp-sparkling-launch";

const COMPARE = /\bcompare\b|\blast three\b/i;

/** True when the question names one of these creators and asks to compare. */
const comparesCreator = (names: string) =>
  new RegExp(`^(?=.*\\b(${names})\\b)(?=.*(\\bcompare\\b|\\blast three\\b))`, "is");

const MEI_COMPARE =
  "I compared early performance, since Mei's Reel went live on Nov 15. At day 3 it has 4.1% engagement against an average of 3.2% for her last three Reels at the same point, so it's tracking above her pattern and should land near 1.4M views. I can also compare wording, audience, or expected outcome instead.";

export const REPLIES: ScriptedReply[] = [
  {
    match: /\bana\b/i,
    reply:
      "Ana's draft was due Nov 17 and she hasn't replied since Nov 11, after two reminders. Her go-live is Nov 24, so there are six days left. Ben is the approved backup. In Today I've proposed a last nudge through her manager, with a swap to Ben if she doesn't answer by tomorrow.",
  },
  {
    // Answered with a widget from the rail library, not a paragraph (principles §8).
    // Before the creator and compare entries, so "similar campaigns" stays about
    // the campaign when it names Mei, Ben, or others (tested). Ana still wins: her story first.
    match: /\bsimilar campaigns?\b/i,
    where: onOneCampaign,
    reply: "Here's this campaign against similar ones. It's the same compare widget as the rail.",
    widget: "compare",
  },
  {
    // Nothing single to compare from here; the same pointer as the compare widget's empty state.
    match: /\bsimilar campaigns?\b/i,
    reply: "Which campaign? Open one and ask again, and I'll compare it with similar campaigns.",
  },
  {
    // A compare question about another creator: only Mei has a live post, so say so
    // rather than answer about her. Drop a name once that creator has a live post.
    // Keep this before the Mei entry: a question naming both declines (tested).
    match: comparesCreator("ben|jules|rio|sky"),
    reply: "I only have Mei's Reel live to compare right now.",
  },
  {
    // Naming Mei says whose post it means, so answer from anywhere.
    match: comparesCreator("mei"),
    reply: MEI_COMPARE,
  },
  // Entries that name their subject come first, so "How does Ana compare with Ben?"
  // gets Ana wherever it's asked. The broad risk summary comes last.
  {
    // Ambiguous ask: the agent picks a dimension, says which, and offers the others (principles.md).
    match: COMPARE,
    where: onSparklingCitrus,
    reply: MEI_COMPARE,
  },
  {
    // Nobody is in context here, so ask whose post rather than guess.
    match: COMPARE,
    reply:
      "Whose post do you mean? The only live post right now is Mei's Reel on Sparkling Citrus launch. Ask about Mei's Reel, or ask from that campaign, and I'll compare it with her last three.",
  },
  {
    match: /\b(risks?|this week|attention)\b/i,
    reply:
      "Three things need you this week: Ana's overdue draft on Sparkling Citrus, Rio's draft that misses the disclosure check, and the Spring serum goal waiting for client sign-off. Everything else is on track.",
  },
];

/** Suggests only questions that make sense where the conversation started. */
export function fallbackFor(route: Route): string {
  const tries = onSparklingCitrus(route)
    ? "how Mei's Reel compares with her last three, how this campaign compares with similar campaigns, why Ana is late, or what's at risk this week"
    : onOneCampaign(route)
      ? "how this campaign compares with similar campaigns, why Ana is late, or what's at risk this week"
      : "why Ana is late or what's at risk this week";
  return `I can't answer that one in this prototype. Try asking ${tries}.`;
}

export function answerTo(question: string, route: Route): Answer {
  const hit = REPLIES.find((r) => r.match.test(question) && (r.where?.(route) ?? true));
  if (!hit) return { text: fallbackFor(route) };
  return hit.widget ? { text: hit.reply, widget: hit.widget } : { text: hit.reply };
}

export const replyTo = (question: string, route: Route): string => answerTo(question, route).text;
