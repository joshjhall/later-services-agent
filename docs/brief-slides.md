# Brief: the deck

The deck is [`slides/slides.md`](../slides/slides.md) (Slidev). Speaker notes live in the same file, under each slide. Run `just present` to serve the prototype and the deck together: the prototype at <http://localhost:5173>, the deck at <http://localhost:5173/slides/>, and speaker notes at `/slides/presenter/1` (or `/slides/notes` for notes only). `just slides` runs the deck alone; the prototype's Vite server proxies `/slides` to it on port 3030. `slides/dist/index.html` (from `just slides-build`) is a single-page app: serve it, don't open it as a file.

**Timing:** 5 core slides in ~10 min → prototype 15–20 min → discussion 20–30 min.

## Core (one slide per heading the exercise asks for)

| # | Slide | On screen | The argument (in the notes) | Source |
| --- | --- | --- | --- | --- |
| 1 | Coordination, not judgment, eats the day | ~100 creators × ~12 stages; Plan → Make → Run; **one click: the story map** (7 activities under the three phases, the prototype slice highlighted, R1 below); a footer listing what hasn't been done | The brief's own words on coordination; three phases (run time split into Make and Run); the slice the prototype takes and why the rest is cut; the agent as a participant, not a member; candor about having no research | [framing](discovery/framing.md), [story map](discovery/story-map.md) |
| 2 | One record, any actor | Four log entries appearing one at a time, authored by *system*, *agent* and people; two cards: ask less so the asks matter, guardrails in code | Three levels of attribution (outside the pod: Maya's team; the pod: a person or *system*; engineering: rule or agent, version, prompt); rules replace agents where they can; gated actions graduate to automatic; deterministic limits | [principles §2–5](principles.md) |
| 3 | Improve the product people already use | Layout wireframe numbered 1 find or ask, 2 widgets, 3 context at the decision, 4 first drafts; one click docks (5) a conversation in the rail (messages, one widget in an answer, the entry at the bottom); four outcomes | Change at a pace people can absorb; forms first; context-aware chat answers with widgets from the same library; 3 is the evidence, the outcomes are the decision; 3 and 4 are the value | [principles §1, 6–8](principles.md), [IA](information-architecture.md) |
| 4 | What I cut, what I'd test next | Two lists (the last test: are four outcomes enough for most decisions?) and a callout: research and an engineering session on the data model before any real proposal | Full cut list in the story map; four outcomes is an assumption (35-way decisions need a different interface); efficiency, then trust, then quality; the data model is the least comfortable assumption | [story map](discovery/story-map.md#explicitly-not-in-the-prototype) |
| 5 | The design system is the product | Four cards, largest scope first: workflow contracts (inputs → output) · decision network (what each output changes next) · classes of agent output · widget contract; footer: the rest is table stakes | Order-independent milestones, no-op repeats and visible changes let many actors share a campaign; the record is the trace of decisions; one treatment per output class; widgets (and the palette) declare their contracts | [framing §6](discovery/framing.md#6-order-independence-and-concurrent-updates), [output classes](../design-system/02-ai/output-classes.md), [flows §5](flows.md#5-production-one-deliverables-life) |

Does five cover it? Slide 2 and slide 3 each hold about two slides' worth of argument, so the notes are dense. If a rehearsal runs over 10 minutes, cut the notes, not the slides. The first thing to drop is the "tune, don't just correct" point on slide 2, because the prototype shows it.

## Appendix (pulled up when asked)

Grouped by the core slide each one supports.

| # | Supports | Slide | Pull it up when… |
| --- | --- | --- | --- |
| A1 | 1 | Plan · Make · Run (Run = Measure + Amplify) | "Where do results and boosting live?" |
| A2 | 1 | From portfolio to asset, tagged as an assumption | "What's the navigation model?" |
| A3 | 2 | The creator who'd rather talk | "Can I stop it messaging someone?" |
| A4 | 2 | Who does what, per action | "What does the agent do alone?" |
| A5 | 2 | Rules first, agents for the exceptions (the 80/15/5 bar) | "How does this change over time?" |
| A6 | 3 | Find or ask, step by step (four frames) | Demo backup; "how does the palette become chat?" |
| A7 | 5 | Workflow contracts: the fast-food register (partial entries, equivalent results, any order, harmless repeats) | "Why do enterprise workflows feel so rigid?" or "What happens when two people…?" |
| A8 | 5 | Contract vs. decision network (the Ana example) | "What's the difference between a contract and a decision point?" |
| A9 | 5 | Classes of agent output, by example | "What does the agent actually produce?" |
| A10 | 5 | One widget, any amount of data (0 · 1 · ~10 · 500) | "How does the rail scale?" |
| A11 | 5 | Test small, then propose | "What could the agent do with money?" |
| A12 | — | What this is built on (10 Public · 12 Interview · 29 Invented, of 51) | "What did you make up?" |
| A13 | — | How this was made: tools (Claude Code, Wispr Flow, Kagi, this repo's tooling); where AI helped (organizing, polish, docs and summaries, the prototype); what stayed mine | "How did you use AI?" (the exercise asks for this explicitly) |

## Still open

1. **A12 counts** are from `docs/assumptions.md` as of Nov 22. Recount if assumptions change.
2. **Slides 1 and 3, and A1, A2, and A6, depend on the prototype.** After the palette, rail, and campaign tabs are built, replace the wireframe on slide 3 with a screenshot, or keep the wireframe and point to the live prototype.
3. **Not checked visually by the agent.** Headless Chromium needs system libraries the container lacks, so review it in a browser.
