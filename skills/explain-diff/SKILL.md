---
name: explain-diff
description: Use when the user asks for a rich explanation of a code change, diff, branch, or PR. Produces HTML output.
---

# Explain Diff

Please make me a rich, interactive explanation of the specified code change.

## Report structure

It should have these sections:

- **Background:** Explain the existing system relevant to this change. (You should broadly
  explore surrounding code for this.) We don't know how much the reader already knows, so
  include a deep background for beginners (note that it can be skipped if the reader is already
  familiar), and then a more narrow background directly relevant to the change.
- **Intuition:** Explain the core intuition for the code change. The focus here is to explain
  the essence, not the full details. Use concrete examples with toy data. Use figures and
  diagrams liberally.
- **Code:** Do a high-level walkthrough of the changes to the code, in the style of literate
  programming by Donald Knuth. Group/order the changes in an understandable way.
- **Quiz:** Come up with five questions that test the reader's knowledge of this PR. Medium
  difficulty — difficult enough that you actually need to understand the substance of the PR to
  answer them, but not gotchas. The goal is to help the reader confirm they've actually
  understood. Present these as interactive multiple-choice questions: when the user clicks, tell
  them whether they were correct and give feedback.

## Writing voice

Write with the clarity and flow of Martin Kleppmann, making it engaging and written in classic
style. Transitions between sections should be smooth.

Use **`writing-well`** skill to avoid AI slop and produce clear and concise prose.

## Formatting

The mechanics of the HTML artefact — self-contained file structure, table of contents,
GitHub-style light/dark theming, code/diff block rendering, prose↔code annotations, diagrams,
callouts, and the mandatory render-and-screenshot verification — are handled by the
**`code-report-html`** skill. Follow that skill for all report formatting, styling, and final
verification. This skill governs only *what the explanation says*; `code-report-html` governs
*how it renders*.
