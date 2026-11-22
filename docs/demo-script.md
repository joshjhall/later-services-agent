# Demo script (draft)

A path through the prototype for the 20-minute walkthrough. Run `just dev` and open <http://localhost:5173>. All data is fictional; the demo date is Nov 18, 2026.

## 0. Framing (30 seconds)

- Later's own words: an **agentic factory** with a polished front desk. Goal and lineup are **design time** (approve a plan). The quiet creator is **run time** (decide an exception). The CM supervises the factory and tunes it.
- These are informed guesses from three conversations and public material, not research with a Services pod. Say what I'd validate first.

## 1. Today: what needs me (`#today`)

- Six decisions across three accounts, ranked by consequence × time. The agent handled three things on its own (link to the agent log).
- Point out the anatomy of a card: severity, context, confidence in words, per-criterion evidence, and every action tagged with who does it.

## 2. Stating the goal (`#goal/cmp-spring-serum`)

- The agent shows what it read and what it extracted, proposes an objective with its reasoning, and drafts KPIs with the benchmark it used.
- Change the objective to show the agent flagging the downstream redraft. Edit a target.
- Two clarifying questions go to the client. "Confirm" means ready for the client, not final.

## 3. Reviewing the lineup (`#lineup/cmp-holiday-gifting`)

- Roster first, then the wider index, against criteria the CM approved earlier.
- Met / partly / not met per criterion instead of a fit score. Ana's flag connects to the hard moment; Theo starts removed because of a competitor conflict.
- Toggle people in and out and watch fees against budget. Approval is an internal gate; nothing reaches the client until the CM presents it.

## 4. The hard moment: a creator goes quiet (`#today`, top card)

- The agent already sent two reminders on its own. It escalates now because slack, history and backup availability crossed the policy line.
- **Call Ana** opens a call brief: what the agent knows, what to ask, what each answer means. Choose an outcome; the card resolves once and the decision is logged.
- Swap is one click because the backup was approved during the lineup review.

## 4b. Exceptions first (`#today`, Rio's draft card)

- The draft checker already exists at Later. The card leads with the one failed check and a drafted fix request; the six passes collapse to a row. "Send fix request" is the primary action, not "Approve".

## 5. Trust and audit (`#log`, `#roster`)

- The log shows everything the agent did without asking, and every human decision.
- The roster's reliability numbers are produced by the agent as it works.

## 6. Tuning the robot (if time)

- Change `AGENT_POLICY.escalateWithinDays` live. A CM's repeated correction would propose exactly this change; today it's one line in the rules layer.
- Change `AGENT_POLICY.maxDailySpend` live. The boost card's "Agent cap" row is read from it: set it to $5,000 and the card says the $4,000 option is within the cap; raise it to $8,000 or more and both are. The row compares each boost as if spent in one day, and says so, because the demo data has no boost duration. Say it out loud: the cap is shown, not yet enforced. Both options still wait for the CM, and wiring the cap into each option's lane is the next step.

## Live-change candidates

| Ask | Where | Effort |
| --- | --- | --- |
| "Re-brand it" | `app/src/theme/seed.ts`: change `SEED` | 1 line |
| "Escalate sooner / later" | `app/src/agent/rules.ts`: `AGENT_POLICY.escalateWithinDays` | 1 line |
| "Let the agent send more reminders first" | `AGENT_POLICY.autoReminders` | 1 line |
| "Show a different spending cap" | `AGENT_POLICY.maxDailySpend` (the boost card's "Agent cap" row follows; display only) | 1 line |
| "Change the per-test cap" | `AGENT_POLICY.maxTestSpend` is quoted in the brief but not read yet (no test-spend proposal exists); say so and offer `maxDailySpend` instead | 0 lines |
| "Re-price a boost option" | the `boosts` list in the boost rule in `rules.ts` (the buttons and the cap row both follow) | 1 line |
| "Add an evidence row" | the `evidence` array in the matching rule in `rules.ts` | ~3 lines |
| "Add polish as a criterion" | `criteria` in `app/src/agent/drafts.ts` (lineup) | ~5 lines |
| "Change a creator's history" | `app/src/domain/fixtures.ts` | 1 line |
