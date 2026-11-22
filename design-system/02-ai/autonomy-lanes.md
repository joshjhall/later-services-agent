# Autonomy lanes

*Lanes say what the agent is **allowed** to do for each action type. What it **produces** is described by [classes of agent output](output-classes.md): an auto action shows up as an action taken; a propose action as a draft or proposal.*

**Status:** Implemented in prototype · **Code:** `app/src/components/widgets/LaneBadge.tsx`

Every action shows who will carry it out:

| Lane | Label | Meaning | Examples |
| --- | --- | --- | --- |
| auto | Agent acts | Done without asking; logged; undoable where possible | Reminders, post verification, pacing updates |
| propose | Agent proposes | Agent prepares it; the CM's click sends it | Offer to a backup, boost from reserve |
| human | You decide | Only a person can do this | Calling a creator, approving creative, client messages |

Rules: anything external (creators, clients) or involving money *starts* in **propose** or **human**. Lanes are set per action type and are raised as the record shows an action is safe, so approvals stay rare enough to be read. Limits on auto actions (caps, thresholds) are enforced in code, never only in the prompt. Every **auto** action appears in the activity log, attributed to **system**; the trace underneath says which rule or agent, and which version.
