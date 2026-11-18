# States

**Status:** Draft

The shared state model. Components list which states they support and reference this file rather than redefining them.

| State | Meaning | Treatment |
| --- | --- | --- |
| Default | At rest | Base tokens |
| Hovered | Pointer over an interactive element | Slight tonal shift; never the only signal |
| Pressed | Being activated | Deeper tonal shift |
| Focused | Keyboard focus | Visible `ring` outline; never removed |
| Disabled | Not available now | Reduced opacity; explain why nearby when not obvious |
| Error | Invalid or failed | `destructive` + message saying what to do |

Agent-specific states (see [02-ai](../02-ai/)):

| State | Meaning | Treatment |
| --- | --- | --- |
| Resolved | Decision recorded | Muted card, outcome + "logged"; actions removed |
| Already handled | Someone else (or the agent) did it first | Show who and when; no duplicate action |
| Stale | Inputs changed since it was shown | Withdraw or mark changed, with the reason |
| Conflict | Two different values for one fact | Conflict card; a human decides |

Selection is not a state: a selected chip can also be hovered or disabled.

**Selected** (toggles, segmented controls, chips): use `bg-secondary text-secondary-foreground`, not `bg-muted`. With the generated palette, `muted` sits one step from card surfaces and reads as unselected. shadcn's toggle defaults to `muted`, so set the selected classes where you use it.
