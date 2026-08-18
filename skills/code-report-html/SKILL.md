---
name: code-report-html
description: Formatting/templating plumbing for producing a single self-contained HTML report that contains code and code-related prose — code reviews, diff explanations, architecture write-ups, post-mortems, migration guides, etc. Covers HTML artefact structure, GitHub-style light/dark theming, beautiful code/diff block rendering (and the whitespace pitfalls), prose↔code annotations, diagrams, callouts, and a mandatory render-and-screenshot verification. Use this whenever another skill or task needs to emit an HTML file mixing source code and explanatory prose.
---

# Code Report HTML

Low-level, reusable rules for turning code + prose into a beautiful, self-contained HTML
report. This skill owns the **mechanics** — the styling, templating, code rendering, and
verification. It is deliberately generic: it does not know or care what the report *says*.
The calling skill or task supplies the content and section structure; this skill makes it
render well.

## Artefact format

- Output a **single self-contained HTML file** with all CSS and JavaScript inlined — no
  external assets, no build step, openable directly in a browser.
- Make the whole thing **one long scrollable page** with section headers and a table of
  contents that links to them. Do **not** use tabs for the top-level structure. Sub-regions
  (e.g. before/after toggles inside a single code block) may use local controls.
- Basic **responsive** styling so it reads on a phone.
- Put the file in a global location **outside the code repo**, and make the filename start
  with today's date in `YYYY-MM-DD-` format so files stay time-sorted and out of version
  control. For example: `/tmp/2026-01-12-<slug>.html`.

## Theming

- Use a **GitHub-style light/dark theme**. Default to the user's browser preference
  (`prefers-color-scheme`) and provide a visible toggle to switch.
- Use **one** code theme consistently across every block, with readable monospace sizing,
  stable gutters, and clear hover / selected-line states.

## Code & diff blocks

Make the code look beautiful and efficient to work with. Every code block should carry:

- **File identity header:** repo-relative path, language, symbol/function name when known,
  commit SHA, and whether the block is `before`, `after`, or `diff`.
- **Diff-aware rendering:** support added/removed/changed lines, intra-line highlights, hunk
  headers, collapsed unchanged context, and side-by-side or before/after views where useful.
- **Source-relative line numbers** in a stable gutter.
- **Context controls:** let the reader expand hidden surrounding lines to inspect more context
  without leaving the page.
- **Source integrity:** GitHub links must use immutable commit SHAs, exact line ranges, and
  clearly distinguish base vs head revisions.
- **Highlighting semantics:** visually flag lines tied to risk, behaviour changes, tests,
  migrations, public API changes, data-shape changes, and security/privacy implications.
- **Caller/test links:** when a snippet changes behaviour, include nearby links to relevant
  callers, specs, fixtures, serializers, routes, migrations, or generated output.

### The `<pre>` whitespace rule (read before writing any code block)

For code blocks, always use `<pre>` tags. There are two valid rendering styles, and you must
pick **exactly one per block** and set whitespace handling to match — mixing them causes
broken layout:

- **Plain block:** a single `<pre>` (or a styled div) whose content is raw text with real
  `\n` newlines and no per-line child elements. This element **must** have `white-space: pre`
  (or `pre-wrap`) in its CSS, or the browser collapses every newline into a single line.
- **Per-line elements (required for diffs, line numbers, and per-line highlights):** each
  source line is its own block element, e.g. `<span class="line">…</span>` with
  `.line{display:block}`. Here the line breaks come from the block boxes, **not** from text
  newlines. If the container ALSO preserves whitespace (`white-space: pre`), the literal
  newlines you wrote between `</span>` and the next `<span>` render as extra blank lines, so
  every row is doubled in height with an empty band between rows. To avoid this, set
  `white-space: normal` on the container `<pre>` (so inter-element newlines collapse) and put
  `white-space: pre` on each `.line` (so each line preserves its own indentation and internal
  spacing). Equivalently, emit the `.line` elements with no whitespace between them — but the
  CSS approach is robust regardless of source formatting, so prefer it.
- Before saving, for each code block identify which style it uses and confirm the whitespace
  CSS matches the rule above. A quick tell for the doubling bug: a `<pre>` that both contains
  `<span class="line">` children AND has `white-space: pre`/`pre-wrap` on the `<pre>` itself.

## Prose ↔ code annotations

- **Bidirectional annotations:** prose explanations should link to exact line ranges, and code
  line callouts should link back to the explanation. Clicking an explanation should highlight
  the relevant lines.
- Use **callouts** for key concepts, definitions, important edge cases, and warnings.

## Diagrams

- **Never use ASCII diagrams.** Always use simple HTML designs for diagrams, HTML lists for
  lists of things, etc.
- Prefer a **small number of diagram families** that can be reused throughout the report to
  explain various cases, rather than a bespoke diagram every time. Useful kinds:
  - A very simplified version of the UI the user sees in the app, to explain UI changes.
  - A system diagram showing data flow or communication between components — **include example
    data** in it.

## Final verification (mandatory before delivery)

Validate every code block has highlighting, source-relative line numbers, a working permalink,
preserved whitespace, and no clipped text.

Render the HTML file into an image and **specifically screenshot a diff/code block region**
(not just the top of the page), then verify:

- Code lines are single-height and tightly stacked, with **no empty band between consecutive
  lines**. Double-height rows with blank gaps mean the per-line whitespace bug above — fix the
  container's `white-space` before shipping.
- Indentation and internal spacing within each line are preserved and columns still align.
- All diagrams, tables, and other visual artefacts are well positioned, appropriately sized
  (not too small, and not blowing out of the page layout), and readable in both typography and
  colour choices, in both light and dark themes.
