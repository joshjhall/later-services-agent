# Decide an exception

**Status:** Implemented in prototype · **Owner:** TBD · **Last updated:** 2026-11-21

The **run-time** review: the plan met reality, and something crossed a policy line the agent can't resolve alone. It maps to the conductor agent's "run time" (*Interview*). It is the hard-moment pattern, and the most common card in the decision queue. Built on the [proposal card](../02-ai/proposal-card.md). Examples: quiet creator, failed draft check, post below forecast.

## Composition

1. **What happened**, in the title: "Ana Reyes is quiet, draft 1 day late."
2. **Why it crossed the line**: the evidence that triggered the escalation (slack, history, backup), failures first.
3. **Options with consequences**, each tagged with its lane. The agent's recommendation is the **one** primary action. A secondary is either an alternative or a prerequisite (call before swap).
4. **Prepared follow-through**: whatever the human step needs is already loaded (call brief, drafted fix request, backup offer).

## Behavior

- **Exceptions first.** Show what failed; collapse what passed to a count ("6 of 6 met"). Reviewing every check is for validating the agent, which is a separate surface.
- The card resolves once (idempotent key) and records the decision and its label in the log.
- The card withdraws itself if its inputs change while it waits (the creator replies; the draft arrives).
- A rejection asks for a reason. Repeated reasons become a proposed policy change ("tune, don't just correct").
- An action's label is the same on the card, in any sheet it opens, and in the log ("Swap to Ben" everywhere).

## Do / Don't

| Do | Don't |
| --- | --- |
| "Send fix request" as the primary when a check failed | "Approve" as the primary when a check failed |
| Name the person and the deadline | "Deliverable at risk" |
| Make the fallback one click (pre-approved backup) | Send the CM to find alternatives |
| Label an action for the decision it records | Label it like navigation when it resolves the card |
