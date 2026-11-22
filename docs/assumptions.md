# Assumptions

Each entry carries one label. *Public*: published by Later or the industry (sources in [discovery/research.md](discovery/research.md)). *Interview*: said by Later leadership (CPO, CTO) during the interview process, paraphrased. *Invented*: made up for the exercise, or a design decision. The brief asks for assumptions to be written down, so add them as they are made.

These inputs are thin: three conversations and public material, with no time spent with a Services team. Treat everything here as an informed direction to validate, not a finding.

## About Later and the Services team

- Later Services runs fully managed campaigns for enterprise brands, from strategy through sourcing, production and reporting. Kickoff to first post takes 2–4 weeks. *Public.*
- Work is done by **account pods**: Account Manager, Coordinators/Co-Ops, Talent Partnerships, with Strategy, Paid Media and Creative alongside. *Public (job postings).*
- Later Influence is the system of record for campaigns, with a 12-stage creator workflow (13 named stages including Dropped, in four phases), draft review states, and stage-triggered automations. The agent operates on top of it. *Public; integration invented.*
- Later EdgeAI already provides performance forecasts and creator-mix recommendations, and the agent consumes them rather than reinventing them. *Public product; usage invented.*
- Creator intake (sign-ups, the Later Creator app) belongs to Creator Operations, not Services. *Public (job postings).*

## What Later leadership said (interview)

- Later sells **outcomes**, not software. The Services team is now the biggest internal customer of Later's own tools, and the product includes the delivery experience, timeline and client delight, not just the UI. *Interview (CPO).*
- The direction is an **agentic factory**: agents do the work; people observe, govern, and **tune the robot** when something goes wrong. Separately, brands get a polished, front-desk experience and don't see the machinery. Today's tools mix the two, like an airport where travellers can see the baggage belts. *Interview (CPO, CTO).*
- Each job moves along a **maturity curve**: manual → software-supported → AI-assisted (the human drives) → agentic (the agent starts, the human curates, governs and applies judgment and taste). Parts can go live before the whole is finished. *Interview (CPO, CTO).*
- The planned architecture has a **conductor agent** that works in two modes: **design time** (design the campaign workflow; the output is a "bill of materials") and **run time** (execute that bill of materials). *Interview (CTO).*
- The largest cost is **cost to serve**. The longer-term ambition is to make influencer marketing an **agentic, programmatic channel**, the way ad buying went programmatic. Efficiency matters, but so does the quality of outcomes. *Interview (CPO).*
- Later sees itself as strong at producing results and weaker at making agentic interfaces intuitive, both for internal users and for clients. *Interview (CTO).*
- A draft-review checker already exists as an internal prototype: it extracts content requirements from the campaign brief and checks the video and caption against them before the brand sees the draft. The CPO's view is that daily use should **summarize the findings and let the reviewer send them to the creator**, rather than ask the reviewer to confirm every check. Testing whether the checks are correct is a different job from designing daily use. *Interview (CPO); the agent consuming it is invented.*
- The creator workflow has many **variants**: product shipped or not; awareness or sales objectives. *Interview (CPO).*
- Matching criteria include brand suitability, brand safety, and the **polish** (production quality) of a creator's content. *Interview (CTO).*
- Creators are businesses but **behave like consumers**, so creator-facing touchpoints need consumer-grade care. *Interview (CTO).*
- A recurring UX gap is **action hierarchy and labeling**: the same label means different things on different screens, and secondary actions are styled as primary ones. *Interview (CPO).*

## About the campaign manager

- "Campaign manager" in the brief corresponds to Later's **Account Manager**: owns a portfolio of client accounts and is measured on delivery, client trust, renewal and expansion. *Public (job postings); the mapping is ours.*
- A CM runs about 4–6 accounts with 2–4 live campaigns each. *Invented.*
- A campaign has anywhere from about 10 to 100+ creators. *Interview (the CTO used a 100-creator campaign as the typical example); Public (Premier Protein: 78).* The demo uses small campaigns for legibility, so the queue and batch patterns have to hold at 100.
- The CM already supervises human coordinators, but supervising an agent is a different skill with different tools; the agent is a participant in the pod, not a member. *Design position; earlier drafts assumed the two were alike.*

## About campaigns and money

- Creator fees are mostly committed at contracting (flat fee or 50/50). Mid-flight flexibility comes from an amplification reserve, the next wave, and swaps, not from released tranches. *Industry practice; Later's specifics not public.*
- Each campaign holds a 20% paid amplification reserve. Spending more than $5k of it, or more than 25%, needs client approval. *Invented.*
- Production workback: brief T-14, draft T-7, approval T-3, live T-0. *Public (Later blog).*
- Whitelisting/Spark rights are negotiated per creator and may be missing or expiring. *Industry practice.*
- Objectives span the full funnel: awareness and engagement (Later Influence heritage) through affiliate sales (Later Creator, formerly Mavely). *Public; Interview (CPO).*

## About the agent

- The agent acts alone on logistics (reminders, receipt tracking, post verification, internal status), proposes judgment calls, and never speaks to the client or commits money without approval in v1. Gated action types graduate to automatic as the record shows they're safe, within code-enforced limits, so escalations stay rare enough to be read. *Design decision.*
- Autonomy is set per action type and can be raised or revoked. *Design decision.*
- The reminder cadence before a draft deadline is T-10, T-8 and T-7. The agent escalates when the draft is late and slack to go-live falls below a threshold that depends on the creator's history and whether a backup is available. *Invented.*
- Every proposal carries per-criterion evidence and a confidence level, not a single opaque score. *Design decision.*
- The agent consumes the existing draft-review checker and shows exceptions first: what failed, with evidence, and a ready-to-send fix request to the creator. Passing checks collapse. *Design decision, following the CPO's view above.*
- A CM's rejection with a reason is a **tuning signal**: repeated corrections of the same kind propose a policy change (for example, escalate this account earlier) instead of being fixed one at a time. *Design decision.*
- Behaviour the agent repeats reliably should harden into rules or code over time, leaving the agent the cases that are hard to write rules for. The prototype's `AGENT_POLICY` is that rules layer. *Design decision.*
- Several people and the agent update the same campaign concurrently, often through overlapping batches. Updates are keyed and idempotent, milestones gate on sets of facts rather than sequences, items can be added before they're complete (they show their gaps), equivalent inputs produce equivalent records, and stale writes become conflict cards rather than overwrites. *Design decision.*

## About rollout and the interface

- Later Influence is in production and account pods depend on it every day, so the agent ships as additive improvements to existing workflows, at a pace users can absorb, not as a replacement product. *Design decision.*
- People, rules and the agent produce the same record for the same action; only the attribution differs. Anti-spam limits are enforced on that shared record. *Design decision.*
- Repetitive work moves from agent to deterministic rules over time: roughly 80% rules, 10–15% agent, 5–10% escalated to a person. *Invented, illustrative.*
- Most approvals reduce to four outcomes: approve, approve with conditions, decline unless, decline. *Design decision; mirrors Later's public draft review states.*
- Chat is reachable from a command palette but is never the main way to work; forms and direct review stay primary. *Design decision.*
- A right-hand rail (about 25% of the width) shows 2–4 widgets chosen from a fixed library by context. Each widget handles its own layout and data-quantity breakpoints (0, 1, ~10, ~100, 1,000+). *Design decision.*
- Agent-drafted creator briefs and feedback can cut revision rounds from roughly 5–6 to 2–3. *Invented hypothesis; the first thing to measure.*
- The agent can spend a small, capped test budget (about 5–10% of the amplification reserve) on early micro-experiments across audiences and placements, then propose splitting the remaining spend across 2–5 buckets for a person to approve. *Invented; requires whitelisting rights.*
- The app is organized around four core objects (portfolio › account › campaign › asset) plus a cross-cutting roster. A campaign is a set of asset slots, often over-cast by 20–40% so there are backups. *Invented; see [information-architecture.md](information-architecture.md).*
- Layout: top navigation with a visible Find or ask entry point, a core context area of ~70–75% for the work, and a contextual widget rail of ~25–30%. *Design decision.*
- During the move to top navigation, the prototype keeps a collapsible left sidebar as secondary navigation (accounts with open-proposal counts, Roster, and Activity). It may go once Find or ask and the portfolio view cover those jumps. *Invented.*
- In the pod's Activity view, every entry names its actor: **system** (a rule), **agent**, or a person by name. The detailed trace (version, prompt, and inputs) sits behind that. Messages outside the pod always come from the account manager's team. *Design decision; revised from person-or-system so the record matches the "one record, any actor" slide.*
- Agent output reaches people in four named classes: actions taken, drafts and proposals, information requests, and summaries in context. Every card names its class. A draft opens in an editable sheet and goes out only when a person presses Send; the send is one permanent entry from the account manager's team, and closing the sheet records nothing. *Design decision; see `design-system/02-ai/output-classes.md`.*
- An information request states the assumption the agent made and what changes if it's wrong. The demo's example (Ana's audience assumed mostly US from her profile; her manager at "Northstar Talent" can confirm) is *Invented*. The agent-drafted creator brief exists as a fixture but isn't wired to a button, because briefs go out after the client approves the lineup, which the prototype doesn't model. *Invented; a deliberate cut.*
- Undo follows what an action touched: **internal** (status, pacing, logging) can be undone; **external** (anything sent to a creator or client, including a change agreed on a call) and **spend** are permanent, and a correction is a new entry. *Design decision; the effect taxonomy is Invented.*
- The data model (portfolio › account › campaign › asset, a campaign as slots and candidates) is organized the way I would organize it, not the way Later's data is known to be. It's the assumption I'm least comfortable with. A heuristic review of the current product and a working session with engineering come before any real proposal. *Invented; highest-risk assumption.*
- Most decisions fit four outcomes. Two, three or five are fine in the same pattern; a decision with dozens of possible outcomes needs a different interface. *Design decision; to test.*
- No user research, heuristic review or competitive teardown was done. Low-hanging improvements to the current UI are therefore not proposed. *Constraint of the timebox.*

## About the prototype

- Personas, the story map and the key path analysis are provisional, built without user research, and meant to be replaced after shadowing a pod. CFS scores and time targets in them are *Invented*. See [discovery/personas.md](discovery/personas.md), [discovery/story-map.md](discovery/story-map.md), [discovery/key-paths.md](discovery/key-paths.md). *Inference.*
- LLM behavior is simulated with scripted, deterministic responses. *Constraint of the 2–4 hour timebox.*
- All brands, creators, campaigns and numbers in the demo are fictional. *Invented.*
- The demo's hard moment is "a creator goes quiet with a deadline close." *Design decision.*
- Find or ask suggestions and conversation answers are scripted: a fixed list of places and actions, and a small table of replies keyed on recognizable questions (`app/src/components/palette/`). A production build would pass the current object and its data to an agent. *Constraint of the timebox.*
- Creators have no page of their own in the prototype, so choosing a creator in Find or ask goes to the roster. *Invented.*
- The conversation opens full screen; docking it into the rail so it follows you as you navigate (information architecture step 5) is cut for now. *Design decision; to build next.*
- Today groups proposals by need with one rule: anything critical, and any goal or lineup awaiting approval, needs you now; drafts to review, boosts, and information requests are ready to move; a quiet creator is waiting on someone; a below-forecast KPI is a thing to do. Campaigns with nothing open are on track and collapse to a count. *Invented*; the groups come from [information-architecture.md §3](information-architecture.md#3-the-portfolio-groups-by-whats-needed-not-by-name).
- A campaign opens on its phase tab even when an urgent card sits on another tab. The tab carries a count of open cards, and each card's campaign name links straight to the tab holding it. The alternative, opening on the most urgent tab, was rejected because the default tab would then move as the queue changes. *Design decision; to test.*
- The campaign's Plan tab links to the goal and lineup screens rather than embedding them, so each keeps one heading and one approval gate. *Design decision; cut for the timebox.*
- The context rail picks its widgets with one rule in `app/src/components/rail/select.ts`: summary first; compare on a single campaign or lineup; the next scheduled message when one is queued; recent activity last. No rail on goal, roster, or activity. A production build would let a model choose among widgets whose declared data fits. *Invented; design decision.*
- Scheduled messages, comparable past campaigns, and category benchmarks are fictional, sized so the compare widget shows each of its layouts (none, one, and several). *Invented.*
