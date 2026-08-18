# Mechanical pass

A [Vale](https://vale.sh) style that encodes the token-level half of `SKILL.md`. It is optional. The skill works unchanged without it, and finds the same patterns more slowly and less reliably on a long draft.

Vale is a syntax-aware prose linter. It reads Markdown, AsciiDoc, HTML, and source-code comments, so it can scope a rule to headings alone, skip code blocks, and leave a blockquote of someone else's words untouched.

## Install

```
brew install vale          # or: go install github.com/errata-ai/vale/v3/cmd/vale@latest
```

Nothing else. There is no `vale sync` step: the style lives here, and this directory holds no downloaded packages.

## Run

```
vale --no-global --config=<skill>/vale/.vale.ini --output=JSON draft.md
cat draft.md | vale --no-global --config=<skill>/vale/.vale.ini --ext=.md
```

`--no-global` keeps a user's own `.vale.ini` from merging in, so the same draft scores the same on any machine. Read the output, not the exit code: only `error` returns non-zero.

## Levels

The level says how much judgment an alert needs, not how bad the prose is.

| Level | Meaning | Response |
|---|---|---|
| `error` | The phrase is slop wherever it lands | Fix it, unless the draft is quoting it as a specimen |
| `warning` | A tell that depends on context | Apply the necessity test before acting |
| `suggestion` | Frequent in good prose too | Act on density, or when the sentence is weak anyway |

## Rules

Twenty-four, named for the section of `SKILL.md` they come from.

**Error:** `BannedWords`, `FillerPhrases`, `ThroatClearing`, `FauxInsight`, `RhetoricalSetups`, `ImportancePuffery`, `SuperficialAnalysis`, `EmojiHeadings`

**Warning:** `PhantomContrast`, `SignificanceTags`, `BinaryContrast`, `EditorialSignposting`, `WeaselAttribution`, `SummaryRecap`, `ColonReveal`, `CountedScaffolding`, `FakeStrongVerbs`, `DramaticFragmentation`, `EmDashes`, `HeadingCase`

**Suggestion:** `EmptyAdverbs`, `PassiveVoice`, `CurlyQuotes`, `Readability`

## What it does not reach

None of *Editing principles*, and half of *Patterns to cut*: concreteness, protecting a specific fact, synonym cycling, fake-profound kickers, robotic rhythm, and whether bullets should have been prose. A regex cannot tell a load-bearing contrast from a decorative one, which is the judgment *Detect* is built around. A clean run means the mechanical layer is clean, nothing more.

## Measured behavior

Against Strunk's five chapters — 1,052 lines of 1918 human prose — the style produces 1 error and 11 warnings. Nine of the eleven are the book's title-case chapter headings, which the rule is right to flag. The 181 suggestions are almost all `PassiveVoice` and `CurlyQuotes`, which is why those sit at the bottom tier.

`testdata/slop-fixture.md` exercises all 24 rules and produces 44 alerts: 16 errors, 22 warnings, 6 suggestions. After editing a rule, check that none has gone silent:

```
vale --no-global --config=vale/.vale.ini --output=JSON vale/testdata/slop-fixture.md \
  | python3 -c "import json,sys; d=json.load(sys.stdin); \
    print(len({a['Check'] for v in d.values() for a in v}), 'of 24 rules fired')"
```

The skill's own four Markdown files lint clean at error level. A file takes about 70ms.

## Suppressing a false positive

A word this project uses in its literal sense goes in `styles/config/vocabularies/Project/accept.txt`, one regex per line. Entries there are exempt from every rule.

```
[Hh]arness      # "the agent harness", not the verb
```

A passage that quotes bad prose so it can discuss it takes a comment pair, as `SKILL.md` does around its own word lists:

```markdown
<!-- vale WritingWell.BannedWords = NO -->
...
<!-- vale WritingWell.BannedWords = YES -->
```

`.vale.ini` already skips bold labels, quoted strings, code spans, and blockquotes, which covers most quoted specimens without either measure.

## Editing a rule

Each `styles/WritingWell/*.yml` file is one rule. Multi-word patterns use `\s+` rather than a literal space, or they miss across a wrapped line. Word boundaries are implicit, so `leverage` does not catch `leveraging`; write the stem. [Vale Studio](https://studio.vale.sh/) previews a compiled pattern against sample text.
