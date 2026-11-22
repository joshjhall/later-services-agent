/**
 * Scripted answers for the Find or ask conversation. The first matching entry wins.
 * A production build would call an agent with the current object and its data;
 * here a small table keyed on recognizable questions keeps the demo deterministic.
 */
export type ScriptedReply = { match: RegExp; reply: string };

export const REPLIES: ScriptedReply[] = [
  {
    // Ambiguous ask: the agent picks a dimension, says which, and offers the others (principles.md).
    match: /\bcompare\b|\blast three\b/i,
    reply:
      "I compared early performance, since Mei's Reel went live on Nov 15. At day 3 it has 4.1% engagement against an average of 3.2% for her last three Reels at the same point, so it's tracking above her pattern and should land near 1.4M views. I can also compare wording, audience, or expected outcome instead.",
  },
  {
    match: /\b(ana|late|quiet)\b/i,
    reply:
      "Ana's draft was due Nov 17 and she hasn't replied since Nov 11, after two reminders. Her go-live is Nov 24, so there are six days left. Ben is the approved backup. In Today I've proposed a last nudge through her manager, with a swap to Ben if she doesn't answer by tomorrow.",
  },
  {
    match: /\b(risks?|this week|attention)\b/i,
    reply:
      "Three things need you this week: Ana's overdue draft on Sparkling Citrus, Rio's draft that misses the disclosure check, and the Spring serum goal waiting for client sign-off. Everything else is on track.",
  },
];

export const FALLBACK =
  "I can't answer that one in this prototype. Try asking how this compares with her last three, why Ana is late, or what's at risk this week.";

export function replyTo(question: string): string {
  return REPLIES.find((r) => r.match.test(question))?.reply ?? FALLBACK;
}
