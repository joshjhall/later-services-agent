# Breadcrumb

**Status:** In use · **Owner:** TBD · **Last updated:** 2026-11-22 · **Code:** `app/src/components/ui/breadcrumb.tsx` (shadcn), composed in `app/src/shell/TopBar.tsx`

Shows where you are in the object path (portfolio › account › campaign › step) in the top bar. One per screen, always in the top bar, never inside the core context. See [information architecture §1](../../docs/information-architecture.md#1-one-layout-everywhere).

## Anatomy

| Part | Required? | Notes |
| --- | --- | --- |
| Item link | Yes, for every ancestor | Navigates to that object. |
| Separator | Between items | Chevron; decorative. |
| Current page | Yes | Last item; not a link, `aria-current="page"`. |

## Style

Neutral information style, low hierarchy: muted text, current page in foreground. Labels truncate rather than wrap so the top bar keeps one line.

## Props / API

The trail comes from `crumbs(route, world)` in `app/src/router.ts`; the component only renders it. To add a level, extend `crumbs()` and its test.
