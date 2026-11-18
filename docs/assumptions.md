# Assumptions

Each entry is either public information about Later (sources in [discovery/research.md](discovery/research.md)) or *invented* for the exercise. The brief asks for assumptions to be written down, so add them as they are made.

## About Later and the Services team

- Later Services runs fully managed campaigns for enterprise brands, from strategy through sourcing, production and reporting. Kickoff to first post takes 2–4 weeks. *Public.*
- Work is done by **account pods**: Account Manager, Coordinators/Co-Ops, Talent Partnerships, with Strategy, Paid Media and Creative alongside. *Public (job postings).*
- Later Influence is the system of record for campaigns, with a 12-stage creator workflow, draft review states, and stage-triggered automations. The agent operates on top of it. *Public; integration invented.*
- Later EdgeAI already provides performance forecasts and creator-mix recommendations, and the agent consumes them rather than reinventing them. *Public product; usage invented.*
- Creator intake (sign-ups, the Later Creator app) belongs to Creator Operations, not Services. *Public (job postings).*

## About the campaign manager

- "Campaign manager" in the brief corresponds to Later's **Account Manager**: owns a portfolio of client accounts and is measured on delivery, client trust, renewal and expansion. *Public (job postings); the mapping is ours.*
- A CM runs about 4–6 accounts with 2–4 live campaigns each, and each campaign has 10–40 creators. *Invented.*
- The CM already supervises human coordinators, so "review the agent the way you'd review a new coordinator" is a familiar model. *Inference.*

## About campaigns and money

- Creator fees are mostly committed at contracting (flat fee or 50/50). Mid-flight flexibility comes from an amplification reserve, the next wave, and swaps, not from released tranches. *Industry practice; Later's specifics not public.*
- Each campaign holds a 20% paid amplification reserve. Spending more than $5k of it, or more than 25%, needs client approval. *Invented.*
- Production workback: brief T-14, draft T-7, approval T-3, live T-0. *Public (Later blog).*
- Whitelisting/Spark rights are negotiated per creator and may be missing or expiring. *Industry practice.*

## About the agent

- The agent acts alone on logistics (reminders, receipt tracking, post verification, internal status), proposes judgment calls, and never speaks to the client or commits money without approval in v1. *Design decision.*
- Autonomy is set per action type and can be raised or revoked. *Design decision.*
- The reminder cadence before a draft deadline is T-10, T-8 and T-7. The agent escalates when the draft is late and slack to go-live falls below a threshold that depends on the creator's history and whether a backup is available. *Invented.*
- Every proposal carries per-criterion evidence and a confidence level, not a single opaque score. *Design decision.*
- Several people and the agent update the same campaign concurrently, often through overlapping batches. Updates are keyed and idempotent, milestones gate on sets of facts rather than sequences, and stale writes become conflict cards rather than overwrites. *Design decision.*

## About the prototype

- LLM behavior is simulated with scripted, deterministic responses. *Constraint of the 2–4 hour timebox.*
- All brands, creators, campaigns and numbers in the demo are fictional. *Invented.*
- The demo's hard moment is "a creator goes quiet with a deadline close." *Design decision.*
