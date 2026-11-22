---
theme: default
title: An agent in the pod
info: Later VP, UX take-home. Brief for the Services campaign-management agent.
colorSchema: light
aspectRatio: 16/9
canvasWidth: 980
transition: fade
mdc: true
---

<div class="kicker">Later · Services · VP, UX take-home</div>

# An agent in the pod

<p class="lede muted">Services campaign management, with the agent doing the chasing</p>

<div class="foot">An informed direction from a few hours and three conversations, not a researched proposal.</div>

<!--
~15 s.

One sentence on how to read it: this is a direction to test, not a spec. The 5 slides take ~10 minutes, the prototype takes most of the 20, and the appendix is there for questions.
-->

---
clicks: 1
---

<div class="kicker">1 · The problem</div>

# Coordination, not judgment, eats the day

<div class="muted mt-2">~100 creators per campaign · each moving through ~12 stages</div>

<div v-if="$clicks === 0" class="flex items-stretch gap-3 mt-10">
<div class="card flex-1"><div class="lede">Plan</div><span class="muted">goal · KPIs · lineup<br/><b>approve a plan</b></span></div>
<div class="text-3xl muted self-center">→</div>
<div class="card flex-1 strong"><div class="lede">Make</div><span class="muted">briefs · nudges · drafts · approvals<br/><b>decide an exception</b>: a creator goes quiet</span></div>
<div class="text-3xl muted self-center">→</div>
<div class="card flex-1"><div class="lede">Run</div><span class="muted">go live · amplify · measure<br/><b>decide an exception</b>: a post underperforms</span></div>
</div>

<div v-else class="mt-5"><StoryMap /></div>

<div class="foot">Not done yet: user research · shadowing a pod · heuristic review · competitive teardown</div>

<!--
~2 min.

- The brief's own words: the campaign manager spends most of their time on coordination (tracking deliverables, chasing creators, checking content, updating brands). Judgment is what's left over.
- Scale: Later's CTO used a 100-creator campaign as his example. Later Influence tracks each creator through about a dozen stages, from candidate to paid. Every creator owes deliverables, and every one of those can stall.
- Three phases. Plan: the goal, KPIs, and lineup, where the account manager approves a plan before anything is spent or sent. Make: producing the assets, which is where the chasing is, including the routine nudging that is probably the easiest big win. The hard moment, a creator going quiet, lives here. Run: content is live, money gets spent on amplification, and results are measured against the KPIs.
- [click] The story map: the whole job, left to right, grouped by phase. Seven activities, with "run my day" (the queue, the log, tuning the agent) across all of them. The highlighted row is what the prototype builds: taking the brief, casting, and producing content, which are the brief's three required moments. Planning, contracting, and reporting are cut because they reuse the same review patterns. R1 below is the smallest version that could run a real campaign. Full map, with R2 and Later rows, in docs/discovery/story-map.md.
- What I heard from Later: a conductor agent with a design time and a run time. For the account manager, run time is two different jobs: making the content is coordination-heavy, and running it is money and measurement. Different decisions, different risks.
- The agent is a participant in the pod, not a member. It takes on the coordination, and the account manager stays accountable.
- Be candid: this scenario is really the job being hired for. I haven't interviewed users, reviewed the current product, or looked at comparable industries. So I'm not proposing the quick wins in today's UI, though there are certainly many. Everything here is a hypothesis.
-->

---

<div class="kicker">2 · Trust and control</div>

# One record, any actor

<div class="log mt-6">
<div v-click="1" class="entry"><span class="t">Mon 9:02</span><span class="what">Draft reminder sent to Ana · from Maya's team</span><span class="chip rule">system</span></div>
<div v-click="2" class="entry"><span class="t">Tue 14:40</span><span class="what">Called Ana · no answer, left voicemail</span><span class="chip human">Jordan</span></div>
<div v-click="3" class="entry"><span class="t">Wed 10:15</span><span class="what">Fix request sent to Rio · from Maya's team</span><span class="chip agent">agent</span></div>
<div v-click="4" class="entry"><span class="t">Wed 16:30</span><span class="what">Lineup approved · Holiday gifting</span><span class="chip human">Maya</span></div>
</div>

<div v-click="5" class="mt-8 grid grid-cols-2 gap-6 text-sm">
<div class="card"><b>Ask less, so the asks matter</b><div class="muted mt-1">Routine work runs on its own. Escalations are rare, so they get read.</div></div>
<div class="card"><b>Guardrails in code, not prose</b><div class="muted mt-1">Caps, thresholds, and rules the model can't argue with.</div></div>
</div>

<!--
~2.5 min. Each click adds an entry; the point is one history, several authors.

- One history for the whole pod. Whoever does the work (a person, a rule, an agent) writes the same entry in the same place. Before anyone acts, they can see what already happened: the reminder already went out, Jordan already called. No double-sends, and limits on repeat reminders are checked against the record, not the sender.
- The pod sees who acted: a person, the system, or the agent. (The slide separates system and agent to make the point. In the product I'd lean toward one "system" label: most people don't care whether a rule or an agent did it, and that mix will shift over time.)
- Outside the pod, nobody sees the machinery. Every message to a creator or client comes from Maya's team. Who actually sent it is internal.
- Underneath, the detail is complete: which rule or agent, which version, what prompt and inputs, and what came out. That's how we diagnose problems and improve.
- That detail also tells us what to automate. Look across the agent's history for the routine, repeated cases and turn them into plain rules and code. Don't use a model where a rule works, the same way you don't use the biggest model when a smaller one is good enough.
- [click 5] Ask less, so the asks matter. If the account manager's job becomes approving everything the agent suggests, approval turns into a reflex: you click "continue" without reading. That's what happened with coding agents, and it's why reducing the number of prompts mattered so much. So new kinds of action start gated, especially external messages and money, and move to automatic as the record shows they're safe. Escalation paths stay deliberately few, so an escalation means something.
- Guardrails in code, not prose. A prompt telling a model not to do something isn't a guardrail; I've watched agents do exactly what they were told not to. Limits are enforced by rules: for example, the agent can spend up to $200 per test with a cap of $1,000 per campaign per day, and a $20,000 buy is blocked and escalated. Adversarial review and pattern matching catch the rest.
- Control depends on context: narrow it per action type, per account, or for one creator. For example, a creator who prefers calls: the system alerts me instead of messaging them, I call, and the call goes in the same record.
-->

---
clicks: 1
---

<div class="kicker">3 · Interaction</div>

# Improve the product people already use

<div class="grid gap-6 mt-4" style="grid-template-columns: 1.7fr 1fr">
<div style="height: 280px"><Layout labels :chat="$clicks >= 1" /></div>
<div class="text-sm steps">
<div>1 · Find or ask</div>
<div :class="{ on: $clicks === 0 }">2 · Widgets, selected not generated</div>
<div class="strong-step">3 · Context at the decision</div>
<div class="strong-step">4 · First drafts and feedback</div>
<div :class="{ on: $clicks >= 1 }">5 · Chat, docked beside the work</div>
</div>
</div>

<div class="muted mt-4 text-sm">Forms first · most decisions: approve · with changes · decline unless · decline</div>

<!--
~2.5 min. One click: the rail becomes the conversation.

- The product is in production. Change too much too fast and people get frustrated and give up on it. So the existing UI stays home, and everything new is added on top and opt-in.
- Layout: navigation across the top, with Find or ask at top center so the palette has a visible home as well as a shortcut. Core context gets ~75%, where the work happens. A rail gets ~25%, and it comes and goes with context.
- 1: Find or ask. Typing takes over the screen and suggests places to go, actions, and always "start a conversation about this." Keep typing and only the conversation fits. (The prototype shows this.)
- 2: The rail draws from a fixed library of widgets, and the model only picks 2–4 for the context. Over time a rule takes over that choice too.
- 3: The evidence on the card, not the buttons. The system gathers what someone would otherwise look up (audience fit, on-time history, how the last post did against target), then the decision is one of four outcomes plus conditions, the same as Later's own draft review states.
- 4: The first draft. A creator brief tailored to their part of the campaign, specific without over-specifying. If that turns 5–6 revision rounds into 2–3, everyone gains. Efficiency is the first lever we can measure. Efficacy is harder and needs research.
- 3 and 4 are where the value is.
- [click] 5: The conversation can dock in the rail and continue anywhere in the app. It knows where I am and the data behind it. Answers can be text or a widget from the same library: one library for the rail, chat answers, and eventually the core screens. Ambiguous asks like "compare" get interpreted, and the agent says which dimension it chose.
- If asked how it's built: specialist agents (interpret the ask, pick the widget, fill it), orchestrated with something like LangGraph; A2A between agents; A2UI-style catalogs so the agent can only choose approved components.
-->

---

<div class="kicker">4 · Cuts and tests</div>

# What I cut, and what I'd test next

<div class="grid grid-cols-2 gap-10 mt-6">
<div>

**Cut**

- Real LLM: the agent is scripted
- Planning, contracting, and reporting
- Measure, Amplify, and experiments
- Asset screen and creator intake
- Multi-user conflicts, real undo

</div>
<div>

**Test next**

- Where does the day actually go?
- Do drafted briefs cut revision rounds?
- Which reminders can go fully automatic?
- Does one shared log build trust, or noise?
- Are four outcomes enough for most decisions?

</div>
</div>

<div class="card mt-8 text-sm"><b>Before any real proposal:</b> interviews, shadowing pods, a heuristic review of today's product, competitive analysis, and a working session with engineering on how the data is actually organized. Until then, this is a hypothesis.</div>

<!--
~1.5 min.

- What's not in the prototype (full list in the prep doc). Planning the campaign, contracting and payments, and client reporting: the story map's activities 2, 4 and 7. They reuse the same two review patterns, so they'd add screens without adding new ideas. After launch: the Measure and Amplify views, boosting from the reserve, micro-experiments. The asset-level screen, creator intake (that's Creator Operations), talent-manager routing. And the plumbing: two people editing the same thing at once, conflict cards, real undo, idempotent sending. The agent is scripted; there's no model behind it.
- Cuts were ranked with CFS (Commonality × Frequency × Severity). The story map has the scores.
- Four outcomes is a real assumption. Decisions with two, three, or five outcomes are fine in the same pattern. A decision with thirty-five ways it could go needs a different interface altogether. I'd want to know how many decisions are like that.
- Tests: efficiency first (time per decision, revision rounds, reminders that get a reply), then trust (how often people override the agent, which autonomy settings they turn off), then quality (on time, on brief, KPI attainment). Cost to serve only counts if quality holds.
- The data model is the assumption I'm least comfortable with. I've organized portfolio, account, campaign, and asset the way I would. Before proposing anything real, I'd do a heuristic review of the current product and sit down with engineering on how the data is actually structured.
- The first 90 days would be research: interviews, shadowing pods, competitive and adjacent-industry analysis, then re-rank. Until then, everything here is a hypothesis.
-->

---

<div class="kicker">5 · Standardize</div>

# The design system is the product

<div class="grid grid-cols-4 gap-4 mt-6 text-sm">
<div class="card"><b>Workflow contracts</b><div class="muted mt-2">defined inputs, collected in any order · a defined output · repeats change nothing · changes are never silent</div></div>
<div class="card"><b>Decision network</b><div class="muted mt-2">each output changes what's available or recommended next · who acts, on what · recorded, permanent once it's happened</div></div>
<div class="card"><b>Classes of agent output</b>
<ul class="muted mt-2 tight">
<li>actions, taken and logged</li>
<li>drafts and proposals to review</li>
<li>requests for missing information</li>
<li>summaries in context</li>
</ul></div>
<div class="card"><b>Widget contract</b><div class="muted mt-2">space · data volume · state · data sources and types · the palette is a special case</div></div>
</div>

<div class="muted mt-8 text-sm">Standardize these, and every new agent brings only its domain logic. Components, tokens, i18n, responsive layouts, failure states, and transaction logs are table stakes.</div>

<!--
~1.5 min. Largest scope to smallest.

- If this agent is one of several (Later's CTO described an agentic factory), these four are what make this design system different. Get them right and each new agent only brings its domain logic.
- The first two go together. A contract describes one piece of work: what goes in and what comes out. The decision network is what that output changes next.
- Workflow contracts: every workflow, and every transaction inside one, declares its inputs and its output. Inputs can arrive in any order, from anyone: Ana's rate, rights, address, and disclosure, in any sequence. When they're all in, the output is produced: she's ready to brief. Doing something twice changes nothing; two people clicking "nudge" send one message. And if something changed while you were looking, you're told. That's what lets several agents and people work on one campaign at once. (Appendix: the fast-food register.)
- Decision network: outputs are where decisions happen, whether it's the output of a single transaction or of a whole workflow. Each one changes what comes next: which workflows and transactions become available, which get recommended, who acts on what. Ana's draft is late, so a swap becomes available and a call gets recommended. We standardize how each type of decision is handled (a quick approval, a choice among options, composing something like a lineup), and every one is recorded: who, and permanent once it has happened outside the system.
- Classes of agent output. Every agent's work shows up as one of a few classes, presented the same way everywhere: actions it took; drafts and proposals to review, including a plan a person carries out; requests for missing information that state the assumption made ("I assumed Ana's audience is mostly US. Can you confirm with her manager? I can draft the email."); summaries in context. Not a closed list.
- Widget contract: each widget handles its own space, data volume, and state, and declares which data sources and types it accepts (the same cost widget reads CPM, cost per click, cost per view, or cost per sale). The palette is a specialized case: it also declares what each feature can be found or done by.
- The rest (components, color, i18n, responsive layouts, outages and timeouts, and transaction logs) has to be there, but it's table stakes, not strategy. The logs are table stakes; what's strategic is that decisions and agent output are recorded in a consistent way on top of them.
- It only stays standard if someone owns it. `design-system/` is written so coding agents read it before building UI.
- → Prototype.
-->

---
layout: center
---

# Prototype

<div class="muted">Goal → lineup → a creator goes quiet → the log</div>

---
layout: section
---

# Appendix

<div class="muted">For questions</div>

---

<div class="kicker">A1 · For slide 1</div>

# Plan · Make · Run

<div class="grid grid-cols-3 gap-6 mt-10">
<div class="card"><b>Plan</b><div class="muted text-sm mt-2">goal · KPIs · lineup · backups</div></div>
<div class="card"><b>Make</b><div class="muted text-sm mt-2">briefs · nudges · drafts · approvals · scheduling</div></div>
<div class="card"><b>Run</b><div class="muted text-sm mt-2"><b>Measure:</b> KPIs vs. target · pacing · comparables<br/><b>Amplify:</b> boosts · tests · next wave</div></div>
</div>

<div class="muted mt-8 text-sm">A campaign screen opens on the phase it's in. All three stay one click away.</div>

<!--
- The same three phases as slide 1, as they'd show up on a campaign screen.
- Plan is design time in Later's CTO's terms. Make and Run split his run time: making the content is coordination; running it is money and measurement.
- Run has two halves. Measure: are we hitting the KPIs, on pace, how does this compare. Amplify: boosting what works, small tests, changes to the next wave.
- Open question: whether Amplify belongs to the account manager or to Paid Media.
-->

---

<div class="kicker">A2 · For slide 1 · <span class="chip human">assumption</span></div>

# From portfolio to asset

<div class="flex items-center gap-3 mt-10 text-lg">
<div class="card strong">Portfolio</div>→<div class="card">Account</div>→<div class="card">Campaign</div>→<div class="card">Asset</div>
<div class="card ml-6" style="border-style:dashed">Roster ↔</div>
</div>

<div class="grid grid-cols-3 gap-6 mt-10 text-sm">
<div><b>Portfolio</b> groups by need<div class="muted">blocked · ready · waiting on someone · to do · on track</div></div>
<div><b>Campaign</b> = slots × candidates<div class="muted">10 assets, 12–14 creators: backups are first-class</div></div>
<div><b>Breadcrumb</b> is the map<div class="muted">the same decision card at every level, resolved once</div></div>
</div>

<div class="muted mt-6 text-sm">My organization, not Later's data model. Verify with engineering first.</div>

<!--
- Like Reva: a few key objects, and every screen is about one of them.
- The portfolio is project management across everything, grouped by state and the next need: what's blocked, what's ready to move, who isn't responding, what needs doing.
- A campaign is a set of asset slots, each filled by one creator, usually over-cast with backups. That makes the hard moment's one-click swap possible.
- This is the assumption I'm least comfortable with. It's how I'd organize it; a heuristic review and a session with engineering come first.
-->

---

<div class="kicker">A3 · For slide 2</div>

# The creator who'd rather talk

<div class="flex items-center gap-3 mt-14 text-sm">
<div class="card">Draft due · no reply</div>→
<div class="card"><span class="chip rule">system</span> alerts <b>Maya</b>, not Ana</div>→
<div class="card"><span class="chip human">Maya</span> calls</div>→
<div class="card">Call logged in the same record</div>
</div>

<!--
- Control in context. For a sensitive creator, or one who prefers calls, the system alerts the account manager instead of messaging the creator.
- Ideally the call is captured automatically, which removes the logging step.
- Because it's one record, the cadence rule knows contact happened, so no reminder goes out an hour after the call.
-->

---

<div class="kicker">A4 · For slide 2</div>

# Who does what, per action

| Work | <span class="chip agent">System acts, logged</span> | <span class="chip">Drafted, a person approves</span> | <span class="chip human">A person only</span> |
| --- | --- | --- | --- |
| Goal | Benchmarks | KPI draft | Targets with client |
| Lineup | Screen conflicts | Lineup + backups | Final lineup |
| Production | Reminders, checker | Fix request | Calling a quiet creator |
| Go live | Verify post | Boost from reserve | Spend above threshold |
| Client | Assemble data | Status draft | Send |

<!--
Full table: framing §5. Each action starts on the right and moves left as it proves safe (a person-only task becomes a draft to approve, then an automatic action). Later's CTO calls this the maturity curve: manual → software-supported → AI-assisted → agentic.
-->

---

<div class="kicker">A5 · For slide 2</div>

# Rules first, agents for the exceptions

<div class="flex h-12 rounded-lg overflow-hidden text-sm font-semibold mt-12">
  <div class="flex items-center px-3" style="width:80%;background:var(--info-container);color:var(--on-info-container)">~80% rules: verified, predictable</div>
  <div class="flex items-center px-3" style="width:14%;background:var(--md-primary-container);color:var(--md-on-primary-container)">agent</div>
  <div class="flex items-center px-2" style="width:6%;background:var(--warning-container);color:var(--on-warning-container)">people</div>
</div>

<div class="grid grid-cols-3 gap-6 mt-8 text-sm">
<div><b>Agents find the work</b><div class="muted">what's repetitive shows up in the trace</div></div>
<div><b>Rules take it over</b><div class="muted">same answer every time, cheaper, verifiable</div></div>
<div><b>People get the ambiguity</b><div class="muted">escalations stay rare, so they get read</div></div>
</div>

<!--
- Illustrative split, not a measurement.
- Agents are a good way to discover which work is repetitive. The detailed trace (which agent, which version, what prompt) shows the routine cases; those get rewritten as rules and code.
- Don't use a model where a rule works, the same way you don't use the biggest model when a smaller one is good enough.
- The agent keeps the exceptions it can handle with guardrails. Real ambiguity goes to a person.
-->

---

<div class="kicker">A6 · For slide 3</div>

# Find or ask, step by step

<div class="grid grid-cols-4 gap-3 mt-8 text-xs">
<div class="frame"><div class="fbar">⌕ Find or ask</div><div class="fbody"></div><div class="flabel">1 · At rest, top center</div></div>
<div class="frame dim"><div class="fpal">⌕ ana<div class="fopt">Ana Ruiz · creator</div><div class="fopt">Nudge Ana</div><div class="fopt hi">💬 Start a conversation</div></div><div class="flabel">2 · Typing takes over</div></div>
<div class="frame dim"><div class="fpal">⌕ How does this compare with her last three?<div class="fopt hi">💬 Start a conversation</div></div><div class="flabel">3 · Only the conversation fits</div></div>
<div class="frame"><div class="fbody split"><div></div><div class="fchat"><div class="m">Q</div><div class="w"></div><div class="in"></div></div></div><div class="flabel">4 · Docked beside the work</div></div>
</div>

<!--
- 1: Find or ask has a visible home in the top bar, not only a shortcut key.
- 2: Typing takes over the screen; everything else goes behind a mask. It suggests places to go, actions, and always "start a conversation about this."
- 3: Keep typing and the other options stop fitting. Only the conversation is left.
- 4: The conversation can go full screen with the input at the bottom, then dock into the rail and follow you through the app. It knows where you are and the data behind it, and answers with text or a widget from the same library.
- Backup for the demo.
-->

---

<div class="kicker">A7 · For slide 5</div>

# Workflow contracts: the fast-food register

<div class="grid grid-cols-2 gap-4 mt-6 text-sm">
<div class="card strong"><b>Partial is fine</b><div class="muted mt-1">"A #1 and a #5": both go in the order now; the screen shows each still needs a size and a drink</div></div>
<div class="card strong"><b>Same order, same result</b><div class="muted mt-1">a cheeseburger, a medium fry, and a medium Coke = a medium #1 with a Coke, at the same price</div></div>
<div class="card"><b>Any order</b><div class="muted mt-1">"burger, no pickles, fries" = "fries, burger… no pickles"</div></div>
<div class="card"><b>Repeats are harmless</b><div class="muted mt-1">tapping pay twice ≠ charging twice</div></div>
</div>

<div class="muted mt-6 text-sm">Enterprise workflows get these wrong all the time. A campaign has every one of them.</div>

<!--
- The first two are the less obvious problems, and the more important ones.
- Partial is fine. A drive-through register that forces size and drink before you can add the next item makes the cashier hold "#5" in their head while they finish "#1". A good one takes both, then shows what's missing on each, and you fill it in when you get to it. For us: "add Ana and Rio to the lineup" shouldn't make me finish Ana's rate and rights before I can add Rio. Both go in; each shows what it still needs.
- Same order, same result. Ordering the parts of a meal one by one should give the same order, and the same price, as ordering the meal. Two different paths, one equivalent result. For us: a standard creator package entered as a bundle, or as its deliverables one at a time, should give the same record and the same fee.
- Any order: Ana's rate, rights, address, and disclosure arrive in any sequence, and the output ("ready to brief") is produced when the set is complete.
- Repeats are harmless: two people clicking "nudge Ana" send one message. Every external action has an idempotency key.
- (Plus: changes made while you were looking are surfaced, never silently overwritten. Conflict cards, not last-write-wins.)
- Source: framing §6, flows §9.
-->

---

<div class="kicker">A8 · For slide 5</div>

# Contract vs. decision network

<div class="grid gap-6 mt-8" style="grid-template-columns: 1fr auto 1fr">
<div class="card"><b>Contract</b> · what a piece of work takes and produces
<div class="muted text-sm mt-3">rate · rights · address · disclosure<br/>(any order, from anyone)<br/>→ <b>ready to brief Ana</b></div></div>
<div class="text-3xl muted self-center">→</div>
<div class="card"><b>Decision network</b> · what that output changes next
<div class="muted text-sm mt-3">Ana's draft is late<br/>→ a swap becomes <b>available</b><br/>→ a call is <b>recommended</b> · Maya acts</div></div>
</div>

<div class="muted mt-8 text-sm">The same holds for one transaction or a whole workflow.</div>

<!--
- A contract is transactional: these inputs, in any order, produce this output.
- The decision network looks forward: given that output, what's now available, what's recommended, and who acts next. It's how one piece of work shapes the ones after it.
- flows §5 has the deliverable's state diagram and a table of its decision points.
- If actor-network theory comes up: "A contract is a black box: these inputs, in any order, produce this output. The decision network is what that output changes next. I borrow two ideas from actor-network theory: people and systems are both actors, and a stable process can be treated as a black box. The forward-looking part is mine, not the theory's."
- Why that matters: ANT is backward-looking. It traces how a network came to be. Here the record is the trace; we reconstruct the network from it, then use that to recommend what's next. Reverse-engineering the flows is possible, but not trivial.
-->

---

<div class="kicker">A9 · For slide 5</div>

# Classes of agent output, by example

<div class="grid grid-cols-2 gap-4 mt-6 text-sm">
<div class="card"><span class="chip agent">action taken</span><div class="mt-2">Draft reminder sent to Ana · from Maya's team</div></div>
<div class="card"><span class="chip">draft or proposal</span><div class="mt-2"><b>Brief for Ana · 1 TikTok:</b> serum on camera in 3 s · "glow" beat "radiance" with this audience · #ad on screen</div></div>
<div class="card"><span class="chip human">information request</span><div class="mt-2">I assumed Ana's audience is mostly US from her profile. Confirm with her manager? I can draft the email.</div></div>
<div class="card"><span class="chip rule">summary in context</span><div class="mt-2">3 of 7 drafts need you. Rio's misses the disclosure; the others are wording.</div></div>
</div>

<!--
- Action taken: logged, permanent once sent.
- Draft or proposal: the brief is tailored to Ana's piece, specific without over-specifying. Aim: 2–3 revision rounds instead of 5–6. An analogy from construction: a general contractor rarely tells each subcontractor the handful of things most likely to surprise them; an agent that reads the whole plan can. Keep it general.
- Information request: always states the assumption and what changes if it's wrong.
- Summary in context: the data shortened to what needs attention, and why.
- Not a closed list. Spec: design-system/02-ai/output-classes.md. Examples are invented.
-->

---

<div class="kicker">A10 · For slide 5</div>

# One widget, any amount of data

<div class="grid grid-cols-4 gap-3 mt-8 text-xs">
<div class="card"><b>0</b><div class="muted mt-2">No comparable campaigns yet. Benchmarks for this category instead.</div></div>
<div class="card"><b>1</b><div class="vbars mt-2"><i style="height:70%"></i><i class="now" style="height:85%"></i></div><div class="muted">side by side</div></div>
<div class="card"><b>~10</b><div class="vlist mt-2"><i style="width:90%"></i><i class="now" style="width:78%"></i><i style="width:64%"></i><i style="width:50%"></i></div><div class="muted">ranked list, this one marked</div></div>
<div class="card"><b>500</b><div class="vdist mt-2"><i style="height:20%"></i><i style="height:45%"></i><i style="height:80%"></i><i class="now" style="height:100%"></i><i style="height:70%"></i><i style="height:35%"></i><i style="height:15%"></i></div><div class="muted">distribution, this one marked</div></div>
</div>

<div class="muted mt-8 text-sm">Same contract: space · data volume · state · data sources and types.</div>

<!--
- One "compare to similar campaigns" widget. It decides its own layout from how much data there is.
- 0: say so, and fall back to something useful. 1: side by side. About 10: a ranked list. Hundreds: a distribution with this campaign marked.
- It also handles space (rail vs. full panel) and state (loading, stale, already handled), and declares the data it accepts.
-->

---

<div class="kicker">A11 · For slide 5</div>

# Test small, then propose

<div class="flex items-center gap-6 mt-10">
<div class="card text-sm" style="width: 11rem"><b>Small tests</b><div class="muted mt-1">automatic, inside the caps</div></div>
<div class="text-2xl muted">→</div>
<div class="buckets">
<div><i style="height:100%"></i><span>Audience A</span></div>
<div><i style="height:65%"></i><span>Keyword B</span></div>
<div><i style="height:40%"></i><span>Placement C</span></div>
</div>
<div class="text-2xl muted">→</div>
<div class="card text-sm" style="width: 11rem"><b>Proposed split</b><div class="muted mt-1">Maya approves</div></div>
</div>

<div class="muted mt-8 text-sm">Tests within caps enforced in code · logged like any spend · rights required · client thresholds unchanged</div>

<!--
- Some decisions are better tested than predicted. Early on, the system runs small tests automatically, within caps enforced in code (the same $200 per test and $1,000 per campaign per day as slide 2): a few audiences, keywords, and placements.
- It combines the results with this client's history and comparable campaigns, then proposes splitting the rest of the reserve across 2–5 buckets, each with its reasoning and expected outcome. That split is a proposal; Maya approves it. Above the client threshold, the client approves.
- Needs whitelisting or partnership-ad rights in the contract.
- A bounded step toward influencer marketing as a programmatic channel, which is the direction Later described.
-->

---

<div class="kicker">A12 · Sources</div>

# What this is built on

<div class="grid grid-cols-3 gap-6 mt-10">
<div class="card"><span class="chip ok">Public</span><div class="lede mt-2">10</div><div class="muted text-sm">Later's site, case studies, job postings, industry sources</div></div>
<div class="card"><span class="chip rule">Interview</span><div class="lede mt-2">12</div><div class="muted text-sm">three conversations with Later leadership, paraphrased</div></div>
<div class="card"><span class="chip human">Invented</span><div class="lede mt-2">29</div><div class="muted text-sm">names, numbers, and design calls</div></div>
</div>

<div class="muted mt-8 text-sm">51 assumptions in docs/assumptions.md; some carry two labels · personas · story map · key paths · flows</div>

<!--
- Every claim in the docs carries one of these labels. More than half are invented or design calls, which is the honest state of a few hours' work.
-->

---

<div class="kicker">A13 · How this was made</div>

# How this was made

<div class="grid grid-cols-3 gap-6 mt-8 text-sm">
<div class="card"><b>Tools</b>
<ul class="muted mt-2 tight">
<li>Claude Code</li>
<li>Wispr Flow, for dictation</li>
<li>Kagi, for search</li>
<li>this repo's tooling, including my own containers tooling</li>
</ul></div>
<div class="card"><b>Where AI helped</b>
<ul class="muted mt-2 tight">
<li>organizing my thinking</li>
<li>a first pass at visual polish</li>
<li>the deck, the docs, and summaries of the research and my reasoning</li>
<li>building the prototype</li>
</ul></div>
<div class="card"><b>What stayed mine</b>
<ul class="muted mt-2 tight">
<li>the ideas, the framing, and the calls</li>
<li>nothing novel came from the AI</li>
<li>no failures: I used it for what it does well</li>
</ul></div>
</div>

<div class="muted mt-8 text-sm">Severely time-boxed. A starting point, not a final idea.</div>

<!--
- Tools: Claude Code for the prototype, the deck, and the docs. Wispr Flow for dictation; most of my feedback was spoken, not typed. Kagi as a search engine. Plus the tooling in this repo, including the devcontainer tooling I build and maintain. Not all of these are AI tools; this is everything I used.
- Where AI helped: organizing my thinking (my thoughts don't come out in order; this deck is the evidence), a reasonable first pass at visual polish without spending time on it, building the deck, organizing the docs, summarizing the research and my reasoning about it, and building the prototype.
- What stayed mine: the ideas, the framing, and the decisions. I haven't seen it synthesize anything novel here.
- Failures: none, because I know what these tools can and can't do and used them for that.
- Severely time-boxed. This isn't complete, and it isn't close to a final idea on any of it.
-->
