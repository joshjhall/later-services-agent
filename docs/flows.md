# Flows

How information moves through the system. Diagrams are Mermaid, so they render on GitHub and in VS Code with `bierner.markdown-mermaid`. The reasoning behind them is in [discovery/framing.md](discovery/framing.md).

Legend used in the swimlane notes: 🤖 the agent acts alone (logged, undoable) · 🤝 the agent proposes and the CM approves · 🧑 the human only.

## 1. The system at a glance: two sides meeting at the partnership

```mermaid
flowchart TB
  subgraph Demand["Demand side: the brand"]
    OBJ[Business objective] --> KPI[KPI framework + targets] --> CON[Constraints: budget, timing,<br/>rights, brand safety]
  end
  subgraph Supply["Supply side: creators"]
    APP[Applied / inbound creators] --> VET[Vetting] --> ROS[(Roster: vetted,<br/>known creators)]
  end

  CON --> MATCH{{Matching}}
  ROS --> MATCH
  MATCH --> LINEUP[Proposed lineup + backups] --> PROD[Production:<br/>partnerships × deliverables]
  PROD --> LIVE[Live posts] --> PERF[Performance vs. KPI] --> REP[Client reporting:<br/>status, wrap, SBR]

  PERF -.->|pacing + optimization| PROD
  ROS <-.->|reliability + results| PERF
  REP -.->|renewal, next campaign| OBJ
```

The loops matter more than the line. **Performance feeds the roster** (the roster also informs what performance to expect): every campaign updates what we know about each creator's reliability and results, which makes the next match better. **Reporting feeds renewal**: the account comes back with the next objective. That second loop is how the AM is measured.

## 2. Demand side: objective to KPI framework (the "state the goal" moment)

```mermaid
flowchart TD
  A[Client request: brief, call notes, prior campaigns] --> B[🤖 Agent extracts: product, audience, markets, timing, budget]
  B --> C[🤝 Agent proposes objective type: awareness / consideration / conversion]
  C --> D[🤝 Agent drafts KPI framework: primary KPI, targets, benchmarks, measurement method]
  D --> E{CM reviews}
  E -->|edit| D
  E -->|gaps found| F[🤝 Agent drafts clarifying questions for the client]
  F --> G[🧑 CM confirms with client]
  G --> D
  E -->|confirm| H[🧑 Targets agreed with client]
  H --> I[Campaign plan: tiers, creator count, deliverables, workback, reserve]
  I --> J[[Matching]]
```

| Objective | Primary KPIs | Measurement caveats |
| --- | --- | --- |
| Awareness | Reach, impressions, video views, CPM | Platform-reported; reach is estimated |
| Consideration | Engagement rate, saves, shares, CTR, CPE, sentiment | Engagement rate varies hugely by tier |
| Conversion | Attributed revenue, codes, affiliate sales, CPA, ROAS | Codes leak and undercount the halo effect; agree the method up front |
| (Reported, contested) | EMV | Later uses the Ayzenberg index; many clients distrust it |

## 3. Supply side: creator intake, vetting, and the roster

```mermaid
flowchart TB
  subgraph In["Where creators come from"]
    direction LR
    S1[Applies to<br/>a campaign]
    S3[🤖 Rediscovered:<br/>past or shortlisted]
    S4[Talent Partnerships<br/>sources new talent]
    S2[Later Creator app sign-up<br/><i>Creator Ops, not Services</i>]
  end

  S1 & S3 & S4 & S2 --> V[🤖 Automated screen]

  subgraph Checks["Screening checks"]
    direction LR
    V1[Audience: geo,<br/>demo, authenticity]
    V2[Brand safety:<br/>past content scan]
    V3[Conflicts: competitor<br/>deals, exclusivity]
    V4[History: reliability,<br/>results, rates]
  end

  V --> V1 & V2 & V3 & V4
  V1 & V2 & V3 & V4 --> R{Flags?}
  R -->|clean| ROS[(Roster)]
  R -->|flagged| H[🤝 Agent summarizes evidence;<br/>CM or Talent decides]
  H -->|accept| ROS
  H -->|reject| X[Not now,<br/>reason recorded]
  ROS --> N[🤖 Nurture: stay in touch,<br/>keep data fresh]
```

Most new-creator intake belongs to Creator Ops, not Services. For a CM, the supply side is mostly **the roster**: who I trust, who delivers, who performed for whom.

## 4. Matching: building and reviewing the lineup

```mermaid
flowchart TD
  P[Campaign plan + KPI targets] --> Q[🤝 Agent drafts match criteria: audience, vertical, tier mix, content style, rate band]
  Q --> Q1{CM approves criteria}
  Q1 -->|edit| Q
  Q1 -->|approve| R[🤖 Search roster first, then the wider index]
  R --> S[🤖 Screen: safety, conflicts, rights, availability]
  S --> T[🤝 Proposed lineup + backups, each with per-criterion evidence and forecast contribution]
  T --> U{CM reviews lineup}
  U -->|swap, remove, ask why| T
  U -->|approve| W[🧑 Internal gate passed]
  W --> X[🤝 Agent drafts client-facing lineup deck]
  X --> Y[🧑 CM presents; client approves]
  Y --> Z[Outreach + terms]
  Z --> Z1[🤝 Offers within the approved rate band]
  Z --> Z2[🧑 Out-of-band rates, exclusivity, talent managers]
```

Approving the criteria *before* the search means the agent's later reasoning can be checked against something the CM already agreed to. That is the recruiting pattern (LinkedIn, Ashby).

## 5. Production: one deliverable's life

```mermaid
stateDiagram-v2
  [*] --> Briefed: T-14 brief + product sent
  Briefed --> Drafting
  Drafting --> DraftSubmitted: T-7 draft due
  Drafting --> Quiet: no response past cadence
  Quiet --> Drafting: creator responds
  Quiet --> Escalated: slack below threshold
  Escalated --> Drafting: CM call resolves
  Escalated --> Replaced: swap to backup
  DraftSubmitted --> AgentCheck: brief compliance with evidence
  AgentCheck --> CMReview
  CMReview --> Revisions: needs work
  Revisions --> DraftSubmitted
  CMReview --> BrandReview: approved internally
  BrandReview --> Revisions: brand feedback
  BrandReview --> Approved: T-3
  Approved --> Live: T-0
  Live --> Verified: link, code, tags, disclosure checked
  Verified --> Paid
  Paid --> [*]
  Replaced --> [*]
```

## 6. Hard moment: a creator goes quiet with a deadline close

```mermaid
sequenceDiagram
  autonumber
  participant Cr as Creator
  participant Ag as Agent
  participant CM as CM
  participant Br as Brand

  Note over Ag: Draft due T-7.<br/>Cadence: T-10, T-8, T-7.
  Ag->>Cr: 🤖 Reminder (email), T-10
  Ag->>Cr: 🤖 Reminder (email + DM), T-8
  Note over Ag: No reply, no draft.<br/>Weigh slack to go-live,<br/>creator history, backup,<br/>share of KPI at risk.
  Ag->>CM: 🤝 Escalation card
  Note over CM: "Ana is quiet, draft 1 day late.<br/>9/10 on time historically.<br/>Backup Ben is approved.<br/>Call · extend 2 days · swap"
  alt CM calls and creator recovers
    CM->>Cr: 🧑 Call
    CM->>Ag: Extend 2 days
    Ag->>Ag: 🤖 Reschedule, update forecast
  else Swap to backup
    CM->>Ag: Swap to Ben
    Ag->>Cr: 🤝 Offer to Ben, CM approves send
    Ag->>Ag: 🤖 Log reliability event (Ana)
  end
  Ag->>CM: 🤝 Draft client note<br/>(only if go-live or KPI affected)
  CM->>Br: 🧑 Send, or decide not to
```

What makes this "hard" rather than a cron job: the escalation threshold depends on **slack, substitutability, and history**. The agent's job is to reduce the decision to a call with the context already loaded, and to keep the client informed only when it actually matters.

## 7. In-flight optimization and budget pacing

```mermaid
flowchart TB
  L[Post goes live] --> M[🤖 Pull metrics at 24h, 48h, 72h]
  M --> N{Vs. forecast}
  N -->|on track| O[🤖 Note in<br/>daily pacing]
  N -->|outperforming| P[🤝 Boost with $X<br/>from reserve]
  N -->|underperforming| Q[🤝 Adjust next wave,<br/>swap creator,<br/>shift tier mix]
  P --> P1{Whitelisting<br/>in contract?}
  P1 -->|no| P2[🤝 Propose rights<br/>extension: cost, time]
  P1 -->|yes| P3{Above spend<br/>threshold?}
  P3 -->|no| P4[🧑 CM approves]
  P3 -->|yes| P5[🧑 CM + client<br/>approve]
  Q --> Q1[🧑 CM decides; client<br/>told in next status]
```

This replaces the original "tranche" idea. Creator fees are mostly committed at contracting, so the levers are the **reserve**, the **next wave**, and **swaps**.

## 8. The CM's day: from signals to the decision queue

```mermaid
flowchart TB
  subgraph Signals["Signals"]
    direction LR
    s1[Creator replies,<br/>silence]
    s2[Drafts<br/>submitted]
    s3[Brand<br/>feedback]
    s4[Post<br/>metrics]
    s5[Rights +<br/>payment dates]
    s6[Client<br/>requests]
  end
  s1 & s2 & s3 & s4 & s5 & s6 --> AG[Agent]
  AG -->|handled alone| LOG[(Agent log,<br/>undoable)]
  AG -->|needs a decision| QUEUE[Decision queue,<br/>ranked by consequence × time]
  QUEUE --> W1[Today:<br/>cross-account]
  QUEUE --> W2[Account view:<br/>campaign widgets in state]
  QUEUE --> W3[Roster<br/>view]
  W1 & W2 & W3 --> CM((CM))
  CM -.->|accept, edit,<br/>reject + reason| AG
  CM -.->|raise or lower autonomy<br/>per action type| AG
```

Rejections with reasons are the agent's training signal, and the record of how autonomy is earned.

## 9. Order-independent updates and conflicts

Facts arrive in any order up to a milestone, and the same update may be repeated by different people as part of overlapping batches. Principles are in [discovery/framing.md](discovery/framing.md) §6.

```mermaid
flowchart LR
  subgraph M1["Milestone: ready to brief (any order)"]
    f1[Rate agreed]
    f2[Usage rights scoped]
    f3[Whitelisting: yes or no]
    f4[Product shipped]
    f5[Disclosure acknowledged]
  end
  f1 & f2 & f3 & f4 & f5 --> G{Set complete?}
  G -->|no| W[Show what's missing and who owns it]
  G -->|yes| B[Brief sent; milestone sealed]
  B -.->|change needs explicit reopen| M1
```

```mermaid
flowchart TB
  U["Update from CM, coordinator,<br/>agent, or brand<br/><i>key = subject + field</i><br/><i>based-on = version seen</i>"] --> K{Fact with this<br/>key exists?}
  K -->|no| A[Apply, attribute,<br/>re-check milestone]
  K -->|yes, same value| N[No-op: record attribution<br/>UI: already done by Priya]
  K -->|yes, different value| V{Based on<br/>current version?}
  V -->|yes| A
  V -->|no, stale| R{Explicit<br/>authority rule?}
  R -->|yes; not money, rights,<br/>or client-facing| AR[Auto-resolve,<br/>log the rule]
  R -->|no| C[Conflict card:<br/>both values, who, when, why]
  C --> H[Human decides]
  A --> P[Re-check pending proposals;<br/>withdraw any whose inputs changed]
  A --> X{External<br/>effect?}
  X -->|message, offer,<br/>payment| O[Send once per idempotency key<br/>e.g. reminder / deliverable 2 / T-8]
```
