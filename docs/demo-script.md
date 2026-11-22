# Demo script

A path through the prototype for the 15–20 minute walkthrough, in the deck's order. Run `just present` (or `just dev`) and open <http://localhost:5173>. All data is fictional; the demo date is Nov 18, 2026. The signed-in user is Maya, on the account management team.

## 0. Framing (30 seconds)

- Later's own words: an **agentic factory** with a polished front desk. Goal and lineup are **design time** (approve a plan). The quiet creator is **run time** (decide an exception). The CM supervises the factory and tunes it.
- These are informed guesses from three conversations and public material, not research with a Services pod. Say what I'd validate first.
- Point at the layout once: navigation and **Find or ask** across the top, the work in the middle, and a rail of widgets on the right. The left sidebar stays, because the existing product's navigation stays home.

## 1. Today, grouped by need (`#today`)

- The header counts the decisions that need Maya and the things the agent handled on its own.
- Cards are grouped by what they need, not by account: **Needs you now**, **Ready to move**, **Waiting on someone**, **Things to do**, and a collapsed **On track** list. Within a group, consequence × time sets the order.
- Card anatomy: severity, context, confidence in words, per-criterion evidence, and every option tagged with who can do it: **Automatic**, **Needs approval**, or **A person only**.
- The rail shows a summary, the next scheduled message (Edit or Send now), and recent activity.

## 2. Find or ask (⌘K or `/`)

- Click **Find or ask** in the top bar, or press ⌘K. Typing filters **Go to** (accounts, campaigns, creators, Roster, and Activity) and **Do** (nudge Ana, open Ana's brief, review the Spring serum goal, and review the Holiday gifting lineup).
- Type `what are the risks this week`. The last row is always **Start a conversation about…**. Choose it: the palette becomes a conversation, with a line saying what it's about.

## 3. A conversation docked in the rail

- Choose **Dock**. The conversation moves into the rail and follows you from page to page.
- Open the **Sparkling Citrus launch** campaign (breadcrumb or palette) and ask `how does this compare with similar campaigns`. The answer is the **compare widget**, the same widget the rail uses. One library serves the rail, chat answers, and later the core screens.
- Ask `compare` with nobody named on another page and the agent asks whose post you mean, instead of guessing.
- Close the conversation; the rail's widgets come back.

## 4. Stating the goal (Plan tab → `#goal/cmp-spring-serum`)

- From **Lumen Skin › Spring serum**, the **Plan** tab shows the campaign's phase and links to **Goal and KPIs**.
- The agent shows what it read (brief and kickoff notes), what it extracted, a proposed objective with its reasoning, and KPIs with the benchmark it used.
- Change the objective to show the downstream redraft flag. Edit a target.
- **Confirm and draft client email** opens a draft sheet to Priya Rao with the two clarifying questions. "Confirm" means ready for the client, not final. **Not yet** closes it and records nothing.

## 5. Reviewing the lineup (`#lineup/cmp-holiday-gifting`)

- Roster first, then the wider index, against criteria the CM approved earlier.
- **Met**, **Partly**, or **Not met** per criterion instead of a fit score. Ana's flag (late elsewhere) connects to the hard moment. Theo starts removed because of a competitor conflict.
- **Hana Sato is a partial entry**: "Needs: rate and usage rights". The totals show open items, and it never blocks approval: partial entries are allowed, and the gaps travel with the record.
- Switch people between **In lineup**, **Backup**, and **Remove**, and watch fees against the budget and the reach forecast. **Approve lineup** is an internal gate; nothing reaches the client until the CM presents it.

## 6. The hard moment: a creator goes quiet (`#today`, Needs you now)

- "Ana Reyes is quiet, draft 1 day late." The agent already sent two reminders on its own. It escalates now because slack, history, and backup availability crossed the policy line.
- **Call Ana** (A person only) opens a call brief: what the agent knows, what to ask, and what each answer means. Choose **She'll deliver Friday**, **Swap to Ben**, or **No answer yet**. The card resolves once and the decision is logged.
- Swapping is one click because Ben was approved as the backup during the lineup review.

## 7. Drafts and information requests

- **Rio's draft** ("misses 1 of 7 brief checks"): the card leads with the one failed check, disclosure on screen; the six passes collapse to one row. The options follow Later's own review states: **Send fix request** (decline unless fixed), **Approve with changes**, and **Approve**. Send fix request opens the agent's draft in a sheet: edit it, then **Send** or **Not yet**.
- **Ana's audience** is a different class of output, an **Information request**: the agent says what it assumed (a mostly US audience, from her profile), what happens if it's wrong, and offers **Draft the email** to her manager or **Mark confirmed**.
- The label on each card says which class it is. Sending writes a permanent entry; closing the sheet records nothing.

## 8. One record, any actor (`#activity`)

- **Activity** is one history for the whole pod: the system, the agent, and people (Maya and Jordan). The decisions just made appear as Maya's entries.
- Internal changes show **Undo**. Anything that left the building shows **Permanent**, and money shows **Spent**. (Undo is simulated in the prototype; it says so.)
- The Roster's reliability numbers are produced by the agent as it works.

## 9. Tuning the robot (if time)

- Change `AGENT_POLICY.escalateWithinDays` live. A CM's repeated correction would propose exactly this change; today it's one line in the rules layer.
- Change `AGENT_POLICY.maxDailySpend` live. The boost card's "Agent cap" row is read from it: set it to $5,000 and the card says the $4,000 option is within the cap; raise it to $8,000 or more and both are. The row compares each boost as if spent in one day, and says so, because the demo data has no boost duration. The cap is enforced, not just shown: it decides each option's lane. At $5,000 the $4,000 option flips to Automatic while $8,000 still needs approval; at $8,000 or more both are Automatic.

## Live-change candidates

| Ask | Where | Effort |
| --- | --- | --- |
| "Re-brand it" | `app/src/theme/seed.ts`: change `SEED` | 1 line |
| "Escalate sooner or later" | `app/src/agent/rules.ts`: `AGENT_POLICY.escalateWithinDays` | 1 line |
| "Let the agent send more reminders first" | `AGENT_POLICY.autoReminders` | 1 line |
| "Show a different spending cap" | `AGENT_POLICY.maxDailySpend` (the boost card's "Agent cap" row and lanes follow: at $5,000 the $4,000 boost flips to Automatic) | 1 line |
| "Change the per-test cap" | `AGENT_POLICY.maxTestSpend` is quoted in the brief but not read yet (no test-spend proposal exists); say so and offer `maxDailySpend` instead | 0 lines |
| "Show different widgets in the rail" | `selectRail()` in `app/src/components/rail/select.ts`: add, drop, or reorder a widget id for a screen (2–4 widgets; `summary`, `compare`, `next-message`, and `activity`) | 1 line |
| "Re-price a boost option" | the `boosts` list in the boost rule in `rules.ts` (the buttons and the cap row both follow) | 1 line |
| "Add an evidence row" | the `evidence` array in the matching rule in `rules.ts` | ~3 lines |
| "Answer another question in chat" | add an entry to `REPLIES` in `app/src/components/palette/responses.ts` (a pattern and a reply; first match wins, so mind the order) | ~4 lines |
| "Add polish as a criterion" | `criteria` in `app/src/agent/drafts.ts` (lineup) | ~5 lines |
| "Send the creator brief after lineup approval" | wire `messageDrafts["brief:cr-ana"]` (`app/src/agent/drafts.ts`) to **Approve lineup** in `app/src/views/LineupView.tsx`, copying GoalView's pattern (import `DraftSheet`, a `drafting` state, open it in the click handler, and render the sheet). Note: that brief is for Spring serum, not Holiday gifting, and the code comment says briefs go out after the *client* approves, so say that as you do it | ~10 lines |
| "Change a creator's history" | `app/src/domain/fixtures.ts` | 1 line |
