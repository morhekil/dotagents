---
name: writing-well
description: Use when writing, editing, or auditing prose humans will read—documentation, commit messages, error messages, essays, reports, PR descriptions, or UI text. Combines Strunk's rules for clear forceful prose with a field guide to AI-slop patterns. Also handles "does this read as AI?" audits.
---

# Writing Well

Two traditions, one skill. Strunk tells you how to build a sentence. The slop guide tells you which sentences give you away as a machine.

## Three jobs

**Write.** You are drafting prose. Apply Strunk's principles below and avoid every pattern in *Patterns to cut*. Your own voice is the one you are shaping, so cut freely.

**Edit.** Someone hands you a draft. You are a sharp human editor: preserve their point and their voice, make the minimum effective edit, return the edited draft plus a short **What changed** section. Do not turn distinctive writing into generic polished prose. This is the default when a draft is pasted in.

**Detect.** Someone asks whether a piece reads as AI, or asks for an audit without a rewrite. Name each pattern that appears, quote the line, give the fix in a few words. Do not rewrite, do not score the draft, do not guess whether AI wrote it — detectors guess, named patterns are evidence the reader can check. Judge patterns by necessity and density, not token matching: one useful contrast, fragment, summary, or callout is not slop. Flag a device when it is needless, repeated, or standing in for an explanation. Offer to edit afterward.

The rules differ by job. When writing, cut hard. When editing someone else's work, cut only the slop.

## Before you start

If you are editing and no draft is provided, ask for it.

If the audience or format is unclear, ask one question: who is this for and where will it be published?

If the goal is unclear, ask what the reader should think, feel, or do after reading.

## Strunk's principles

From *The Elements of Style* (1918). The six that carry most of the weight:

| Rule | Principle |
|------|-----------|
| 10 | Use active voice |
| 11 | Put statements in positive form |
| 12 | Use definite, specific, concrete language |
| 13 | Omit needless words |
| 16 | Keep related words together |
| 18 | Place emphatic words at end of sentence |

The rest, in brief:

**Usage (grammar and punctuation)** — form the possessive singular with 's; comma after each term in a series except the last; enclose parenthetic expressions in commas; comma before a conjunction introducing a co-ordinate clause; never join independent clauses with a comma; do not break sentences in two; a participial phrase at the beginning refers to the grammatical subject.

**Composition** — one paragraph per topic; begin each paragraph with a topic sentence; avoid a succession of loose sentences; express co-ordinate ideas in similar form; keep to one tense in summaries.

Applied:

- **Be concrete.** Abstraction is where writing goes to die. "The integration improved efficiency" becomes "The integration cut deploy time from 40 minutes to 4." Names, numbers, dates, mechanisms.
- **Protect the specific fact.** Never smooth a useful detail into generic importance. "The tool significantly improves engineering productivity" becomes "The tool cut review time from 30 minutes to 8."
- **Make verbs do the work.** "Made a decision" becomes "decided." "Has the ability to" becomes "can." Never let inanimate things do human verbs.
- **State positively.** "He forgot" beats "He did not remember."
- **Cut first, add back later.** Remove words until meaning suffers, then restore only what is needed.
- **Open it up, don't dumb it down.** Keep the substance, nuance, and precision. Strip only what makes it hard to read: jargon, long sentences, abstract nouns, tangled structure.

## Words to cut

<!-- vale WritingWell.BannedWords = NO -->
<!-- vale WritingWell.EmptyAdverbs = NO -->
<!-- vale WritingWell.FillerPhrases = NO -->

**Banned outright:** delve, foster, leverage, utilize, facilitate, empower, streamline, robust, cutting-edge, paradigm shift, game changer, this is huge, this changes everything, tapestry, realm, beacon, multifaceted, meticulous, intricate, paramount, transformative, elevate, embark, supercharge, harness, ever-evolving, groundbreaking, seamless.

**Often-empty adverbs:** just, literally, honestly, simply, actually, truly, merely, fundamentally, importantly, crucially, inherently, inevitably.

**Often-empty phrases:** it's worth noting, it's important to note, at the end of the day, when it comes to, at its core, in today's world, in the age of, in the world of, the reality is, the truth is, in terms of, with regard to, in order to, going forward, in this article, let's dive in.

When writing, cut all of these. When editing, keep an adverb or phrase that carries real emphasis, uncertainty, contrast, or the writer's spoken rhythm.

<!-- vale WritingWell.BannedWords = YES -->
<!-- vale WritingWell.EmptyAdverbs = YES -->
<!-- vale WritingWell.FillerPhrases = YES -->

## Patterns to cut

**Binary contrasts.** "This is not X. It's Y." / "The question isn't X, it's Y." / "It's not just X but Y." State Y directly. "The question isn't the model. It's the eval" becomes "The eval matters more than the model."

**Phantom contrasts.** A claim, then a trailing clause dismissing an alternative nobody raised. "Two settings are load-bearing rather than merely tidy." No reader thought they were tidy. The clause does tone work, not information work: it performs having weighed a nuance, and the rejected option is a strawman built to lose. Tells: `rather than merely`, `rather than just`, `not merely`, `not just`, `more than just`, `as opposed to`, `instead of simply`. Test each one — would a reasonable reader actually have believed the rejected half? If not, delete the clause and keep the claim: "Two settings are load-bearing." If they genuinely might, replace the foil with the consequence: "Two settings are load-bearing: drop either and the scheduler stalls." Related to *Binary contrasts* above, which is the same instinct in sentence form.

**Throat-clearing openers.** "Here's the thing," "Here's what I mean," "Let me be clear," "I'll be honest," "The uncomfortable truth is." Cut and state the point.

**Faux-insight setups.** "This is the part most people skip," "What most people get wrong," "Here's what nobody tells you." These flatter the writer as the lone expert. Let the claim stand alone: "The part everyone misses: distribution is the real moat" becomes "Distribution is the moat."

**Editorial signposting.** Labels such as "worth knowing," "worth noticing," "the interesting part," "a neat inversion," "keep an eye on," and "deserves a look" tell readers how to value the material. This is especially conspicuous in headings and callouts. Name the mechanism or risk instead: "A coupling worth knowing about" becomes "Domain-validation coupling"; "The alert that matters" becomes "Alerts on fail-closed responses."

**Colon reveals.** A noun phrase, a colon, a lowercase dramatic reveal. "The detail that makes it work: a separate agent grades it." Rewrite as a plain sentence. Colons are for lists, labels, and quotes. Prefer sentence case after a colon unless grammar, a proper noun, a title, or code requires otherwise.

**Superficial analysis.** Trailing `-ing` clauses that pretend to explain meaning: highlighting, underscoring, reflecting, showcasing, ensuring. "The launch adds file search, highlighting the team's commitment to better workflows" becomes "The launch adds file search, so users can find old drafts without leaving the editor."

**Importance puffery.** "Stands as a testament," "marks a pivotal moment," "plays a vital role," "solidifies its position," "enduring legacy." State the fact and let the reader judge. "The launch marks a pivotal moment for the company" becomes "The launch is the company's first paid product."

**Significance tags.** A fact, then a trailing clause asserting the fact is meaningful or intentional. "The director itself is fifteen lines, and its brevity is the point." "Shutdown ordering is subtle, and the sequence below is deliberate." The tag restates the fact as an abstract noun (fifteen lines → brevity) or claims someone meant it, then tells the reader to be impressed instead of showing why. Tells: `and that's the point`, `and that's deliberate`, `and that's by design`, `and that's not an accident`, `which is the whole point`, `and that matters`, `and that's the thing`. Delete the tag. If the significance is real, state the mechanism instead: "The director is fifteen lines, and its brevity is the point" becomes "The director is fifteen lines; every branch lives in the handler it calls." "Shutdown ordering is subtle, and the sequence below is deliberate" becomes "Shutdown drains the queue before closing the socket, or in-flight writes are lost."

**Weasel attribution.** "Experts agree," "studies show," "industry reports suggest," "widely regarded as." Name the source or cut the claim. Never invent a source; ask.

**Fake-strong verbs.** Prefer "is" and "has" when clearer. "The app serves as a centralized hub for sponsor management" becomes "The app tracks sponsors, drafts, due dates, and approvals in one place."

**Synonym cycling.** If the clear word is right, repeat it. "The agent reviews the draft. The assistant scores the piece. The tool suggests fixes" becomes "The agent reviews the draft, scores it, and suggests fixes."

**Negative listing.** "Not a X. Not a Y. A Z." Just say Z.

**Dramatic fragmentation.** "X. And Y. And Z." or "That's it. That's the whole thing." Use complete sentences.

**Robotic rhythm.** Repeated sentence shapes, identical paragraph structures, stacked punchy fragments. Vary shape only when it helps the point.

**Counted scaffolding.** Repeated openings such as "Two details," "Three reasons," and "Four ideas" create a template rhythm when the count serves no navigational purpose. Keep the count when readers must track a fixed set; otherwise state the subject directly.

**Rhetorical setups.** "What if I told you," "Think about it:", "Plot twist:", self-answered "Question? Answer." pairs. Drop them.

**Fake-profound kickers.** Delete the final "deep" line that turns the point into a metaphor or mic-drop. Do not rewrite it into a better metaphor, do not preserve its rhythm. End on the clearest concrete sentence already in the draft, or add a plain takeaway or next action.

**Summary-recap endings.** "In conclusion," "Ultimately," "Overall," or a closing paragraph restating the piece. The reader was just there.

**Formatting slop.** Emoji in headings, bold sprinkled mid-sentence, bullet lists where two sentences of prose read better, headers over two-sentence sections. Format follows content; it does not decorate it.

**Em dashes.** Not a default rhythm crutch. None in short copy. One or two in a longer draft when they clearly beat commas, periods, or parentheses.

**Be easy, not simple.** Do not shy away from discussing and expressing complex topics, but write them in an easy to read and understand way. Assume that for many readers English is not their first language, and adjust your vocabulary and sentence architecture accordingly.

## Editing principles

These govern the **Edit** job only. When drafting your own prose, ignore them and cut hard.

- **Preserve the writer's real voice.** First notice the draft's vocabulary, cadence, bluntness, humor, uncertainty, digressions, and level of polish. Keep what feels personal. Do not make every paragraph equally tidy.
- **Make the minimum effective edit.** Fix slop, errors, repetition, and unclear passages. Leave strong human sentences alone. A rough draft with a real voice should still sound like the same person.
- **Keep the user's meaning.** Never invent claims, examples, stats, or opinions. If something is unclear, ask.
- **Lead with the point when the setup adds nothing.** Keep a personal aside, story, or admission when it creates context, tension, or character.
- **Front-load only when it improves clarity.** Do not force every section into the same point-detail-background shape.
- **Untangle without flattening.** Split sentences that are genuinely hard to follow. Keep long spoken sentences, fragments, and changes in pace when they are clear and characteristic.
- **Preserve useful edge.** Strong opinions, blunt language, humor, profanity, self-interruptions, and honest admissions belong to the writer. Do not make them safer or more professional.
- **Keep the structure** unless it is hurting the piece. If you reorganize, say why in **What changed**.

## Mechanical pass

Optional, and only if `vale` is on PATH. It catches the token-level patterns above without tiring on a long draft; you supply every judgment it cannot make. If Vale is absent, skip this step and change nothing else.

```
vale --no-global --config=<this skill's directory>/vale/.vale.ini --output=JSON draft.md
```

A pasted draft goes in on stdin with `--ext=.md`. Read the output rather than the exit code — only `error` returns non-zero.

Every alert is a candidate, not a finding. The level says how much judgment it needs:

| Level | Meaning | Response |
|---|---|---|
| `error` | The phrase is slop wherever it lands | Fix it, unless the draft is quoting it as a specimen |
| `warning` | A tell that depends on context | Apply the necessity test from *Detect* before acting |
| `suggestion` | Frequent in good prose too | Act on density, or when the sentence is weak anyway |

Vale reaches about half of *Patterns to cut* and none of *Editing principles*. It cannot see concreteness, voice, synonym cycling, fake-profound kickers, or whether a device earns its place. Treat a clean run as the start of your read, not the end of it.

Never hand Vale's output to the user as your findings. In **Detect**, name the pattern in your own words against the quoted line, exactly as you would without it. `vale/README.md` covers the rules, the vocabulary escape hatch, and what the style misses.

## Workflow

1. Read the whole draft before touching anything.
2. Identify the core point and three to five voice signals to preserve. Keep this note internal. If you cannot find the core point, ask.
3. Run the mechanical pass if Vale is available, and hold its alerts as candidates.
4. **Detect request:** return the findings report described above and stop.
5. **Edit or write:** make the changes, then check your output against `eval.md` yourself.
6. If any check fails, fix and re-check.
7. Output the full draft, plus a **What changed** section when editing.

## Reference files

Load only what the task needs.

| File | ~Tokens | Use for |
|------|---------|---------|
| `eval.md` | 600 | Pass/fail checks — run on every edit |
| `elements-of-style/03-elementary-principles-of-composition.md` | 4,500 | Active voice, concision, paragraph structure |
| `elements-of-style/02-elementary-rules-of-usage.md` | 2,500 | Commas, possessives, sentence structure |
| `elements-of-style/05-words-and-expressions-commonly-misused.md` | 4,000 | Word choice, common errors |
| `elements-of-style/04-a-few-matters-of-form.md` | 1,000 | Headings, quotations, formatting |
| `signs-of-ai-writing.md` | 25,000 | Wikipedia editors' field guide — deep audits only |
| `vale/README.md` | 800 | Tuning or debugging the mechanical pass |

Most tasks need only `eval.md`. When the prose needs real work, add `03-elementary-principles-of-composition.md`.

**When context is tight:** dispatch a subagent with the draft and one reference file, and have it return the revision.
