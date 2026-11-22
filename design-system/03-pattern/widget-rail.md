# Widget rail

**Status:** Implemented in prototype · **Owner:** TBD · **Last updated:** 2026-11-22

The right rail beside the core view: 2–4 self-contained widgets **selected** from a fixed library and filled with the data in view. The system never generates UI ([principles §8](../../docs/principles.md#8-widgets-are-self-contained-and-selected-never-generated)). Shown on Today, an account, a campaign, and a lineup. Code: `app/src/components/rail/`.

## Composition

1. **Scope**: the campaigns in view, derived from the route (`scope.ts`). Today is the whole portfolio; an account is its campaigns; a campaign or lineup is that one campaign.
2. **Selector**: one function, `selectRail(route, facts)` in `select.ts`, returns widget ids in order. It is the only place the choice is made, so it can be changed live. An empty list hides the rail and the core takes the full width.
3. **Widgets**: each a card (`WidgetCard`) with a title and its own body. No primary actions; the rail supports the decision in the core, it doesn't make it.

## The widget contract

Every widget in the registry (`WIDGETS` in `widgets.tsx`) declares:

| Part | What it means | Example |
| --- | --- | --- |
| **Accepts** | The data it can show, and from where. The selector (or, in production, a model) may only pick widgets whose data is available. | Compare: one campaign, comparable campaigns, and a category benchmark |
| **Space** | It fits the rail's width and stacks; it never assumes the core's width. | Bars, not tables |
| **Data volume** | One widget, any amount of data. Its layout changes with the volume rather than spawning a different widget. | Compare: 0 → benchmark fallback, 1 → side by side, several → ranked list with this one marked |
| **State** | Its own empty state, written in plain language. | "Nothing scheduled." |

## The library

| Widget | Accepts | Empty state |
| --- | --- | --- |
| Summary (output class [summary in context](../02-ai/output-classes.md)) | Open proposals in scope | "Nothing needs you here. The agent is handling it." |
| Recent activity | The [one record](../../docs/principles.md#2-one-record-any-actor), filtered to scope | "No activity here yet." |
| Next scheduled message | Queued messages not yet sent; Edit opens the draft sheet, Send now records one permanent entry | "Nothing scheduled." |
| Compare to similar campaigns | One campaign, comparables, and a category benchmark | "No comparable campaigns yet." plus the benchmark |

## Behavior

- The selection is deterministic: the same route and data give the same widgets. In production a model would choose from widgets whose declared data fits, and a rule takes over as patterns settle ([principles §3](../../docs/principles.md#3-rules-first-agent-for-the-exceptions-human-for-the-ambiguous)).
- Widgets update with the store: sending the next message removes it, and the widget drops out when nothing else is queued.
- **Docked conversation.** Docking the conversation puts it in the rail in place of the widgets, on every page, with the text entry at the bottom. It follows the page you're on; Expand returns it full screen, Close gives the rail back to its widgets. Code: `app/src/components/palette/chat.tsx`.
- **Widgets as answers.** A scripted answer may name a widget from the same library (`widget` in `responses.ts`); the conversation renders it live in its card under the text, filled with the campaign in view. One library serves the rail, chat answers, and eventually the core screens.

## Do / Don't

| Do | Don't |
| --- | --- |
| Add a widget to the library, with its contract, then a rule that picks it | Render ad hoc UI in the rail for one screen |
| Handle 0, 1, and many in the same widget | Hide a widget because it has little data; show the fallback |
| Name the output class when a widget is agent output ("Summary") | Put the screen's primary action in the rail |
