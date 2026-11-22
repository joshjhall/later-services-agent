# Classes of agent output

**Status:** In prototype: actions (Activity), proposals (`ProposalCard`), drafts (`DraftSheet`), information requests (`ProposalCard`, kind `info-request`), and summaries in context (the rail's Summary widget, [widget rail](../03-pattern/widget-rail.md)) · **Related:** [autonomy lanes](autonomy-lanes.md), [proposal card](proposal-card.md), [evidence and confidence](evidence-and-confidence.md)

Every agent's work reaches people as one of a few classes. Each class looks and behaves the same whichever agent produced it, so people learn the classes once instead of learning each agent. Some classes reorganize data that already exists (summaries); others contribute something new (drafts, proposals).

| Class | What it is | What the person does | Example |
| --- | --- | --- | --- |
| **Action taken** | Something the system did, logged in the [one record](../../docs/principles.md#2-one-record-any-actor) | Nothing, or undo where still possible | "Draft reminder sent to Ana · from Maya's team" |
| **Draft or proposal** | A message to send, or a plan of action for a person to carry out | Review: approve, change or decline | A fix request for Rio; "swap Ana for Ben, the approved backup" |
| **Information request** | A gap the agent can't fill. It states the assumption it made and what would change if that assumption is wrong | Supply the information, or ask the agent to draft the request to whoever has it | "I assumed Ana's audience is mostly US from her profile. Confirm with her manager? I can draft the email." |
| **Summary in context** | The relevant data pulled together and shortened, at the point of a decision | Read it; focus where it says to | "3 of 7 drafts need you; Rio's misses the disclosure, the others are wording." |

Rules:

- **Name the class.** The user should always be able to tell which class they're looking at; each has its own treatment. In the prototype every card carries a quiet label ("Proposal" or "Information request") beside its severity, and every draft opens in a sheet titled "Draft: <kind> to <recipient>".
- **Drafts are reviewed before they leave.** Edit in the sheet, then Send. Sending writes one permanent entry from the CM's team; closing the sheet records nothing.
- **Information requests carry their assumption.** Never just ask; say what was assumed, why, and how the result would change. Example from construction estimating: "No roof pitch on the plans, so I assumed 4/12. If it's a steep 8/12 gable, roofing cost rises."
- **Actions taken are permanent once they've happened outside the system.** A sent message can't be edited or undone; a correction is a new action.
- **Not a closed list.** Add a class only when it needs a different treatment from these four; record it here first.
