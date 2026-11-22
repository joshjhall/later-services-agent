# Proposal card

**Status:** Implemented in prototype · **Code:** `app/src/components/widgets/ProposalCard.tsx`

How the agent asks the CM for a decision. Used in the decision queue, campaign view, and anywhere a judgment call surfaces.

## Anatomy

| Part | Required? | Notes |
| --- | --- | --- |
| Severity badge | Yes | Needs you now / Soon / When ready. Ordered by consequence × time. |
| Output class | Yes | "Proposal" or "Information request", beside the severity badge. See [output classes](output-classes.md). |
| Context line | Yes | Account · campaign, so the card stands alone outside its page. |
| Confidence | Yes | high / medium / low. Words, not a percentage. |
| Title | Yes | What happened, in plain words: "Ana Reyes is quiet, draft 1 day late." |
| Summary | Yes | One or two sentences of situation. |
| Evidence | Yes | Per-criterion rows. See [evidence and confidence](evidence-and-confidence.md). |
| Assumed / If wrong | Information requests only | What the agent assumed and what changes if it's wrong. See [output classes](output-classes.md). |
| Actions | Yes | Exactly one primary, the rest quiet. Each tagged with its [autonomy lane](autonomy-lanes.md). Labels name the decision recorded, and match any sheet the card opens. See [decide an exception](../03-pattern/decide-an-exception.md). |

An option that sends a message (for example "Send fix request" or "Draft the email") opens the drafted message in `DraftSheet` instead of resolving in place; Send resolves the card and records one permanent entry.

## States

Default, Resolved, Already handled, Stale (see [states](../01-foundation/states.md)). Resolving is idempotent: the card's id is a key derived from the situation, so a second resolve is a no-op.

## Do / Don't

| Do | Don't |
| --- | --- |
| Lead with the situation, then the options | Lead with the agent's recommendation |
| Show the backup or fallback inside the card | Make the CM go find alternatives |
| Say "6 days to go-live" | Say "risk score 0.73" |
