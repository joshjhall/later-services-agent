# Button

**Status:** Draft · **Code:** `app/src/components/ui/button.tsx` (shadcn)

Triggers an action. For navigation use a link styled as a button (`asChild` with `<a>`).

## Anatomy

| Part | Required? | Notes |
| --- | --- | --- |
| Label | Yes | Verb first: "Approve lineup", "Call Ana" |
| Leading icon | No | Lucide; only when it speeds recognition |
| Trailing icon | No | Rare; for menus or external links |
| Loading spinner | No | Replaces the leading icon; keep the label |

## Style

| Information × hierarchy | `variant` |
| --- | --- |
| Primary × Strong | `default` |
| Negative × Strong | `destructive` |
| Neutral or Secondary × Subtle | `secondary` |
| Neutral × Quiet | `outline`, `ghost` |
| Inline text action | `link` |

One `default` button per region.

## Sizes

`sm` in cards and dense rows, `default` in forms and page headers, `icon` for icon-only (with `aria-label`).

## States

Default, Hovered, Pressed, Focused, Disabled (see [states](../01-foundation/states.md)). In agent cards, a resolved action is removed and replaced by its outcome rather than disabled.

## Accessibility

- Enter and Space activate. Icon-only buttons need `aria-label`.
- Toggle buttons set `aria-pressed`.

## Do / Don't

| Do | Don't |
| --- | --- |
| "Swap to Ben" | "Confirm" |
| Show the autonomy lane under agent actions | Put two `default` buttons side by side |
