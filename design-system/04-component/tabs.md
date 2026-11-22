# Tabs

**Status:** In use · **Owner:** TBD · **Last updated:** 2026-11-22 · **Code:** `app/src/components/ui/tabs.tsx` (shadcn), composed in `app/src/views/CampaignView.tsx`

Switches between the working areas of one object without leaving it. The campaign screen has three: Plan, Make, and Run. See [information architecture §4](../../docs/information-architecture.md#4-a-campaign-has-three-phases).

## Anatomy

| Part | Required? | Notes |
| --- | --- | --- |
| Tab list | Yes | One row, above the core context. |
| Trigger label | Yes | One word, sentence case. |
| Open count | No | Secondary badge, only when something in that tab needs you. |
| Panel | Yes | One per trigger. |

## Style

Neutral information style. The active tab is the only strong element; counts use `variant="secondary"` so they never compete with severity.

## Behavior

- The selected tab lives in the route (`#campaign/<id>/<tab>`), so any tab can be deep-linked and the back button works.
- With no tab in the route, open the campaign's current phase (`campaignPhase`). Every tab stays one click away.
- Proposals appear on the tab of their phase (`PROPOSAL_PHASE` in `app/src/agent/needs.ts`), never on all three.
