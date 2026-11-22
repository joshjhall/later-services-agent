# Badge

**Status:** Draft · **Code:** `app/src/components/ui/badge.tsx` (shadcn)

A short, non-interactive label for status or category.

## Style

| Use | Classes |
| --- | --- |
| Severity: needs you now | `bg-destructive text-destructive-foreground` |
| Severity: soon | `bg-warning-container text-on-warning-container` |
| Severity: when ready | `bg-info-container text-on-info-container` |
| Status: on track | `bg-success-container text-on-success-container` |
| Stage or category | `variant="secondary"` or `variant="outline"` |
| Actor: system | `variant="outline"`, cog icon, text `system` |
| Actor: agent | `bg-success-container text-on-success-container`, bot icon, text `agent` |
| Actor: person | `variant="secondary"`, user icon, the person's name |

Always pair a container fill with its on-color.

Actor chips are composed in `app/src/components/widgets/ActorChip.tsx`. The actor is stored data on every activity entry; never infer it from the action text.

## Content

One to three words, sentence case. Never the only carrier of meaning: pair it with text or position.
