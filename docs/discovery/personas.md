# Personas

Who the prototype is for, and who it has to work around. Built from public job postings, what Later leadership said during the interview process, and inference. **No user research stands behind these.** They are provisional personas meant to be replaced by real ones after the first round of interviews and shadowing (see "What would change this persona"). Names and details are *Invented*; roles are *Public* (Later job postings) unless marked.

The primary persona is the person the screens are designed for. Secondary personas use the same screens or are directly affected by them. The stakeholder shapes the design but gets no surface in v1.

| Persona | Role | Relationship to the agent | In the prototype |
| --- | --- | --- | --- |
| **Maya**, Account Manager | Accountable for delivery and renewal | Supervises it: approves plans, decides exceptions, tunes policy | Primary: every screen |
| **Jordan**, Coordinator | Executes under the AM | Works beside it on the same record; the agent takes most of their chasing | Secondary: shares the queue and log |
| **Theo**, Talent Partnerships | Casts and negotiates with creators and managers | Consumes its shortlists; owns out-of-band terms | Secondary: lineup and roster |
| **Ana**, Creator | Delivers content | Receives the agent's messages; never sees its internals | Affected: reminders, fix requests, swaps |
| **Dana**, Brand lead (client) | Buys the outcome | Sees only what the AM puts their name on | Affected: decks, notes, wrap reports |
| **Later leadership** | Owns cost to serve and the agentic roadmap | Measures whether the factory runs | Stakeholder: metrics, policy |

## Primary: Maya, Account Manager

> "I don't need to do the chasing. I need to know the moment the chasing stops working, and what my options are."

**Role.** Owns a portfolio of 4–6 brand accounts with 2–4 live campaigns each (*Invented* load). Measured on on-time and on-brief delivery, client trust, renewal and expansion (*Public*). Delegates execution to coordinators and QAs their work. Runs client status meetings, wrap reports and SBRs.

**A day today** (inferred). Starts in email, Slack and Later Influence in parallel. Rebuilds the state of each campaign from memory and message threads. Chases creators, brand reviewers and internal payment approvals. Writes status updates by hand. The judgment work (who to cast, when to escalate, what to tell the client) gets the leftover time.

**A day with the agent.** Starts on **Today**: a ranked decision queue across accounts. The agent has already sent the routine reminders, verified posts and updated pacing, all visible in the log. Maya approves plans (design time), decides exceptions (run time), and when she keeps correcting the same thing, accepts the agent's proposed policy change.

**Goals**

- Never be surprised by a client. Know about a slip before the client does, with a plan.
- Spend time on judgment and relationships, not reconstruction and chasing.
- Hit the KPIs agreed at kickoff, and be able to explain any miss.
- Trust what the agent did without re-checking all of it.

**Frustrations** (inferred)

- State is scattered across tools; nothing says "what needs me".
- Status reporting is manual and repeats information that already exists somewhere.
- The current tool shows the whole factory floor, and she has to know where not to look (*Interview*: the airport where you can see the baggage belts).
- Labels and buttons mean different things in different places (*Interview*).

**Trust needs.** Sees *why* (evidence per criterion), not a score. Sees what the agent did alone, and can undo it. Nothing new reaches a client or spends money without her; as a kind of action proves safe it becomes automatic, so what still reaches her is worth reading. Can change how the agent behaves without filing a ticket.

**Context.** Desktop, many tabs, constant interruptions. Works in five-minute gaps between calls, so every card has to stand alone.

**What the design gives her:** the decision queue, the two review patterns, the call brief, the Activity record, per-action autonomy.

**What would change this persona:** if AMs turn out to hand the queue to coordinators entirely, the coordinator becomes primary and the AM view becomes a portfolio summary.

## Secondary: Jordan, Coordinator

> "Half my day is sending the same reminder and checking whether it worked."

**Role.** Executes campaigns under one or two AMs: briefs, sourcing support, contracting, product fulfillment, draft collection, reporting data, and acts as "voice of the influencer" (*Public*). Probably the role whose workload the agent absorbs first.

**Goals.** Clear ownership: know what's theirs and what's the agent's. Never double-message a creator. Learn the judgment calls by watching how the AM decides them.

**Frustrations** (inferred). Repetitive chasing. Finding out someone else already did it. Being blamed for a slip the system could have seen coming.

**Trust needs.** One shared record: "already sent by the agent, 10 min ago" instead of a duplicate. Attribution on every action. The agent never contacts a creator the coordinator is mid-conversation with.

**Design implications.** The same queue and log as the AM, filtered to their scope. Conflict cards when their update and the agent's collide (flows §9). A real career question to handle with care: if the agent absorbs the chasing, the role moves toward exception handling and creator relationships. That should be an explicit choice, not a side effect.

**What would change this persona:** if coordinators already batch their chasing with templates and automations, the gain is smaller and moves to draft review and reporting.

**In the prototype:** implied only (log attribution). No separate view.

## Secondary: Theo, Talent Partnerships

> "The agent can find 200 people who match the filters. I know which 8 will actually show up."

**Role.** Casting expert embedded in the account pod. Negotiates with creators, agents and managers. The posting asks for experience applying AI to operations (*Public*).

**Goals.** Shortlists that respect what they know: reliability, how a creator is to work with, who is represented by whom. Terms that stay inside the rate band without a long email chain.

**Trust needs.** The agent searches the roster first and says when a candidate is new. Relationship notes are never overwritten by the agent's data. Out-of-band rates, exclusivity and talent-manager negotiations stay human.

**What would change this persona:** if casting happens before the AM sees anything, the lineup review belongs to Talent, and the AM reviews only the final deck.

**In the prototype:** the lineup's "On roster / New to us" badges and the roster's reliability numbers.

## Affected: Ana, Creator

> "I'm running a small business out of my phone. Be human with me."

**Role.** A mid-tier TikTok creator, booked by competing brands, represented by a talent manager at higher tiers. Creators are businesses but behave like consumers (*Interview*).

**What matters to her.** Clear briefs, one point of contact, fair and on-time pay (48% of creators report late payment, *Public*), and no robotic double reminders.

**Design implications.** Every agent message to a creator is idempotent (one reminder per key) and written in consumer-grade tone, in the coordinator's or AM's name. A fix request reads like a person wrote it. A creator who prefers calls gets a call from a person, not a third email. Silence is a signal to escalate, not to send more.

**In the prototype:** the hard moment (reminders, escalation, call brief) and the draft fix request.

## Affected: Dana, Brand lead (client)

> "I bought an outcome. Show me it's on track, and tell me early if it isn't."

**Role.** The client's marketing lead. Approves the lineup and drafts, often on a 48–72h SLA with legal behind it (*Public*, industry).

**Design implications.** The front desk (*Interview*): Dana never sees the agent, confidence levels or logs, only what the AM puts their name on (lineup deck, status notes, wrap report). She's also a source of delay, so the agent chases brand review politely, through the AM. A client note about a slip is drafted only when go-live or a KPI is actually affected.

**In the prototype:** nothing is client-facing. "Nothing goes to the client until you present it" marks the boundary.

## Stakeholder: Later leadership

Owns cost to serve and the move from AI-assisted to agentic (*Interview*). Needs proof the factory runs: time per campaign per AM, on-time and on-brief rates, KPI attainment, how many action types have moved to the agent, and how often its actions are reversed. The design's job is to make those numbers fall out of the record (every action is logged with an actor), not to build a dashboard in v1.
