# Proposal: a design system agents can read

**Status:** stub. Enough structure for agents to follow during the prototype; not a complete system.

## The idea

Give coding agents a clearly defined design system in plain markdown, so they build good UX by default and reach for agreed components instead of reinventing them. A less technical person can then prompt a prototype that is closer to production quality, easier for engineering to adopt, and less likely to drift into bad patterns. Each piece of guidance lives in one small file an agent can load on demand.

## Where it comes from

A design-system layout I've been exploring with a collaborator. The ideas below are general practice; the specifics here are adapted for this prototype. What the layout gets right:

- **Numbered, layered sections**: foundation → AI → design patterns → components → content → appendix. The number gives reading order and a stable path to cite.
- **One file per concept**, small enough to load into an agent's context without dragging in the rest. Foundation splits object style into spacing, effects, border radius, border width, sizing, **states**, style treatment, **component anatomy** and data composition.
- **A shared state model** (`07-states.md`) that every component references, instead of each component inventing hover, pressed, focused, disabled and error.
- **Two style axes on every component**: *information* (Neutral, Primary, Accent, Secondary, Positive, Negative, Notice) and *hierarchy* (Strong, Subtle, Quiet). Intent and emphasis are chosen separately, so "a quiet negative button" means one thing.
- **A component template** with fixed sections: anatomy (part, required, notes), variants, sizes mapped to tokens, states, props, accessibility (keyboard, ARIA, focus), content guidelines, do/don't. An agent can fill it consistently, and a reviewer can diff it.
- **A component-request template written for Claude**: fill it in, mark options N/A, paste it into a request. The N/A list maps directly to what the testbench disables.
- **A testbench** where designers see every component's live preview, anatomy and slot content, and how style, size and state change it. The markdown is the spec; the testbench proves the implementation matches it.

## How it applies here

The prototype already has the hard parts underneath: Material 3 tokens generated from one seed (`app/src/theme`), and shadcn/ui components (`app/src/components/ui`). What is missing is the layer that tells an agent **which** component to use, **how**, and **why**. The `design-system/` folder is that layer, with the source layout adapted:

| Source layout | Here | Why |
| --- | --- | --- |
| `04-foundation` | `design-system/01-foundation` | Tokens and states, pointing at the generated palette instead of restating values. |
| `05-ai` | `design-system/02-ai` | **The section that matters most for this exercise**: patterns for agent proposals, evidence, confidence, autonomy lanes, escalation, undo. This is what the Later VP, UX role asks for ("human-in-the-loop interactions, AI trust mechanisms, and agentic failure states"). |
| `06-design-patterns` | `design-system/03-pattern` | Composed patterns: decision queue, campaign widget, conflict card. |
| `07-component` | `design-system/04-component` | One file per component *as used here*, wrapping shadcn. |
| `08-content` | `design-system/05-content` | Voice and tone for the agent's words: plain, specific, no false precision. |

The style axes map onto the generated palette. *Information*: Neutral → `surface`/`muted`, Primary → `primary`, Secondary → `secondary`, Accent → `accent`, Positive → `success`, Negative → `destructive`, Notice → `warning`/`info`. *Hierarchy*: Strong → filled, Subtle → container/tonal, Quiet → outline or ghost.

## Patterns worth standardizing first

If this agent is one of several, these are the patterns to standardize before any component work. Each is a rule as well as a visual (*a design system is how problems are approached, not just a parts bin*).

1. **Action hierarchy.** Every card or screen has exactly **one primary action**. A secondary action is either an alternative or a prerequisite ("ask why" before "approve"). Its emphasis follows that relationship, not page position. Labels mean one thing across every product: an action called "I'm interested" can't mean "learn more" on one screen and "apply" on another. Later leadership named this as a current, cross-product gap (*Interview*). In the style axes, the primary action is Strong, the secondary Subtle, and everything else Quiet.
2. **Approve a plan** (design time). The proposal, the criteria it was built against, per-item evidence, what approval unlocks, and what stays gated after it.
3. **Decide an exception** (run time). What happened, why it crossed the line, the options with their consequences, and the agent's recommendation as the primary action.
4. **Exceptions first.** Collapse what passed and show what failed, with evidence and a ready-to-send next step. Showing every check is for validating the agent, not for daily use.
5. **Tune, don't just correct.** A rejection carries a reason. Repeated reasons turn into a proposed policy change.
6. **Front desk / back of house.** Client-facing surfaces never show agent internals (confidence, logs, autonomy). Only what a person has put their name on crosses that line.

## How agents use it

`AGENTS.md` gets one rule: **before building UI, read `design-system/README.md`, then only the files for the components and patterns you need.** The README is an index with one-line summaries, the same progressive-disclosure shape as agent memory. If no component fits, the agent fills in the component request template rather than inventing one, which keeps new patterns visible and reviewable.

## What is stubbed now vs. later

**Now** (enough to steer the prototype):

- `README.md` index, the two templates, and the state model.
- `02-ai/` with the patterns the prototype actually uses: proposal card, evidence, autonomy lanes, confidence.
- `04-component/` entries for Button and Badge, the two components where the style axes matter most.

**Later** (out of scope for the timebox):

- A testbench route in the app (`#testbench/<component>`) that renders every documented variant × state, generated from the same markdown.
- Lint rules that flag raw colors, one-off spacing, or shadcn components used outside their documented variants.
- A sync check that fails CI when a component file's variants drift from the code.

## Open questions

1. Should component specs live beside the code (`button.md` next to `button.tsx`) or in one tree? One tree is easier for designers; colocated is harder for code to drift from.
2. How much of foundation is generated (tokens from the seed) versus written? Generated where possible, so the docs can't lie.
3. Who owns it? Per "Owning the Design System": a permanent function with one accountable owner, measured by adoption.
