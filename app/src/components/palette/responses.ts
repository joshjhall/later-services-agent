import type { Route } from "@/router";

/**
 * Scripted answers for the Find or ask conversation. The first entry whose `match`
 * and `where` both pass wins. `where` limits an answer to the place the
 * conversation started; leave it out for answers that make sense anywhere.
 * A production build would call an agent with the current object and its data;
 * here a small table keyed on recognizable questions keeps the demo deterministic.
 */
export type ScriptedReply = { match: RegExp; where?: (route: Route) => boolean; reply: string };

/** Mei's live Reel belongs to this campaign, so "her last three" only makes sense here. */
export const onSparklingCitrus = (route: Route) =>
  (route.view === "campaign" || route.view === "goal" || route.view === "lineup") &&
  route.id === "cmp-sparkling-launch";

const COMPARE = /\bcompare\b|\blast three\b/i;

export const REPLIES: ScriptedReply[] = [
  {
    match: /\bana\b/i,
    reply:
      "Ana's draft was due Nov 17 and she hasn't replied since Nov 11, after two reminders. Her go-live is Nov 24, so there are six days left. Ben is the approved backup. In Today I've proposed a last nudge through her manager, with a swap to Ben if she doesn't answer by tomorrow.",
  },
  // Entries that name their subject come first, so "How does Ana compare with Ben?"
  // gets Ana wherever it's asked. The broad risk summary comes last.
  {
    // Ambiguous ask: the agent picks a dimension, says which, and offers the others (principles.md).
    match: COMPARE,
    where: onSparklingCitrus,
    reply:
      "I compared early performance, since Mei's Reel went live on Nov 15. At day 3 it has 4.1% engagement against an average of 3.2% for her last three Reels at the same point, so it's tracking above her pattern and should land near 1.4M views. I can also compare wording, audience, or expected outcome instead.",
  },
  {
    // Nobody is in context here, so ask whose post rather than guess.
    match: COMPARE,
    reply:
      "Whose post do you mean? The only live post right now is Mei's Reel on Sparkling Citrus launch. Ask from that campaign and I'll compare it with her last three, or name another creator's post.",
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
    ? "how Mei's Reel compares with her last three, why Ana is late, or what's at risk this week"
    : "why Ana is late or what's at risk this week";
  return `I can't answer that one in this prototype. Try asking ${tries}.`;
}

export function replyTo(question: string, route: Route): string {
  const hit = REPLIES.find((r) => r.match.test(question) && (r.where?.(route) ?? true));
  return hit?.reply ?? fallbackFor(route);
}
