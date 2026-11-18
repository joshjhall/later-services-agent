# Style treatment

**Status:** Draft

Choose two things independently.

**Information** (what it means):

| Style | Use for | Token |
| --- | --- | --- |
| Neutral | Trivial actions, or actions nested in other components | `muted` / `secondary` |
| Primary | The one main action in a region | `primary` |
| Secondary | Supporting actions | `secondary` |
| Accent | Agent-originated suggestions | `accent` |
| Positive | Success, on-track | `success` |
| Negative | Destructive, failing, late | `destructive` |
| Notice | Needs attention soon; informational | `warning` / `info` |

**Hierarchy** (how loud):

| Hierarchy | Treatment | shadcn |
| --- | --- | --- |
| Strong | Filled | `default` / `destructive` variant |
| Subtle | Tonal container | `secondary` variant or `*-container` classes |
| Quiet | Outline or text only | `outline` / `ghost` / `link` variant |

At most one Strong action per region. A late creator is *Negative + Strong* on the severity badge, while the actions inside the card stay *Primary + Strong* (one) and *Neutral + Quiet* (rest).
