# Autonomy lanes

*Lanes say what the agent is **allowed** to do for each action type. What it **produces** is described by [classes of agent output](output-classes.md): an auto action shows up as an action taken; a propose action as a draft or proposal.*

**Status:** Implemented in prototype · **Code:** `app/src/components/widgets/LaneBadge.tsx`

Every action shows who will carry it out:

| Lane | Label | Meaning | Examples |
| --- | --- | --- | --- |
| auto | Automatic | Done without asking; logged; undoable where possible | Reminders, post verification, pacing updates |
| propose | Needs approval | Agent prepares it; the CM's click sends it | Offer to a backup, boost from reserve |
| human | A person only | Only a person can do this | Calling a creator, approving creative, client messages |

Rules: anything external (creators, clients) or involving money *starts* in **propose** or **human**. Lanes are set per action type and are raised as the record shows an action is safe, so approvals stay rare enough to be read. Limits on auto actions (caps, thresholds) are enforced in code, never only in the prompt. An auto option runs on its own only when it is the agent's recommendation (the primary option); an auto option the agent didn't recommend stays on the open card with its badge reading **Pre-approved**, and the CM's click carries it out without further sign-off. Every **auto** action appears in the activity log: a fixed rule's action is attributed to **system**, and an auto option the agent ran on its own recommendation to **agent**; the trace underneath says which rule or agent, and which version.
