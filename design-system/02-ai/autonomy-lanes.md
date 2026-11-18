# Autonomy lanes

**Status:** Implemented in prototype · **Code:** `app/src/components/widgets/LaneBadge.tsx`

Every action shows who will carry it out:

| Lane | Label | Meaning | Examples |
| --- | --- | --- | --- |
| auto | Agent acts | Done without asking; logged; undoable where possible | Reminders, post verification, pacing updates |
| propose | Agent proposes | Agent prepares it; the CM's click sends it | Offer to a backup, boost from reserve |
| human | You decide | Only a person can do this | Calling a creator, approving creative, client messages |

Rules: anything external (creators, clients) or involving money starts in **propose** or **human**. Lanes are set per action type and can be raised as the agent earns trust; every **auto** action appears in the agent log.
