# Writing Well

A global skill for prose humans will read. It merges two sources:

1. **The Elements of Style** (Strunk, 1918) — how to build a clear, forceful sentence.
2. **No AI slop** (petergyang) — which sentences give you away as a machine, plus a voice-preserving edit workflow and a self-check eval.

## Three jobs

| Job | Trigger | Output |
|-----|---------|--------|
| Write | You are drafting docs, a commit message, an essay, UI copy | The prose, cut hard |
| Edit | A draft is pasted in | Edited draft + **What changed** |
| Detect | "Is this AI slop?" / "audit this" | Named patterns, quoted lines, short fixes — no rewrite |

The rules differ by job. Drafting your own prose means cutting freely. Editing someone else's means cutting only the slop and leaving their voice alone.

## Files

```
writing-well/
  SKILL.md                 # Rules and workflow — loads first
  eval.md                  # Pass/fail checks, run on every output
  signs-of-ai-writing.md   # Wikipedia's field guide (~25k tokens, deep audits only)
  elements-of-style/
    01-introductory.md
    02-elementary-rules-of-usage.md
    03-elementary-principles-of-composition.md
    04-a-few-matters-of-form.md
    05-words-and-expressions-commonly-misused.md
  vale/                    # Optional mechanical pass (see below)
    .vale.ini
    README.md
    styles/WritingWell/    # 24 rules
```

Progressive disclosure: SKILL.md carries the working rules, references load on demand. Most tasks need only `eval.md`; add `03-elementary-principles-of-composition.md` when the prose needs real work.

## Mechanical pass

If [Vale](https://vale.sh) is installed, the skill runs it first as a recall pass:

```
brew install vale
vale --no-global --config=writing-well/vale/.vale.ini --output=JSON draft.md
```

Twenty-four rules encode the token-level half of SKILL.md — the word lists, phantom contrasts, significance tags, binary contrasts, colon reveals, superficial `-ing` clauses, em-dash count, emoji and title-case headings. Alert levels say how much judgment each needs: `error` is slop wherever it lands, `warning` is a tell to check in context, `suggestion` is common in good prose too.

On 600 lines of Strunk the style produces 1 error and 7 warnings; on a slop draft of 21 lines, 33 alerts. It reaches none of the editing principles and half the patterns, so its output enters as candidates the model judges, never as findings. Skip the install and nothing changes. `vale/README.md` has the details.

## Examples

**Commit message**

> Before: This commit implements the functionality for ensuring that user authentication is properly handled, showcasing robust error handling capabilities.
>
> After: Add user authentication with error handling

**Documentation**

> Before: This groundbreaking feature leverages cutting-edge technology to deliver a seamless experience.
>
> After: This feature uses WebSocket connections to update the dashboard in real time.

**Colon reveal**

> Before: The detail that makes it work: a separate agent grades it.
>
> After: A separate agent does the grading, which is what makes it work.

**Importance puffery**

> Before: The launch marks a pivotal moment for the company.
>
> After: The launch is the company's first paid product.

**Significance tag**

> Before: The director itself is fifteen lines, and its brevity is the point.
>
> After: The director is fifteen lines; every branch lives in the handler it calls.

**Phantom contrast**

> Before: Two settings are load-bearing rather than merely tidy.
>
> After: Two settings are load-bearing: drop either and the scheduler stalls.

## Attribution

- Strunk material adapted from [obra/the-elements-of-style](https://github.com/obra/the-elements-of-style) via [joshuadavidthomas/agent-skills](https://github.com/joshuadavidthomas/agent-skills) (MIT)
- Slop patterns and eval from [petergyang/no-ai-slop](https://github.com/petergyang/no-ai-slop) (MIT)
- AI pattern research from Wikipedia's field guide to AI-generated content detection
