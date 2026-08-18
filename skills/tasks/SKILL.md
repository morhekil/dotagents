---
name: tasks
description: Lightweight markdown task tracker for a project. Use when the user wants to file, list, flesh out, update, or complete a task/idea/bug stored as a markdown file in the project's `.tasks/` directory. Trigger on phrases like "file a task", "log an idea", "what's on the list", "mark this done", "any open tasks". Also use this when an issue comes up during work that is not related to the current stream of work - file it as a task for later development instead of getting interrupted.
---

# Tasks

A minimal task tracker: one markdown file per task, stored in `.tasks/` at the project root, versioned with the code. No CLI, no sync layer, no archive — git history is the audit trail.

## File format

Filename: `<timestamp>-<slug>.md`
- `<timestamp>` is the current local time formatted `YYYYMMDDTHHMM` (no separators inside date or time). This makes filenames sort chronologically.
- `<slug>` is 2–5 kebab-case words capturing the gist. Lowercase ASCII only.

Example: `20260522T1430-fix-mobile-signin-layout.md`

Frontmatter:

```yaml
---
title: Short imperative title
status: backlog            # todo | in-progress  (omit `status` if todo)
type: task              # task | bug | idea  (omit if task)
priority: high          # low | normal | high  (omit if normal)
parent: 20260501T0900-some-stuff  # optional, to group under another task
created_at: 2026-05-22T14:30:00+10:00
---
```

Only `title` and `created_at` are required. Omit optional fields when they hold the default — keep frontmatter lean.

Body is free-form markdown: problem statement, rough approach, acceptance criteria, links, code references. Aim for enough context that a coding agent (or future-you) can pick the task up cold weeks later. When creating a task - add all information relevant at the time (code references including current commit where they're at, code samples, log traces, etc), but do not research the implementation. Only go into triage/planning mode for the task when asked explicitly.

## Operations

### Create

1. If `.tasks/` doesn't exist, create it.
2. Compute the filename from the current local time and a slug derived from task's description.
3. Write the file with frontmatter + body.
4. Stage and commit immediately.

Task can be create as a one-line description if that's all that is known at the time - e.g. an idea. Or it can include some context or problem statement - e.g. observed bug specifics.

### List

`ls .tasks/*.md`, read frontmatter from each. Filename sort gives newest-last; reverse for newest-first. Show title, status, type, priority. Group by `parent` when relevant.

### Plan

Edit an existing file in place. When an `idea` gains enough detail to act on (problem clear, approach sketched, success criterion stated), change `type: idea` to `type: task` (or remove the field, since task is default).

### Update status

`backlog` → `in-progress` when work starts. No other status transitions — completion is removal, not a status.

### Complete

Complete the task when its work scope is completed, in the same git commit.

```
git rm .tasks/<filename>
```

Do **not** move to an archive directory. Git history preserves the content if it's ever needed (`git log --diff-filter=D -- .tasks/` and `git show <sha>:<path>`). The working tree stays focused on what's open.

