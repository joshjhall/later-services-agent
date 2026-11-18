# Proposal card

**Status:** Implemented in prototype · **Code:** `app/src/components/widgets/ProposalCard.tsx`

How the agent asks the CM for a decision. Used in the decision queue, campaign view, and anywhere a judgment call surfaces.

## Anatomy

| Part | Required? | Notes |
| --- | --- | --- |
| Severity badge | Yes | Needs you now / Soon / When ready. Ordered by consequence × time. |
| Context line | Yes | Account · campaign, so the card stands alone outside its page. |
| Confidence | Yes | high / medium / low. Words, not a percentage. |
| Title | Yes | What happened, in plain words: "Ana Reyes is quiet, draft 1 day late." |
| Summary | Yes | One or two sentences of situation. |
| Evidence | Yes | Per-criterion rows. See [evidence and confidence](evidence-and-confidence.md). |
| Actions | Yes | One primary, the rest quiet. Each tagged with its [autonomy lane](autonomy-lanes.md). |

## States

Default, Resolved, Already handled, Stale (see [states](../01-foundation/states.md)). Resolving is idempotent: the card's id is a key derived from the situation, so a second resolve is a no-op.

## Do / Don't

| Do | Don't |
| --- | --- |
| Lead with the situation, then the options | Lead with the agent's recommendation |
| Show the backup or fallback inside the card | Make the CM go find alternatives |
| Say "6 days to go-live" | Say "risk score 0.73" |
