---
name: github-pr-comments
description: Read and address all actionable human comments on a GitHub pull request. Use when Codex needs to process PR review comments, answer reviewer questions with repository-grounded citations, implement requested changes, commit and push fixes, or post GitHub thread replies using the `gh` CLI and GitHub API.
---

# GitHub Address PR Comments

## Overview

Process every unaddressed human comment on a GitHub pull request. Use `gh` for authenticated GitHub access, classify each comment as a question, requested change, or already handled note, and respond without resolving review conversations.

Any comments you put on Github must be prefixed with `[BOT]` – this is how you will differentiate bot comments from human comments.

## Required Inputs

- A GitHub pull request URL, PR number, or enough repository context to identify the PR.
- Local checkout of the PR branch, or permission to fetch/check it out.
- Authenticated GitHub access through `gh`, `GH_TOKEN`, or `GITHUB_TOKEN`.

## Authentication

1. Confirm `gh` is installed:

```bash
gh --version
```

2. Check authentication without printing tokens:

```bash
gh auth status
```

3. If the environment provides `GH_TOKEN` or `GITHUB_TOKEN`, prefer ephemeral auth by passing it only through the command environment. Never print, echo, commit, or paste tokens.

4. Infer the repository from the PR URL first, then from `gh repo view --json owner,name,url`, then from `git remote -v`.

## Workflow

1. Identify the repository, PR number, current PR branch, target branch, latest commits, and reviewer conversations:

```bash
gh pr view <number-or-url> --json number,title,state,url,headRefName,baseRefName,author,commits,files,reviews,comments,reviewDecision
gh pr checkout <number-or-url>
```

2. Fetch comments with API payloads when needed to preserve IDs, authors, timestamps, paths, positions, outdated status, and thread identity:

```bash
gh api "repos/{owner}/{repo}/issues/<pr-number>/comments" --paginate
gh api "repos/{owner}/{repo}/pulls/<pr-number>/comments" --paginate
gh api "repos/{owner}/{repo}/pulls/<pr-number>/reviews" --paginate
```

Use GraphQL when thread-level resolution state or exact review-thread grouping matters:

```bash
gh api graphql \
  -f owner="<owner>" \
  -f repo="<repo>" \
  -F number=<pr-number> \
  -f query='query($owner:String!,$repo:String!,$number:Int!){ repository(owner:$owner,name:$repo){ pullRequest(number:$number){ reviewThreads(first:100){ pageInfo{hasNextPage endCursor} nodes{id isResolved isOutdated path line originalLine diffSide comments(first:100){nodes{id databaseId author{login} body createdAt url}}}}}}}'
```

Paginate GraphQL follow-up requests if `pageInfo.hasNextPage` is true.

3. Build a comment ledger before acting:
   - Include only human-authored comments on the PR, issue timeline, reviews, and review threads.
   - Exclude bot-authored comments, GitHub system events, CI output, approval-only events, and automated review output.
   - Exclude comments already responded to by the current user or bot after the reviewer comment.
   - Exclude comments made obsolete by later commits, but post a reply explaining the commit that addressed them if no response exists yet.
   - Keep review thread IDs, GraphQL comment IDs, REST `databaseId` values, and URLs so replies go to the correct place.

4. Classify each remaining comment:
   - **Question**: asks why something is implemented this way, what consequences it has, how behavior works, or asks for more information.
   - **Change request**: asks for code, tests, documentation, configuration, behavior, or naming to change.
   - **Mixed**: includes both a question and a requested change; answer the question and make the change when appropriate.

5. Address comments in a traceable order. Prefer one small commit per coherent reviewer concern or per tightly related group of comments.

## Answering Questions

Answer from the current repository state, not memory. Before replying:

- Inspect the relevant files, tests, schemas, docs, config, and history needed to answer accurately.
- Use current local code and, when useful, `git blame`, `git log`, or existing tests to understand intent.
- Cite exact project locations in the GitHub reply using file paths, line links, commit links, or PR branch links.
- Include short code excerpts only when they clarify the answer. Keep them brief and tie each claim to code.

Question replies must let the reviewer follow the answer back to code as ground truth.

## Making Changes

For comments requesting changes:

1. Reproduce or understand the issue locally before editing when practical.
2. Follow all applicable `AGENTS.md` instructions and required skills for code-writing.
3. Keep edits scoped to the reviewer concern.
4. Add or update tests when the change affects behavior, contracts, or user-visible output.
5. Run the relevant verification commands. If verification cannot be run, state why in the GitHub reply and final user summary.
6. Commit the work with a focused message.
7. Push the branch.
8. Reply to the GitHub conversation with:
   - What changed.
   - Verification run and result.
   - Links to the commit or commits.
   - Links to key code blocks changed or relied on.

## Subagent Handoff

If a requested change appears non-trivial, launch a subagent to address that specific comment or tightly related group. Treat work as non-trivial when it likely requires broad refactoring, multiple modules, schema or migration changes, unfamiliar domain investigation, significant tests, or more than a small local edit.

Give the subagent:

- PR URL and PR number.
- Repository path and branch names.
- Exact comment text, author, thread ID, comment ID, URL, and referenced file or line.
- Initial discovery notes, including relevant files, failing tests, suspected ownership boundaries, and applicable `AGENTS.md` requirements.
- Clear instruction not to resolve GitHub conversations.

Review the subagent's work before committing or pushing. The main agent remains responsible for final correctness, verification, GitHub replies, and user summary.

## GitHub Replies

Do not resolve review conversations. The user will resolve comments after reviewing the responses.

Post replies to the existing thread whenever possible. Use REST review-comment replies for inline review comments:

```bash
gh api \
  --method POST \
  "repos/{owner}/{repo}/pulls/<pr-number>/comments/<comment-id>/replies" \
  -f "body=<markdown response>"
```

Use `gh pr comment` only for top-level PR replies or when a thread-specific reply is impossible:

```bash
gh pr comment <number-or-url> --body "<markdown response>"
```

Write replies that are direct and evidence-backed:

- Start with the answer or change summary.
- Link to commits for code changes.
- Link to exact code blocks for explanations.
- Mention tests or checks run.
- Keep bot and process details out unless they matter to the reviewer.

## Final User Summary

After all unaddressed human comments are handled, summarize:

- Number of comments read and number acted on.
- Which comments were answered, changed, or delegated.
- Commits pushed.
- Verification run.
- Any remaining comments intentionally left for the user.
