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
- [Autonomy lanes](02-ai/autonomy-lanes.md): agent acts / agent proposes / human decides, shown on every action.

## 03 Patterns

- [Pattern template](03-pattern/_template.md). Planned: decision queue, campaign widget, conflict card.

## 04 Components

- [Component template](04-component/_template.md) · [Request template](04-component/_request-template.md)
- [Button](04-component/button.md) · [Badge](04-component/badge.md)

## 05 Content

- [Voice and tone](05-content/voice-and-tone.md): how the agent writes.
