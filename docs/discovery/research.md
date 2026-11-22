# Research notes

Public research compiled 2026-11-17 to ground [framing.md](framing.md). "Stated" = a public source says it; "inference" = our reading. Several sources are vendor blogs (some selling competing tools); treat benchmarks as directional. Confirm third-party claims before quoting them in the deliverable.

## Later

**Company.** Mavrck acquired Later in 2022; they unified under the Later brand in 2024, and Mavrck's product became **Later Influence**. Later acquired Mavely (affiliate) in January 2025, now "Later Creator." Lineup: Later Influence, Later Social, Later Creator, Social Listening, Linkin.bio, Later 360 reporting. The About page claims an index of 28M creators (other pages say 16M and 20M+). <https://later.com/about/>

**AI.** Brand Suitability Insights (Sept 2025) is AI creator safety/suitability. **Later EdgeAI** (Oct 2025) is a per-brand engine that predicts performance, recommends creator mixes, and sets budgets and benchmarks; it is described as powering both the software and the services team. <https://www.prnewswire.com/news-releases/introducing-later-edgeai-the-industrys-most-advanced-predictive-intelligence-solution-302596310.html>. No Later *agent* product is public. The VP, UX posting asks the hire to lead "agentic UX workflows" and define patterns for "human-in-the-loop interactions, AI trust mechanisms, and agentic failure states" across Later Influence, Later Social and Mavely. <https://job-boards.greenhouse.io/later/jobs/8726004002>

**Services offering.** "Get a team to plan, produce, and manage your creator campaigns." Four stages: strategy → creator selection → content & scale → reporting & ROI. <https://later.com/influencer-marketing-services/>. The blog breaks it into six steps, including "usage rights and exclusivity terms," whitelisting/Spark/Partnership Ads, and "scale top creators and drop underperformers"; kickoff to first post takes 2–4 weeks; pilot programs are offered. <https://later.com/blog/how-influencer-marketing-services-drive-measurable-roi/>

**Platform workflow.** Later Influence has a 12-stage default workflow in 4 phases (stages include Applied, Confirmation, Draft, Draft Review, Content Creation, Pre-Payment, Post-Payment, Dropped). Draft review states are Approved / Approved with Corrections / Needs Work. Stages can trigger automations. <https://help-influence.later.com/hc/en-us/articles/20462368851735-Draft-Draft-Review>, <https://help-influence.later.com/hc/en-us/articles/20462374876951-Workflow-Automation>

**Roles** (Greenhouse postings). These are the best source on the real workflow.

- **Account Manager:** a portfolio of accounts from onboarding to renewal; content quality, on-time delivery, KPI alignment; budgets and contracts; delegates to and QAs Coordinators/Co-Ops; client status meetings, SBRs, wrap reports; measured on renewal and expansion. <https://jobs.summitpartners.com/companies/later/jobs/51350394-account-manager-influencer-marketing>
- **Coordinator:** "brief creation and sourcing to contracting, product fulfillment, and reporting"; acts as "voice of the influencer." <https://job-boards.greenhouse.io/later/jobs/8792586002>
- **Senior Coordinator, Talent Partnerships:** a casting expert embedded in an "account pod"; negotiates with agents and managers; asked for experience applying AI to operations. <https://job-boards.greenhouse.io/later/jobs/8861465002>
- **Director, Creator Operations:** owns the creator intake funnel in HubSpot and decides when outreach is automated versus handled by a human. <https://job-boards.greenhouse.io/later/jobs/8939751002>

**KPIs.** Awareness covers reach, impressions and views. Consideration covers engagement rate, saves and shares. Conversion covers attributed revenue, promo codes and CTR. Production workback is brief and product at T-14, draft at T-7, approval at T-3, live at T-0. <https://later.com/blog/influencer-campaign-management-the-results-first-guide/>. EMV uses the Ayzenberg index, and ROI = EMV ÷ cost. <https://help-influence.later.com/hc/en-us/articles/21083269843607-Earned-Media-Value-EMV-Return-on-Investment-ROI>

**Case studies.**

- **Crumbl:** objectives were set up front (≥30M impressions, >150K engagements). Mid-campaign, the team turned top organic posts into paid ads and engagement doubled; the result was 71.4M impressions. <https://shortyawards.com/17th/tbd-7>
- **Bibigo:** about 11 macro and mega creators; 3% TikTok CTR against a 1.3% benchmark. <https://later.com/case-studies/bibigo/>
- **Premier Protein:** 78 creators; the brand supplied draft feedback and legal disclaimers. <https://later.com/case-studies/premier-protein/>

## Interview process (Later leadership)

Conversations with Later's CPO and CTO during the hiring process, Oct–Nov 2026. They are paraphrased, and only product and strategy content is used; raw notes are kept out of the repo. Claims from them are labelled *Interview* in [../assumptions.md](../assumptions.md), which lists each one. In summary: the agentic factory and front-desk model; the maturity curve from manual to agentic; the conductor agent's design time and run time; cost to serve as the main cost; the existing draft-review checker and the CPO's view of its daily-use UX; workflow variants; action hierarchy as a known gap.

## Competitors

The pattern: every major platform shipped a named agent in 2025–26, almost all aimed at **discovery, outreach, and reporting**. Mid-campaign execution remains manual.

- **CreatorIQ Q** (Oct 2026): agentic discovery, recruiting and setup; "scoped to the user's governance, markets, and approval thresholds"; autonomy extends "as brands watch an agent get things right." <https://www.creatoriq.com/press/releases/applied-creator-intelligence>
- **Upfluence Jaice** (Sept 2026): end-to-end; resolved about two-thirds of creator exchanges without a human in internal tests; escalates when unsure; the role shifts "from operator to supervisor." <https://www.netinfluencer.com/upfluence-turns-its-creator-marketing-platform-fully-agentic-betting-ai-can-run-campaigns-end-to-end/>
- **Traackr Abigail** (Sept 2026): turns a brief into a shortlist and data into a narrative report; built on patterns from Traackr's own services team. <https://www.traackr.com/influencer-marketing-blog/abigail-ai-creator-marketing-strategist-built-for-global-enterprise>
- **GRIN Gia** (2025): discovery, vetting, recruiting, forecasting. <https://finance.yahoo.com/news/grin-launches-gia-first-agentic-130000918.html>
- **LTK** agentic Brand Platform (Aug 2026): goal in, creator suggestions and a proactive "next best action" out. <https://onbrand.shopltk.com/en/latest-news/agentic-experience>
- **impact.com** Recruitment Agent (beta) "maintain[s] approval controls and oversight." <https://impact.com/press-releases/impact-unveils-ai-creator-commerce-ipx/>
- **Billion Dollar Boy SafeMatch** flags past content *for human review*. <https://hellopartner.com/companion-launches-safematch-r-and-community-builder-to-scale-creator-campaigns-safely/>
- **Brief-compliance point tools** exist (OnBriefing: on brief / off brief / needs review). <https://onbriefing.com/>

## Industry workflow facts

- Brief to live takes about 3–4 weeks. Brand review typically has a 48–72h SLA and two revision rounds; legal is often a separate 2–5 day gate, and comes *before* the brief in regulated categories. <https://postpaidonline.com/guides/influencer-campaign-brief>
- Tracking takes 15–20+ hours per campaign (vendor estimate). <https://sup.co/blog/the-real-cost-of-running-influencer-campaigns-in-house>
- Payment: 50/50 is common for new relationships, and net 30–60 for large brands. 48% of creators report being paid late, and many won't rework with that brand. <https://influenceradvisory.com/blog/influencer-payment-terms/>
- Budget flex: practitioners hold back 20–30% as an amplification reserve and boost top posts within 48–72h. Spark/whitelisting must be in the contract. <https://www.influencers-time.com/tiktok-spark-ads-whitelisting-a-brand-tiered-budget-guide/>
- EMV is criticized; AMEC discourages it. <https://www.britopian.com/measurement/do-not-use-earned-media-value/>
- FTC: the brand shares disclosure liability and must monitor. <https://www.kirkland.com/publications/kirkland-alert/2023/07/federal-trade-commission-releases-first-updates-to-endorsement-guides-in-14-years>
- Vetting: audience geo/demo fit, fake-follower share, comment authenticity, a brand-safety scan of past posts, competitor deals in the last 90 days, usage rights scope. <https://inbeat.agency/blog/influencer-vetting-checklist>

## Adjacent industries and HITL guidance

- **Bullhorn** (staffing): *Internal Submission* lets the account manager review a candidate before the client sees them; automations "notify recruiter if no activity in 3 days." <https://www.bullhorn.com/customer-blog/support-tip-master-standard-bullhorn-hiring-workflow/>
- **Gem**: rediscovery ("scans your existing pipeline for people who now fit"); "every match score includes clear reasoning that your team can read, question, and override." <https://www.gem.com/product/recruiting-ai>
- **Juicebox Agents**: Manual mode means you approve each lead; Automatic mode means the agent approves. Calibration is "approve 3 in a row." The daily lead target is sized to what you have time to review, and an activity trace explains each batch. <https://docs.juicebox.ai/juicebox-agents>
- **Ashby**: per-criterion Meets / Does not Meet with an explanation; humans make advance/reject decisions. <https://www.ashbyhq.com/product-updates/ai-assisted-application-review>
- **Gong**: eight tunable deal warnings (Ghosted, Overdue, Stalled…), each with mitigation suggestions. <https://help.gong.io/docs/understanding-ai-deal-monitor>
- **HubSpot**: health bands, with tasks created only when a band changes. <https://knowledge.hubspot.com/customer-success/use-the-customer-success-workspace>
- **Salesforce Next Best Action**: accept/reject per recommendation, each launching a flow. <https://admin.salesforce.com/blog/2024/deliver-improved-recommendations-through-next-best-action-and-agentforce>
- **Microsoft HAX** guidelines: G2 (make clear how well the system does what it does), G9 (efficient correction), G10 (scope when in doubt), G11 (make clear why), G15 (granular feedback), G16 (convey consequences). <https://www.microsoft.com/en-us/research/wp-content/uploads/2019/01/Guidelines-for-Human-AI-Interaction-camera-ready.pdf>
- **Google PAIR**: aim for *calibrated* trust; showing uncertainty lowers trust in a single prediction but improves reliance over time. <https://pair.withgoogle.com/chapter/explainability-trust/>
- **Levels of autonomy** (Feng et al. 2025): Operator → Collaborator → Consultant → Approver → Observer; autonomy is a design choice separate from capability. <https://arxiv.org/abs/2506.12469>
- **Agentic UX patterns** (Smashing, Feb 2026): intent preview, autonomy dial, explainable rationale, confidence signal, action audit & undo, escalation pathway. <https://www.smashingmagazine.com/2026/02/designing-agentic-ai-practical-ux-patterns/>
- **Chat vs. ops UI**: "Chat is a good input primitive but a bad operating environment for agents." <https://blakecrosley.com/blog/chat-is-the-wrong-interface>

## Prior writing (Joshua Hall, Medium)

The author's own published positions that this work builds on.

- **Chat Is an Input, Not an Interface** (June 2026). Conversation suits genuinely unstructured input. Forms, grids and direct manipulation stay better for most work, so the LLM should sit behind those surfaces. This grounds A9 and the decision to keep chat as a scoped ask affordance. <https://medium.com/design-bootcamp/chat-is-an-input-not-an-interface-2686ba8b542d>
- **Generative UI Is Three Things. Only One Ships.** (May 2026). Of fully generated code, model-assembled layouts, and a fixed shell with a bounded area of dynamically chosen widgets, only the last is reliable enough to ship. This grounds A7: a curated widget library selected by state, not UI the model invents. <https://medium.com/design-bootcamp/generative-ui-is-three-things-only-one-ships-136478c1a67b>
- **CFS: Scoring Features Before You Argue About Them** (June 2026). Rate Commonality × Frequency × Severity on a 1–5 scale and record the score with the decision. It is used here to rank which agent tasks to take on first and to justify the cuts. <https://medium.com/design-bootcamp/cfs-scoring-features-before-you-argue-about-them-efa239a4ab74>
- **Idempotent Design: When Order Shouldn't Matter** (June 2026). Independent actions should give the same result in any order. Real sequencing constraints are separated from "shadow constraints" that the data model imposes. This grounds §6 of the framing: milestones that gate on sets, keyed idempotent updates, and conflict cards for overlapping work across the pod. <https://medium.com/design-bootcamp/idempotent-design-when-order-shouldnt-matter-ca940b4cbf83>
- **Owning the Design System** (June 2026). A design system works only as a permanent, owned function measured by adoption and downstream value. This answers the brief's question of which patterns to standardize if this agent is one of several, and who owns them. <https://medium.com/design-bootcamp/owning-the-design-system-8a28ea61372b>
