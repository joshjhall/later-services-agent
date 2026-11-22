# Approve a plan

**Status:** Implemented in prototype · **Owner:** TBD · **Last updated:** 2026-11-21

The **design-time** review: the agent has drafted something that commits the campaign to a direction (KPI framework, match criteria, lineup), and the CM approves it before anything is spent or sent. It maps to the conductor agent's "design time" (*Interview*). Examples: `#goal/<id>`, `#lineup/<id>`.

## Composition

1. **What the agent read** (inputs), so the CM can see what it missed.
2. **The criteria** the plan was built against, already approved or approved here first.
3. **The plan, item by item**, with [per-criterion evidence](../02-ai/evidence-and-confidence.md). Each item can be edited in place (target field, In lineup / Backup / Remove).
4. **Live consequences** of edits: budget against cap, forecast against target, and anything downstream that will be redrafted.
5. **The gate**: one primary action naming what it unlocks ("Approve lineup", "Confirm and draft client email"), its [autonomy lane](../02-ai/autonomy-lanes.md), and one line on what stays gated afterwards ("Nothing goes to the client until you present it").

## Behavior

- The agent drafts; the CM edits; the CM's approval is an **internal** gate. The client only sees what the CM later presents.
- Edits that invalidate later steps are called out in place ("You changed the objective. The agent will redraft KPIs and the lineup criteria").
- The primary action is disabled, with a reason, when the plan breaks a hard constraint (over budget).
- Approval seals the milestone. A later change means an explicit, attributed reopen (framing §6).

## Do / Don't

| Do | Don't |
| --- | --- |
| Name the gate: "Approve lineup" | "Submit", "Done", "Confirm" with no object |
| Say what stays gated after approval | Imply the client sees it now |
| Show criteria before results | Show a ranked list with a single fit score |
| Keep one Strong action on the page | Put Save and Approve side by side as equals |
