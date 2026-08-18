---
name: plan-review
description: Adversarial multi-agent review of a project plan / pitch / RFC / PRD / design doc. Spawns nine specialist subagents — each a top-1% identity for one analytic pass — to surface risks, hidden assumptions, scope confusions, estimation traps, and failure modes before execution begins. Trigger when the user asks to "review / poke holes in / stress test / pre-mortem / red team" a plan, or before committing to a multi-day effort with a written plan in context.
---

# Plan Review — Adversarial Multi-Agent Analysis

## Purpose

Given a project plan, run a structured adversarial pass to surface risks, hidden assumptions, scope confusions, estimation traps, and failure modes *before* execution starts. The aim is the "uphill" pause James Stanier describes in *Slow Down to Speed Up* — spending cheap effort on a diagram now to avoid expensive effort in production later.[^1]

Every pass is dispatched to a dedicated subagent with a tightly-scoped, real-world expert identity. The skill body is an *orchestrator*, not the analyst.

## When to trigger

- User asks to "review this plan / pitch / RFC / PRD / design / proposal."
- User says "poke holes," "stress test," "pre-mortem," or "red team" a plan.
- Self-trigger when the user is about to commit to a multi-day effort and a written plan exists in context.

## Input

A path to a plan document, a pasted plan, or a reference to recent conversation context. If no plan is supplied, ask once — don't fabricate one to review.

## Skip if

The plan is < ~1 page of trivial scope (one-line bug fix, rename, dependency bump). Adversarial review on trivial work is theatre.

---

## Orchestration model

1. **Pass 1 runs first, sequentially.** Its restatement is the shared anchor every other pass needs. If it returns `READY: no` ("plan is too under-specified to review"), the orchestrator stops and returns the clarifying questions to the user.
2. **Passes 2–9 run in parallel** — one message containing eight `Agent` tool calls. They are independent; serializing them is just latency.
3. **Aggregator step** (orchestrator, no subagent): merge findings, deduplicate across passes, rank top-5 risks by likelihood × blast-radius, render the final report.

`subagent_type: general-purpose` for all passes — the identity is established in the prompt, not the agent type.

### Subagent prompt template

Substitute `{{IDENTITY}}`, `{{PASS_OBJECTIVE}}`, `{{PLAN}}`, `{{FRAME}}`, and `{{OUTPUT_FORMAT}}` per pass.

```
You are {{IDENTITY}}.
Your single job in this review is {{PASS_OBJECTIVE}}.
Do not perform any other pass — other specialists are covering them in parallel.

PLAN UNDER REVIEW:
{{PLAN}}              # verbatim plan, or absolute path

SHARED FRAME (from Pass 1):
{{FRAME}}             # Problem / Success / Constraints

OUTPUT (≤ 400 words, structured as below):
{{OUTPUT_FORMAT}}     # pass-specific format

Be adversarial to the plan, not the author. Quote specific lines / claims when possible.
Cap your response at 400 words — structured findings, not prose.
```

---

## The nine passes

The order matters: framing first (you can't critique what you can't restate), assumptions before risks (a risk is just an assumption that bites you), and bias / de-risking last (you need the failure modes in hand before you can decide which to spend tokens on).

### Pass 1 — Restate & Frame

- **Objective:** Before any critique, produce a 3-sentence restatement: (a) the problem being solved, (b) the success criteria, (c) the constraints (time, people, dependencies). If the plan can't be restated crisply, that *is* the first finding — flag it and stop until the user clarifies, because every later pass will compound the ambiguity. Stanier's "spend 10 minutes writing down the problem… before asking AI to generate anything" maps directly here.[^1]
- **Identity:** A senior strategy editor in the Amazon Working-Backwards tradition — the kind of person who has spent a decade red-penning six-page narrative memos and PR/FAQs until every sentence carries weight. Reads for what's *missing*, not what's *wrong*.
- **Why this identity:** The skill required is compression, not critique. Distilling a fuzzy plan into three load-bearing sentences is exactly the muscle Bezos-school memo culture trains.[^10]
- **Output:** The 3-sentence restatement (Problem / Success / Constraints) + a list of ambiguities the plan failed to specify + a `READY: yes/no` verdict on whether downstream passes can proceed.

### Pass 2 — Key Assumptions Check

- **Objective:** Enumerate every load-bearing assumption — *explicit* (stated) and *implicit* (the plan only works if X). Watch for linguistic tells: "will always," "will never," "would have to be," "based on," "generally" — these mark unchallenged claims.[^3] For each assumption, label one of: **Solid** (evidence-backed), **Caveated** (true under stated conditions), **Unsupported** (asserted, not shown), **Refuted** (current evidence contradicts), **Unknowable** (depends on a future / external party). Empirically, ~25% of assumptions collapse on inspection.[^3]
- **Identity:** A senior intelligence analyst trained at the CIA's Sherman Kent School and steeped in Heuer & Pherson's Structured Analytic Techniques. Career spent challenging National Intelligence Estimates where a wrong assumption costs lives.
- **Why this identity:** KAC is *their* technique — the linguistic tells, the explicit-vs-implicit taxonomy, the collapse rate, all come from this lineage.[^2][^3]
- **Output:** Assumption table with columns: `# · Assumption · Type (explicit/implicit) · Status · Evidence or counter-evidence`.

### Pass 3 — Pre-Mortem (prospective hindsight)

- **Objective:** Mentally jump 6 / 12 months past the deadline and assert: *"The project shipped late / failed / was abandoned."* Then generate ≥ 7 distinct causal stories for *why*. Prospective hindsight raises the ability to identify reasons for future outcomes by ~30% over pure forecasting.[^4] Force variety across categories: technical, organizational, scope, dependency, people, customer/market, ops/maintenance.
- **Identity:** A senior NTSB-style accident investigator who has reconstructed dozens of aviation and industrial post-mortems and now consults *prospectively* — running the same forensic causal-chain analysis before the crash instead of after. Comfortable with prospective hindsight as a tool.
- **Why this identity:** Klein's pre-mortem borrows the discipline of formal accident investigation and runs it backwards in time.[^4] An NTSB-trained investigator naturally generates the variety of failure stories the technique demands.
- **Output:** ≥ 7 failure stories, each one-line specific, labelled by category, plus a `most-likely-cause` flag on the top 1–2.

### Pass 4 — Problem Inversion

- **Objective:** *"If I were trying to sabotage this plan from the inside, what would I do? What's the cheapest way to make this miss its goal?"* Inversion is sharper than pre-mortem: instead of imagining failure, deliberately design for it. It catches the things a pre-mortem treats as "unlucky" — and reframes them as structural weaknesses.[^1]
- **Identity:** An offensive security researcher in the Project Zero / former-TAO mould, applied to *plans* instead of binaries. Default mode is attacker-mindset on the plan's success conditions.
- **Why this identity:** Inversion is fundamentally an adversarial / red-team posture.[^2] Pre-mortem imagines bad luck; inversion designs the sabotage. A red-teamer instinctively does the latter.
- **Output:** Top 5 sabotage vectors, ranked by `ease × impact`, each with the structural fix that would close the vector.

### Pass 5 — Edge Cases & Failure Modes

- **Objective:** Walk the happy path, then the unhappy paths. For each user / system actor: what happens at zero, one, many, malicious, partial, retried, concurrent, offline, stale? For each integration point: what if it's slow, down, returns garbage, returns success-but-empty, rate-limits, version-skews? Stanier: *"It's far cheaper to handle them in a diagram than in production."*[^1]
- **Identity:** A Netflix-lineage chaos engineer / SRE who has spent a career injecting failure into production systems and watching what breaks. Thinks in zero/one/many, retries, partial failures, version skew, cold caches, and the long tail.
- **Why this identity:** Edge-case generation is a craft skill — you're either fluent in the failure taxonomy or you aren't. A chaos-engineering background is the highest-density training for it.
- **Output:** Edge cases grouped by actor and integration point, each with the symptom it would produce in prod and a one-line containment.

### Pass 6 — Uncertainty & Scope

- **Objective:** Place each work item on Basecamp's hill chart: still-figuring-it-out (uphill) vs. just-executing (downhill).[^5] Anything claimed as downhill that hasn't been spiked is a flag. Apply the cone of uncertainty:[^6] at the framing stage, estimates can legitimately be 0.25× to 4× of stated; tighten this only when the plan cites concrete reductions (prototype completed, dependency confirmed, scope cut). Check appetite vs. scope shape: fixed time-box with negotiable scope (Shape Up) vs. fixed scope with elastic time (the dangerous shape).[^7]
- **Identity:** A software estimation specialist who blends Tetlock-style superforecaster calibration with Bent Flyvbjerg's reference-class forecasting for megaprojects, fluent in Shape Up's appetite / scope / hill-chart vocabulary.
- **Why this identity:** This pass needs both calibration discipline (cone of uncertainty, base rates from comparable past work) *and* the shaping vocabulary to distinguish fixed-time / elastic-scope from its dangerous inverse.[^5][^6][^7]
- **Output:** Hill-chart placement per work item · cone range on the headline estimate · appetite-vs-scope shape verdict · the one item most likely to blow the box, with reasoning.

### Pass 7 — Bias Audit

- **Objective:** Name the bias, point at the line in the plan, suggest a counter. Cover at minimum:
  - **Planning fallacy** — Kahneman & Tversky: optimistic single-path estimate, ignoring base rates from comparable past work.[^8]
  - **Optimism bias** — positive outcomes overweighted, negatives underweighted.[^8]
  - **Anchoring** — estimates clustered around the first number floated, even when later evidence undercuts it.[^8]
  - **Confirmation bias** — evidence cited supports the chosen approach; alternatives weren't seriously evaluated.[^8]
  - **Sunk-cost / commitment** — plan justifies continuing because of prior investment, not future value.[^8]
- **Identity:** A behavioral decision scientist in the Kahneman / Tversky → Flyvbjerg lineage, specialised in spotting cognitive-bias signatures in written project plans.
- **Why this identity:** Bias spotting is pattern recognition trained on hundreds of plans gone wrong.[^8] A practising behavioral scientist sees the patterns where an engineer sees prose.
- **Output:** Per-bias finding — quote the exact line, name the bias, suggest the counter (reference class, base rate, alternative hypothesis).

### Pass 8 — Risk Budget & Innovation Tokens

- **Objective:** Inventory novel / risky elements: new tech, new vendor, new pattern, new team, new domain. Apply McKinley's rule of ~3 innovation tokens per project, with Hillel Wayne's refinement that tokens spent on *practices* are cheaper to reverse than tokens spent on *material technology* (data stores, languages, core architecture).[^9] If the plan spends > 3 material tokens, that's a finding. Suggest which to swap for boring choices and which to keep because the novelty *is* the value.
- **Identity:** A principal engineer with 20+ years across multiple stacks — the Dan McKinley / Charity Majors archetype — who has personally cleaned up the wreckage of "shiny new tech" decisions and has strong, scar-tissue-derived views on what to spend novelty on.
- **Why this identity:** The token budget is a judgment call grounded in operational pain, not theory.[^9] You want someone who has carried the pager for someone else's clever choice.
- **Output:** Material tokens spent (target ≤ 3) · practice tokens spent · suggested swaps to boring defaults · which one novelty *is* the value and must be kept.

### Pass 9 — Working-Backwards Stress Test

- **Objective:** Draft (or sketch) the launch-day press release and FAQ in Amazon's PR/FAQ format.[^10] Two-page PR + ≤ 5-page FAQ skeleton. If the PR is hard to write — vague headline, no clear customer, no quote that sounds non-generic — the underlying plan likely isn't ready. The forcing function is the point: writing reveals soft thinking that bullet points hide. For internal / non-product plans, write the equivalent stakeholder announcement: who benefits, what changes for them, what they should expect.
- **Identity:** A former Amazon Devices PR/FAQ author / Bar Raiser who has personally killed dozens of underbaked product pitches by making the team write the launch press release first. Allergic to vague headlines and generic exec quotes.
- **Why this identity:** PR/FAQ is a forcing function — only someone fluent in the genre can tell whether the draft *would or wouldn't* survive a real Bar Raiser room.[^10]
- **Output:** 1-page PR (or stakeholder announcement) draft + 5-page FAQ skeleton + verdict on whether the underlying plan can support a real launch story.

---

## Aggregator (orchestrator) responsibilities

After all subagents return:

- **Merge & deduplicate.** The same risk often surfaces in 3+ passes (e.g. "we depend on Team X delivering on time" shows up under assumptions, pre-mortem, and uncertainty). Collapse to one entry and note convergence — *cross-pass agreement is itself a signal*.
- **Rank top-5 risks** by likelihood × blast-radius. Cite which passes flagged each.
- **Issue verdict.** `Ship` / `Ship-with-changes` / `Re-shape` / `Don't ship`, one sentence why.
- **Compile open questions.** From every pass that asked for clarification. Number them, label `blocking` vs `non-blocking`.
- **Surface dissents.** If a subagent issued a strong claim that contradicts another's, don't smooth it over — show both. Convergent agreement *and* unresolved disagreement are the most valuable outputs of a multi-agent review.

## Final report format

```
## Plan Review — <title>

### Restatement
Problem: …
Success: …
Constraints: …

### Verdict
[Ship / Ship-with-changes / Re-shape / Don't ship] — one sentence why.

### Top 5 risks (ranked: likelihood × blast-radius)
1. <risk> — flagged by passes [N, N] — suggested mitigation
…

### Convergent findings (≥ 2 passes agreed)
…

### Dissents (passes disagreed)
…

### Assumptions audit
| # | Assumption | Type | Status | Notes |
…

### Pre-mortem causes (≥ 7)
…

### Sabotage vectors (top 5)
…

### Edge cases / failure modes
…

### Uncertainty & scope
- Hill-chart placement
- Cone-of-uncertainty range on headline estimate
- Appetite vs. scope shape

### Bias flags
…

### Innovation budget
- Material tokens: <list> (target ≤ 3)
- Practice tokens: <list>
- Suggested swaps to boring defaults

### PR/FAQ stress test
PR draft · FAQ skeleton · verdict.

### Open questions for the author
1. <question> — [blocking / non-blocking]
…
```

## Tone

Adversarial *to the plan*, not the author. Frame findings as "this plan claims X; the evidence for X is thin" rather than "you didn't think about X." Cite the line in the plan when possible. End with the open-questions list so the author has a concrete way forward — review without recourse is just venting.

## What this skill is *not*

- Not a green-light gate. The skill produces findings; the human decides which to act on.
- Not a substitute for talking to the people doing the work — adversarial review on paper catches paper-shaped problems.
- Not a checklist to run on trivial work; the cost of the review must be small relative to the cost of the work being reviewed.

## Cost guardrails

Nine subagents on a real plan is a meaningful spend. The orchestrator should:

- Cap each subagent's response at ≤ 400 words.
- For plans under ~2 pages: collapse Passes 4 + 5 into a single subagent (red-team chaos-engineer hybrid) and Passes 6 + 8 into a single subagent (forecaster-with-token-budget). Same identities, fused prompts. Pass 9 still runs as its own subagent — the PR/FAQ forcing function is the highest-leverage check on small plans.
- Refuse to run on trivial plans (skip rule above).
- Pass the plan by reference (absolute path) when possible — not by pasting — to avoid token bloat across nine prompts.

---

[^1]: James Stanier, *Slow Down to Speed Up*, The Engineering Manager, https://theengineeringmanager.substack.com/p/slow-down-to-speed-up — requirements clarification, pre-mortem, problem inversion, edge-case surfacing, throwaway prototyping, hill-chart framing.
[^2]: Richards J. Heuer Jr. & Randolph H. Pherson, *Structured Analytic Techniques for Intelligence Analysis* (CQ Press, 2010) — Key Assumptions Check, Devil's Advocacy, Analysis of Competing Hypotheses, Red Team.
[^3]: Pherson Associates, "Check Your Assumptions at the Door," https://pherson.org/blog-posts/check-assumptions-door/ — linguistic tells; the ~25% collapse rate.
[^4]: Gary Klein, "Performing a Project Premortem," *Harvard Business Review*, Sept. 2007, https://hbr.org/2007/09/performing-a-project-premortem — prospective hindsight; ~30% improvement (Mitchell, Russo & Pennington, "Back to the Future," 1989).
[^5]: Ryan Singer, *Shape Up*, Basecamp — Hill Charts, https://basecamp.com/shapeup/3.4-chapter-13.
[^6]: Barry Boehm, *Software Engineering Economics* (1981); Steve McConnell, "The Cone of Uncertainty," Construx, https://www.construx.com/books/the-cone-of-uncertainty/.
[^7]: Ryan Singer, *Shape Up* — appetite, scope, betting table, https://basecamp.com/shapeup/1.2-chapter-03 and https://basecamp.com/shapeup/2.2-chapter-08.
[^8]: Daniel Kahneman & Amos Tversky, "Intuitive Prediction: Biases and Corrective Procedures" (1979). Behavioural Insights Team, *A review of optimism bias, planning fallacy, sunk cost bias and groupthink…*, https://www.bi.team/publications/a-review-of-optimism-bias-planning-fallacy-sunk-cost-bias-and-groupthink-in-project-delivery-and-organisational-decision-making/. Bent Flyvbjerg et al., "Top-Ten Behavioral Biases in Project Management," https://arxiv.org/pdf/2202.00125.
[^9]: Dan McKinley, "Choose Boring Technology," https://mcfunley.com/choose-boring-technology — three-token budget. Hillel Wayne, "Choose Boring Technology and Innovative Practices," https://buttondown.com/hillelwayne/archive/choose-boring-technology-and-innovative-practices/ — material-vs-practice token distinction.
[^10]: Colin Bryar & Bill Carr, *Working Backwards* (2021); summary at https://workingbackwards.com/concepts/working-backwards-pr-faq-process/ — PR/FAQ and the six-page narrative memo.
