# Design system (agent-readable)

Read this index before building UI, then open only the files you need. Proposal and rationale: [`docs/design-system-proposal.md`](../docs/design-system-proposal.md). **Status: stub.**

Rules for agents:

1. Use a documented component or pattern before writing new UI. Compose; don't fork `app/src/components/ui/`.
2. Colors come from tokens only (`bg-primary`, `text-muted-foreground`, `var(--md-*)`). Never hard-code a color.
3. Pick a component's **information** style (intent) and **hierarchy** (emphasis) separately; see [style treatment](01-foundation/style-treatment.md).
4. If nothing fits, fill in [`04-component/_request-template.md`](04-component/_request-template.md) and stop for review rather than inventing a component.

## 01 Foundation

- [Tokens](01-foundation/tokens.md): where colors, radius and type come from (generated from one seed).
- [States](01-foundation/states.md): the shared state model every component references.
- [Style treatment](01-foundation/style-treatment.md): information × hierarchy, mapped to tokens.

## 02 AI and agent patterns

- [Proposal card](02-ai/proposal-card.md): how the agent asks for a decision.
- [Evidence and confidence](02-ai/evidence-and-confidence.md): per-criterion evidence, never a single opaque score.
- [Classes of agent output](02-ai/output-classes.md): actions taken, drafts and proposals, information requests, summaries in context. One treatment each, for every agent.
- [Autonomy lanes](02-ai/autonomy-lanes.md): agent acts / agent proposes / human decides, shown on every action.

## 03 Patterns

- [Approve a plan](03-pattern/approve-a-plan.md): design-time review of a drafted goal, criteria or lineup. One gate, named.
- [Decide an exception](03-pattern/decide-an-exception.md): run-time escalation. Exceptions first, one primary, same label everywhere.
- [Widget rail](03-pattern/widget-rail.md): 2–4 widgets selected from a fixed library by one rule; each declares the data it accepts and its empty state.
- [Pattern template](03-pattern/_template.md). Planned: workflow contracts (declared inputs, collected in any order, producing a declared output; partial entries show their gaps; equivalent inputs give equivalent results; repeats are no-ops; stale writes surface as conflicts; see `docs/discovery/framing.md` §6), decision network (what each output makes available or recommended next), decision queue, campaign widget, conflict card, command palette (a specialized widget that also declares what each feature can be found or done by). See `docs/principles.md` §6–8 and `docs/information-architecture.md`.

## 04 Components

- [Component template](04-component/_template.md) · [Request template](04-component/_request-template.md)
- [Button](04-component/button.md) · [Badge](04-component/badge.md) · [Breadcrumb](04-component/breadcrumb.md) · [Tabs](04-component/tabs.md)

## 05 Content

- [Voice and tone](05-content/voice-and-tone.md): how the agent writes.
