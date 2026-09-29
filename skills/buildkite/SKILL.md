---
name: buildkite
description: Use the `bk` CLI for anything involving Buildkite — checking build or job status, reading failed build logs, watching a running build, listing pipelines/agents/artifacts, triggering or retrying builds, validating pipeline.yml. Trigger on "buildkite", "bk", "the build", "CI failed", "why did the deploy fail", "check the pipeline", or on seeing a buildkite.com URL. Never scrape the Buildkite web UI or hand-roll curl against the API.
---

# Buildkite via `bk`

`bk` is installed and already authenticated (`bk whoami` confirms org + token scopes). It is the only supported way to touch Buildkite.

**Do not** browse buildkite.com with the browser tools, and **do not** curl `api.buildkite.com` with a hand-supplied token. If `bk` has no subcommand for what you need, use `bk api` — it signs the request with the configured token and speaks both REST and GraphQL.

## Non-interactive use

Always pass `--no-input --no-pager` (add `-q` to drop progress noise). Pass `-o json` and parse with `jq` whenever you need fields rather than a human-readable table.

Inside a git repo with a configured pipeline, `-p/--pipeline` is inferred; outside one, or for another pipeline, pass it explicitly.

## Recipes

```bash
bk build list --limit 10 -o json          # recent builds (filters: --state, --branch, --since, --mine)
bk build view 56 -o json                  # one build incl. its jobs; omit the number for latest on branch
bk build watch 56                         # live progress; --interval N to slow polling
bk job log <job-uuid> -b 56 --no-timestamps
bk artifacts list 56
bk pipeline validate                      # lint pipeline.yml before committing
bk agent list / bk pipeline list / bk cluster list
bk api /pipelines/<slug>/builds/56        # escape hatch, REST; --analytics for test suites
```

Job UUIDs are not in `build list`; get them from the build:

```bash
bk build view 56 -o json | jq -r '.jobs[] | select(.state=="failed") | .id + "  " + .name'
```

`bk build view -o json` emits raw control characters (a commit message's newlines land
unescaped in `.message`), so `jq` dies with "Invalid string: control characters ... must be
escaped" on some builds. `bk api` returns valid JSON for the same data — prefer it whenever a
build's fields get piped into `jq`, and always inside a polling loop:

```bash
bk api /pipelines/<slug>/builds/56 | jq -r '.jobs[] | "\(.name // .label // .type): \(.state)"'
```

## Diagnosing a failed build

1. `bk build view <n> -o json` — read `.state`, `.env`, and the per-job states.
2. For each failed job, `bk job log <uuid> -b <n> --no-timestamps` and read the actual error. Never guess at a cause you have not read in the log.
3. Report the failing step and the error text, quoting the log.

## Write operations

`build create`, `build cancel`, `build rebuild`, `job retry`, `job unblock`, `agent stop/pause`, `pipeline create/copy`, `secret *`, `user invite` change shared state. Run them only when the user asked for that specific action, and say which pipeline/build you are about to hit before running. `-y` skips confirmation prompts — use it only once the user has already confirmed.

Never trust a write's success message: read the resource back and confirm the state actually
changed before reporting it or waiting on its effect.

### Unblocking a block step

`bk job unblock <uuid>` prints "Successfully unblocked job" while doing nothing — the job stays
`blocked` with `unblocked_at: null`. Use the REST endpoint, which returns the updated job:

```bash
bk api --method PUT /pipelines/<slug>/builds/<n>/jobs/<job-uuid>/unblock --data '{}' \
  | jq -c '{label, state, unblocked_at}'    # expect state "unblocked" and a timestamp
```

Get the block step's UUID (`.type == "manual"`), and pick it by `step_key` or `label` so a build
with several block steps does not get the wrong one unblocked — a "deploy to production" step
usually sits right next to the staging one:

```bash
bk api /pipelines/<slug>/builds/<n> | jq -r '.jobs[] | select(.type=="manual") | "\(.id) \(.step_key) \(.label)"'
```
