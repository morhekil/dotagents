export const meta = {
  name: 'dual-review-loop',
  description: 'Dual-perspective code review: 5 pairs of Claude (Opus) + Codex (/codex:rescue) reviewers fire off in parallel against the branch vs master, all findings are collected and collated (deduped, cross-confirmation tracked), then emitted as a self-contained HTML report.',
  whenToUse: 'Thorough, cross-checked pre-merge review of the current branch or a PR. Multiple independent reviewer pairs run concurrently for speed and breadth.',
  phases: [
    { title: 'Setup', detail: 'resolve base/branch, PR (haiku/low)' },
    { title: 'Review', detail: '5 pairs of Opus reviewer + Codex reviewer, all in parallel, then collate', model: 'opus/high + haiku/low' },
    { title: 'Report', detail: 'render consolidated findings to HTML via code-report-html', model: 'sonnet/high' },
  ],
}

// ---- Config -----------------------------------------------------------------
const PAIR_COUNT = 4
const base = (args && args.base) || 'master'
const target = (args && args.target) || `current branch (\`git diff ${base}...HEAD\`)`
// Free-form extra instructions for this run, e.g. "read GitHub PR #123 and
// YouTrack issue RS-987 for context, and pay attention to the migration path".
// Threaded into the setup agent and both reviewers verbatim.
const extra = (args && args.instructions) || ''
const extraBlock = extra
  ? `\n\nAdditional instructions from the requester for THIS run (follow them, and use any referenced PR/ticket as context — read GitHub PRs/issues with the \`gh\` CLI. If a referenced source needs interactive auth you cannot complete here, such as YouTrack, skip it and note it — do NOT retry in a loop):\n${extra}`
  : ''

// A finding's identity for dedup across reviewers and across parallel pairs.
const keyOf = (f) => `${f.file}:${f.line ?? '?'}`.toLowerCase()

const FINDINGS_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['findings'],
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['severity', 'file', 'category', 'summary', 'scenario', 'fix'],
        properties: {
          severity: { type: 'string', enum: ['blocking', 'high', 'medium', 'low'] },
          file: { type: 'string', description: 'repo-relative path' },
          line: { type: 'integer', description: 'anchor line; 0 if not line-specific' },
          category: { type: 'string', description: 'short kebab-case slug, e.g. correctness, security, convention' },
          summary: { type: 'string', description: 'one-sentence statement of the defect' },
          scenario: { type: 'string', description: 'concrete inputs/state -> wrong behavior' },
          fix: { type: 'string', description: 'recommended fix' },
        },
      },
    },
  },
}

const reviewPrompt = (knownList) => `You are an independent code reviewer. Review the diff of the ${target} against \`${base}\` in this repo.

Shared context already gathered for this run (use it; do NOT re-fetch it, and note any item marked UNAVAILABLE — that context is missing, so flag review gaps that depend on it rather than assuming):
${ctx}

Run \`git diff ${base}...HEAD\` (and \`git diff --stat ${base}...HEAD\`) to see the change, and read the changed files and their sibling services for context.

Do a thorough review: correctness bugs, security issues, consistency with existing service conventions.

Report your findings. For each: severity (blocking/high/medium/low), file, line, a short kebab-case category, a one-sentence summary, a concrete failure scenario, and a recommended fix. If you find nothing, return an empty findings array. Review only — do NOT modify any files.${extraBlock}`

// The codex reviewer runs on a cheap haiku agent whose ONLY job is to relay the
// review task to Codex and return its findings. It must NOT review the code
// itself — otherwise haiku (not Codex) produces the "second opinion", defeating
// the purpose of the dual-reviewer design.
//
// IMPORTANT: do NOT invoke this via the `/codex:rescue` skill or slash command.
// That command is declared `context: fork` — the Skill tool detaches it into an
// independent forked execution and immediately returns a stub acknowledgement
// ("Skill completed (forked execution)") with no way for this agent to ever see
// Codex's actual output. Instead call the underlying codex-companion CLI directly
// via Bash, in the foreground, which blocks until Codex is done and prints its
// findings as stdout — exactly what the `codex:codex-rescue` subagent itself does
// internally, minus the forking wrapper.
const codexReviewPrompt = (knownList, round) => `Your ONLY job is to relay a code-review task to Codex (via the codex-companion CLI) and return Codex's findings. Do NOT review the diff, read the code, run git, or form any opinions of your own — you are a pass-through dispatcher, not the reviewer.

Do this exactly, in order:
1. Write the task text below (between the BEGIN/END markers, verbatim) to a scratch file using the Write tool, e.g. \`/tmp/codex-review-task-r${round}.txt\`.
2. Resolve the codex-companion script path by running this via Bash: \`find ~/.claude/plugins -name codex-companion.mjs 2>/dev/null | head -1\`
3. Run, via a SINGLE Bash call with timeout set to 600000 (10 minutes): \`node "<resolved-script-path>" task --prompt-file "<scratch-file-path>"\` — no \`--write\`, no \`--background\`. This must run in the foreground: the command blocks until Codex's review is complete and prints Codex's full findings as stdout. Do NOT use the \`/codex:rescue\` skill/slash-command or the Skill tool for this — it forks to an unreachable async execution and will never return findings to you. Do NOT poll, invent sentinel files, or use Monitor — the Bash call itself blocks until done.
4. Parse Codex's stdout and map EXACTLY the findings Codex reported into the schema below — do not add, drop, or edit findings based on your own judgement. If Codex reports nothing, or the Bash call fails/times out, return an empty findings array.

--- BEGIN TASK FOR CODEX (write this verbatim to the scratch file) ---
You are an independent code reviewer. Review the diff of the ${target} against \`${base}\` in this repo.

Shared context already gathered for this run (use it; do NOT re-fetch it, and note any item marked UNAVAILABLE — that context is missing, so flag review gaps that depend on it rather than assuming):
${ctx}

Run \`git diff ${base}...HEAD\` (and \`git diff --stat ${base}...HEAD\`) to see the change, and read the changed files and their sibling services for context. Concentrate on correctness bugs, security issues, and anything a primary reviewer might miss.

Report your findings. For each: severity (blocking/high/medium/low), file, line, a short kebab-case category, a one-sentence summary, a concrete failure scenario, and a recommended fix. If you find nothing, return an empty findings array. Review only — do NOT modify any files.${extraBlock}
--- END TASK FOR CODEX ---`

// ---- Setup ------------------------------------------------------------------
phase('Setup')
const ctx = await agent(
  `Gather review context for the ${target} against \`${base}\` in this repo. Return a compact JSON-ish summary with: the base ref, the current branch name, the changed-file list and diffstat (\`git diff --stat ${base}...HEAD\`), any linked PR (try \`gh pr view\` / \`gh pr view <n>\` if the branch maps to one) and its title/ticket.

If the additional instructions reference external context, fetch what you can and DEGRADE GRACEFULLY: read GitHub PRs/issues via the \`gh\` CLI. For any source that needs interactive auth you cannot complete in this non-interactive run (e.g. YouTrack), do NOT block or retry in a loop — record the reference in the summary as explicitly unavailable with the reason, e.g. "RS-987: UNAVAILABLE — YouTrack requires interactive auth; content not read", so the reviewers know context is missing rather than silently absent. Include whatever partial context you did manage to gather.

Any mentions in 'RS-<number>' format are references to YouTrack issues - load and read those for context.

Do not modify files.${extraBlock}`,
  { label: 'gather-context', phase: 'Setup', model: 'sonnet', effort: 'medium' },
)

// ---- Review: fire all pairs in parallel --------------------------------------
// No cross-round knowledge is possible once every pair launches at once, so
// each reviewer runs blind (independent) rather than seeing prior findings.
const NO_KNOWN = '(none yet — independent parallel review, no prior-round context)'

phase('Review')
log(`Launching ${PAIR_COUNT} Opus + Codex reviewer pairs in parallel`)

const pairResults = await parallel(
  Array.from({ length: PAIR_COUNT }, (_, i) => i + 1).map((pair) => async () => {
    // Two independent reviewers per pair, also in parallel.
    const [claudeRes, codexRes] = await parallel([
      () => agent(reviewPrompt(NO_KNOWN), {
        label: `opus:p${pair}`, phase: 'Review', model: 'opus', effort: 'high',
        agentType: 'general-purpose', schema: FINDINGS_SCHEMA,
      }),
      () => agent(codexReviewPrompt(NO_KNOWN, pair), {
        label: `codex:p${pair}`, phase: 'Review', model: 'haiku', effort: 'low',
        // Cheap haiku agent that only relays the task to Codex via a direct Bash
        // call to codex-companion.mjs (NOT the /codex:rescue skill, which forks
        // and never returns findings — see codexReviewPrompt for why) and returns
        // Codex's findings — codexReviewPrompt tells it NOT to review itself.
        // agentType general-purpose so it has Write + Bash available.
        agentType: 'general-purpose', schema: FINDINGS_SCHEMA,
      }),
    ])
    return { pair, claudeRes, codexRes }
  }),
)

// ---- Collate ------------------------------------------------------------------
const seen = new Map()   // key -> { ...finding, sources: [...], pair }
const perRound = []      // kept as "perRound" for report-prompt compatibility; each entry is one parallel pair

for (const result of pairResults.filter(Boolean).sort((a, b) => a.pair - b.pair)) {
  const { pair, claudeRes, codexRes } = result
  const tagged = [
    ...((claudeRes && claudeRes.findings) || []).map((f) => ({ ...f, source: 'claude-opus' })),
    ...((codexRes && codexRes.findings) || []).map((f) => ({ ...f, source: 'codex' })),
  ]

  let newCount = 0
  for (const f of tagged) {
    const key = keyOf(f)
    if (seen.has(key)) {
      const existing = seen.get(key)
      if (!existing.sources.includes(f.source)) existing.sources.push(f.source) // cross-confirmed
    } else {
      seen.set(key, { ...f, sources: [f.source], round: pair })
      newCount++
    }
  }

  perRound.push({ round: pair, newFindings: newCount, runningTotal: seen.size })
  log(`Pair ${pair}: ${newCount} new finding(s) (after dedup), ${seen.size} total so far`)
}

const stopReason = 'all-pairs-parallel'

// ---- Report -----------------------------------------------------------------
phase('Report')
const consolidated = [...seen.values()].sort((a, b) => {
  const order = { blocking: 0, high: 1, medium: 2, low: 3 }
  return (order[a.severity] ?? 9) - (order[b.severity] ?? 9)
})

const reportPath = await agent(
  `Produce a single self-contained HTML code-review report using the \`code-report-html\` skill — invoke that skill first (via the Skill tool) to load its formatting/templating rules, then follow them exactly (GitHub-style light/dark theme, beautiful code/diff blocks with file-identity headers, table of contents, inlined CSS/JS, and its render-and-screenshot verification step). Write the file to a global location OUTSIDE this repo with a filename starting with today's date (get it via \`date +%Y-%m-%d\`), e.g. /tmp/YYYY-MM-DD-dual-review-<branch>.html. Open review in the browser when done.

When compiling final review - consolidate same root causes reported by different reviewer as different findings.

Review context (from setup):
${ctx}

This review ran ${perRound.length} independent Opus+Codex reviewer pairs simultaneously in parallel (not sequential rounds) and collated all their findings afterward.
Per-pair new-findings counts (order is arbitrary — a tie-break over pairs that all launched at once, not a temporal sequence): ${JSON.stringify(perRound)}

Findings were produced by TWO independent reviewers per pair — Claude (Opus) and Codex (/codex:rescue) — across ${perRound.length} parallel pairs (${perRound.length * 2} reviewer runs total). A finding whose \`sources\` array has both is cross-confirmed (higher confidence); single-source findings should be labeled as such. A finding raised by multiple pairs is deduped to one entry.

Consolidated findings (JSON):
${JSON.stringify(consolidated, null, 2)}

The report must include: a header (target branch vs base, PR/ticket), a "how this was produced" note (N reviewer pairs run fully in parallel, then deduped/collated — two-reviewer-per-pair method), findings grouped by severity (blocking -> low) each with file:line, failure scenario, recommended fix, and a cross-confirmed vs single-source marker, a summary of how many pairs surfaced each finding, and a bottom-line "fix before merge vs defer". Do NOT modify any repository source files. Return ONLY the absolute path to the generated HTML file.`,
  { label: 'html-report', phase: 'Report', model: 'sonnet', effort: 'medium', agentType: 'general-purpose' },
)

log(`Done: ${perRound.length} round(s), stop=${stopReason}, ${seen.size} finding(s)`)
return {
  target,
  base,
  rounds: perRound.length,
  stopReason,
  totalFindings: seen.size,
  perRound,
  reportPath,
  findings: consolidated,
}
