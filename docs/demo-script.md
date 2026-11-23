# Demo script

A path through the prototype for the 15–20 minute walkthrough, in the deck's order. Run `just present` (or `just dev`) and open <http://localhost:5173>. All data is fictional; the demo date is Nov 18, 2026. The signed-in user is Maya, on the account management team.

**Moving between steps:** Today is home. Most steps start by going back to **Today** (top bar or sidebar) and opening the card that needs Maya, which is the deck's point: she works from what needs her, not from a menu. Each step's first line says how to get there; the routes in the headings are fallbacks if a click goes wrong.

**The through-line:** the slides argue for one record, guardrails in code, and asking less so the asks matter. Step 2 shows all three live by raising the agent's spending cap until it acts on its own, and step 9 shows the result in the record. If time runs short, cut steps 3 and 4, never 2 or 9.

## Before you start

- `AGENT_POLICY.maxDailySpend` in `app/src/agent/rules.ts` is `1000`. At that value nothing runs on its own, so the demo opens with every boost needing approval.
- `rules.ts` is open in the editor, scrolled to `AGENT_POLICY`, for step 2.
- The prototype and the slides are both loaded (`just present`), with the presenter view on a second screen.
- Reload the prototype tab once, so no earlier decisions carry over. State lives in memory and resets on reload, and editing `rules.ts` reloads it too, so the cap change in step 2 must come before any decisions.

## 0. Framing (30 seconds)

- Later's own words: an **agentic factory** with a polished front desk. Goal and lineup are **design time** (approve a plan). The quiet creator is **run time** (decide an exception). The CM supervises the factory and tunes it.
- These are informed guesses from three conversations and public material, not research with a Services pod. Say what I'd validate first.
- Point at the layout once: navigation and **Find or ask** across the top, the work in the middle, and a rail of widgets on the right (slide 3). The collapsible left sidebar is a stopgap while navigation moves to the top bar.

## 1. Today, grouped by need (`#today`)

- The header counts the decisions that need Maya and the things the agent handled on its own. Say the number; step 2 changes it.
- Cards are grouped by what they need, not by account: **Needs you now**, **Ready to move**, **Waiting on someone**, **Things to do**, and a collapsed **On track** list. Within a group, consequence × time sets the order.
- Card anatomy: severity, context, confidence in words, per-criterion evidence, and every option tagged with who can do it: **Automatic**, **Needs approval**, or **A person only**.
- The rail shows a summary, the next scheduled message (Edit or Send now), and recent activity.

## 2. Guardrails in code: let the agent spend (`rules.ts` and Today)

This is slide 2 made real, and it comes early on purpose: changing the cap reloads the app, which clears any decisions made so far. Do it before Maya decides anything, so everything she does afterwards adds to the record. Find the boost card in **Ready to move**: "Boost Mei Tanaka's post from reserve". Every option reads **Needs approval**, and the **Agent cap** row says $1,000/day, above it, so it needs you.

1. **Raise the cap to $5,000.** In `rules.ts`, set `maxDailySpend: 5000` and save. The app reloads by itself (if the card doesn't change, reload the tab). The $4,000 option now reads **Pre-approved**: it fits under the cap. But nothing happened on its own, because the agent *recommends* $8,000, and that's still over the cap. It asks, and says why. *"The limit is in code, not in a prompt. The agent can't talk its way past it."*
2. **Raise it to $8,000** and save. The boost card stays in **Ready to move** but arrives already resolved: **"Boost $8,000 · done by the agent · logged"**. In the Today header, decisions needing Maya drop by one and things the agent handled go up by one. *"Fewer asks, so the ones left get read. That's the whole trade."*
3. **Say what still waits.** Messages and offers never run on their own, whatever the cap: anything that leaves the building waits for a person. And spend is totalled per campaign, so a second boost that would go over the cap stays open.

If asked about the $200 per-test cap from the slides: it's in `AGENT_POLICY` but nothing reads it yet, because the prototype has no test-spend proposal. Say so.

Leave the cap at $8,000 for the rest of the demo, so the agent's entry stays in the record until step 9.

## 3. Find or ask (⌘K or `/`)

- Click **Find or ask** in the top bar, or press ⌘K. Typing filters **Go to** (accounts, campaigns, creators, Roster, and Activity) and **Do** (nudge Ana, open Ana's brief, review the Spring serum goal, and review the Holiday gifting lineup).
- Type `what are the risks this week`. The last row is always **Start a conversation about…**. Choose it: the palette becomes a conversation, with a line saying what it's about.

## 4. A conversation docked in the rail

*Get there:* continue from step 3, with the conversation still open.

- Choose **Dock**. The conversation moves into the rail and follows you from page to page.
- Open the **Sparkling Citrus launch** campaign (breadcrumb or palette) and ask `how does this compare with similar campaigns`. The answer is the **compare widget**, the same widget the rail uses. One library serves the rail, chat answers, and later the core screens.
- Ask `compare` with nobody named on another page and the agent asks whose post you mean, instead of guessing.
- Close the conversation; the rail's widgets come back.

## 5. Stating the goal (`#goal/cmp-spring-serum`)

*Get there:* close the conversation, go to **Today**, and under **Needs you now** choose **Review goal** on "Confirm goal and KPIs for Spring serum". (The long way, to show Plan · Make · Run: **Lumen Skin › Spring serum**, the **Plan** tab, then **Goal and KPIs**.)

- The agent shows what it read (brief and kickoff notes), what it extracted, a proposed objective with its reasoning, and KPIs with the benchmark it used.
- Change the objective to show the downstream redraft flag. Edit a target.
- **Until #94 lands:** the client email is fixed text, so it ignores both edits. Change the objective back and don't edit a target before opening the email, or the draft will contradict the screen.
- **Confirm and draft client email** opens a draft sheet to Priya Rao with the two clarifying questions. "Confirm" means ready for the client, not final. **Not yet** closes it and records nothing.

## 6. Reviewing the lineup (`#lineup/cmp-holiday-gifting`)

*Get there:* this is a different client (Brightside Beverages), so there's no link from the goal screen. Press ⌘K and type `lineup`, then choose **Review the Holiday gifting lineup**. Saying "different client, so I'll jump" shows the palette doing its job. (Or go to **Today** and choose **Review lineup** under **Needs you now**.)

- Roster first, then the wider index, against criteria the CM approved earlier.
- **Met**, **Partly**, or **Not met** per criterion instead of a fit score. Ana's flag (late elsewhere) connects to the hard moment. Theo starts removed because of a competitor conflict.
- **Hana Sato is a partial entry**: "Needs: rate and usage rights". The totals show open items, and it never blocks approval: partial entries are allowed, and the gaps travel with the record.
- Switch people between **In lineup**, **Backup**, and **Remove**, and watch fees against the budget and the reach forecast. **Approve lineup** is an internal gate; nothing reaches the client until the CM presents it.

## 7. The hard moment: a creator goes quiet (`#today`, Needs you now)

*Get there:* after **Approve lineup**, go to **Today**. Ana's card is first under **Needs you now**. Point out that the lineup and goal cards you just handled now read as logged.

- "Ana Reyes is quiet, draft 1 day late." The agent already sent two reminders on its own. It escalates now because slack, history, and backup availability crossed the policy line.
- **Call Ana** (A person only) opens a call brief: what the agent knows, what to ask, and what each answer means. Choose **She'll deliver Friday**, **Swap to Ben**, or **No answer yet**. The card resolves once and the decision is logged.
- Swapping is one click because Ben was approved as the backup during the lineup review.

## 8. Drafts and information requests

*Get there:* stay on **Today** and scroll to **Ready to move**. Rio's draft and Ana's audience request are both there, next to the boost the agent ran in step 2.

- **Rio's draft** ("misses 1 of 7 brief checks"): the card leads with the one failed check, disclosure on screen; the six passes collapse to one row. The options follow Later's own review states: **Send fix request** (decline unless fixed), **Approve with changes**, and **Approve**. Send fix request opens the agent's draft in a sheet: edit it, then **Send** or **Not yet**.
- **Ana's audience** is a different class of output, an **Information request**: the agent says what it assumed (a mostly US audience, from her profile), what happens if it's wrong, and offers **Draft the email** to her manager or **Mark confirmed**.
- The label on each card says which class it is. Sending writes a permanent entry; closing the sheet records nothing.

## 9. One record, any actor (`#activity`)

*Get there:* **Activity** in the sidebar, or ⌘K and type `activity`.

- **Activity** is one history for the whole pod: the system, the agent, and people (Maya and Jordan). It's the log on slide 2, live.
- The agent's own entry from step 2, **Ran "Boost $8,000" on its own · within the agent's cap**, marked **Spent**. Above it, Maya's decisions from steps 5–8, Jordan's call to Ana, and the system's reminder. Different authors, one history.
- Internal changes show **Undo**. Anything that left the building shows **Permanent**, and money shows **Spent**. Neither can be edited: the fix is a new entry (slide 5, "what happened can't be edited"). Undo is simulated in the prototype, and it says so.
- The Roster's reliability numbers are produced by the agent as it works.

## 10. Tuning the robot (if time)

- Change `AGENT_POLICY.escalateWithinDays` live. A CM's repeated correction would propose exactly this change; today it's one line in the rules layer.
- Afterwards, set `maxDailySpend` back to `1000` before the next run-through.

## Live-change candidates

| Ask | Where | Effort |
| --- | --- | --- |
| "Re-brand it" | `app/src/theme/seed.ts`: change `SEED` | 1 line |
| "Escalate sooner or later" | `app/src/agent/rules.ts`: `AGENT_POLICY.escalateWithinDays` | 1 line |
| "Let the agent send more reminders first" | `AGENT_POLICY.autoReminders` | 1 line |
| "Show a different spending cap" | `AGENT_POLICY.maxDailySpend`, then reload. $1,000: nothing runs on its own. $5,000: the $4,000 option reads Pre-approved, but the agent still asks, because it recommends $8,000. $8,000: the agent boosts on its own, and Activity shows it as the agent's spend. Already step 2; reach for it whenever "is it enforced?" comes up | 1 line |
| "Change the per-test cap" | `AGENT_POLICY.maxTestSpend` is quoted in the brief but not read yet (no test-spend proposal exists); say so and offer `maxDailySpend` instead | 0 lines |
| "Show different widgets in the rail" | `selectRail()` in `app/src/components/rail/select.ts`: add, drop, or reorder a widget id for a screen (2–4 widgets; `summary`, `compare`, `next-message`, and `activity`) | 1 line |
| "Re-price a boost option" | the `boosts` list in the boost rule in `rules.ts` (the buttons and the cap row both follow) | 1 line |
| "Add an evidence row" | the `evidence` array in the matching rule in `rules.ts` | ~3 lines |
| "Answer another question in chat" | add an entry to `REPLIES` in `app/src/components/palette/responses.ts` (a pattern and a reply; first match wins, so mind the order) | ~4 lines |
| "Add polish as a criterion" | `criteria` in `app/src/agent/drafts.ts` (lineup) | ~5 lines |
| "Send the creator brief after lineup approval" | wire `messageDrafts["brief:cr-ana"]` (`app/src/agent/drafts.ts`) to **Approve lineup** in `app/src/views/LineupView.tsx`, copying GoalView's pattern (import `DraftSheet`, a `drafting` state, open it in the click handler, and render the sheet). Note: that brief is for Spring serum, not Holiday gifting, and the code comment says briefs go out after the *client* approves, so say that as you do it | ~10 lines |
| "Change a creator's history" | `app/src/domain/fixtures.ts` | 1 line |
