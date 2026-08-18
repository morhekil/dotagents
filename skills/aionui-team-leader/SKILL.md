---
name: aionui-team-leader
description: Lead and coordinate rostered AionUi Team Mode agents, and answer any question that touches the AionUi team/assistant/model catalog. Use when an AionUi team leader needs to propose a teammate lineup, inspect available assistants, spawn independent roster members, delegate work through the shared task board, message or broadcast to teammates, monitor status, rename or replace members, shut teammates down — OR needs to list/describe available assistants, list available models or effort levels per backend, list installed/enabled agent backends, or otherwise answer "what agents/models/assistants do you have" before creating or reusing an assistant template. TRIGGER on any of these even for a read-only, non-delegating question — do not hand-write `$AIONUI_HELPER_BIN team`/`config` CLI calls from memory or from a generic system-prompt example; this skill has the current, authoritative command shapes. Do not use for ordinary Codex subagents, parallel tool calls, or registering agent backends in AionUi settings.
---

# AionUi Team Leader

Coordinate separate, rostered AionUi teammates through the built-in Team interface. Treat every teammate as an independent agent session with its own context and permissions, sharing the team's workspace and task board.

## Use the Team Interface

Prefer the directly exposed `team_*` tools when available. Otherwise use the bundled agent-facing CLI:

```bash
printf '%s' '<json>' | "$AIONUI_HELPER_BIN" team <command>
```

Put all business input in stdin JSON. Do not pass `--stdin`, set or reveal `AIONUI_*` values, call raw backend routes, or guess internal identifiers.

Run `"$AIONUI_HELPER_BIN" team capabilities` whenever the available operations or schemas are uncertain; it returns the authoritative schema for the installed AionUi version. The Command Reference at the end of this file lists exact tool names, command mappings, and input shapes.

## Confirm the Operating Context

Before coordinating work:

1. Confirm this agent is the team leader. Only the leader can spawn, rename, or shut down teammates.
2. Inspect the roster with `team_members` before assuming who exists or which member is active.
3. Inspect the shared task board with `team_task_list` before adding duplicate tasks or changing ownership.
4. Distinguish AionUi Team operations from:
   - Codex or provider-native subagent spawning.
   - AionUi Agent Management, which registers backend CLIs.
   - AionUi assistants, which provide the configuration used to create a roster member.

If the current conversation is not an active AionUi Team or this agent is not the leader, explain the limitation and do not substitute a subagent.

## When Adding Teammates

Give each proposed teammate:

- A distinct display name.
- One clear responsibility and completion condition.
- A model and effort level sized to the task, not a default reused out of habit.

Do not spawn speculative or idle members.

Give each teammate a brief 1-2 paragraph identity profile. The profile must describe a top 1% of world class talent, ideally
and specifically suited for the task being given. Describe a T-shaped professional deeply rooted in the main area but
with sufficient broad knowledge to be effective in spotting and communicating context issues, error, omissions, unclear
or unrealistic requirements, etc.

### Right-size model and effort to the task

Every teammate's model tier and thought/effort level should match what the assigned work actually needs — this is the leader's main lever for keeping the team fast and cheap:

- **Bounded, mechanical, or narrow work** (formatting, a single-file edit, running a known command, summarizing a short document): cheapest available model, `low` or `medium` effort.
- **Ordinary engineering work** (typical feature work, focused debugging, a well-scoped review): mid-tier model, `medium` effort — the default when complexity is unclear.
- **Open-ended, high-stakes, or architecturally tricky work** (ambiguous specs, cross-cutting refactors, adversarial review, hard debugging): the most capable model available, `high` effort or above.

Do not default every teammate to the strongest model and highest effort; that wastes cost and latency on work that does not need it. Re-evaluate mid-task if a teammate's work turns out simpler or harder than expected, and replace them with a differently-sized preset rather than leaving a mismatched assistant in place.

`team_spawn_agent` only accepts `name` and `assistant_id` — it cannot set model or effort at spawn time. To control those, spawn from an existing preset that already has the right fixed model/effort, or create one first (see "Create or Reuse a Model/Effort Preset" below).

## Spawn a Lineup

1. Call `team_list_assistants`; never derive an `assistant_id` from a backend name.
2. When multiple assistants appear suitable, call `team_describe_assistant` for the best candidates.
3. Call `team_spawn_agent` once per approved teammate with only `name` and the catalog's exact `assistant_id`.
4. Re-read `team_members` and use the returned `slot_id` for task ownership and messages.

When rostering a team that must behave in adversarial manner (e.g. writer and reviewer) or have different voices (e.g. a
review panel), make sure to roster teammates on different model families. Avoid using the same model family (e.g.
Claude/Anthropic or Codex/OpenAI) for what must be different sides of a conversation.

Do not ask for human confirmation of a lineup, make your best informed call and execute.

## Create or Reuse a Model/Effort Preset

An AionUi *assistant* is a persistent preset: a backend agent plus a fixed model, a fixed thought/effort level, and default skills. `team_spawn_agent` can only select an existing preset by `assistant_id` — it cannot set model or effort itself. To right-size a teammate, spawn from a preset that already pins the model and effort you need, or create one first.

### Preferred backends

When creating a new preset, prefer models from these backends, over any other registered agent: **Claude Code**, **Codex**, **Opencode Go**. Only reach for a different backend when none of these three offers a model/effort combination that fits the task.

### Reuse before creating

1. Call `team_list_assistants` and check whether a preset's name or description already matches the backend, model, and effort you want.
2. If one fits, use its `assistant_id` directly; do not create a duplicate.
3. If none fits, create a new preset with a name that encodes backend, model, and effort (for example "Claude Sonnet Medium", "Codex Luna Low") so future turns can reuse it instead of proliferating near-duplicate presets.

### Discover current models and effort values first

Model IDs and valid effort values differ per backend and drift across AionUi, Claude Code, and Codex updates. Do not assume values from an earlier session or conversation are still correct; rediscover them each time:

```bash
printf '%s' '{}' | "$AIONUI_HELPER_BIN" config agents list
```

This returns, per backend agent, the available model IDs and — when advertised — their effort/thought-level ranges. If the catalog does not spell out effort values, cross-check the backend's own CLI help (for example `claude --help`, `codex debug models --bundled`). The renderer's Thought Level field is not reliably shown even when a backend supports it, so the config CLI is the dependable path, not the Settings UI.

### Create, set defaults, verify

```bash
assistant_create_json=$(
  printf '%s' '{
    "name": "<Backend Model Effort>",
    "description": "<what this preset is for>",
    "agent_id": "<agent-id-from-config-agents-list>",
    "prompts": [],
    "enabled_skills": []
  }' | "$AIONUI_HELPER_BIN" config assistants create
)
assistant_id=$(printf '%s' "$assistant_create_json" | jq -er '.data.id')

jq -n --arg id "$assistant_id" '{
  assistant_id: $id,
  locale: "en-US",
  defaults: {
    model: {mode: "fixed", value: "<model-id>"},
    permission: {mode: "auto"},
    thought_level: {mode: "fixed", value: "<effort>"},
    skills: {mode: "auto"},
    mcps: {mode: "auto"}
  }
}' | "$AIONUI_HELPER_BIN" config assistants update

jq -n --arg id "$assistant_id" '{assistant_id: $id, locale: "en-US"}' |
  "$AIONUI_HELPER_BIN" config assistants get
```

Before spawning from the new preset, confirm the `config assistants get` read-back shows the intended `agent_id`, `defaults.model` (`mode: "fixed"`, correct `value`), and `defaults.thought_level` (`mode: "fixed"`, correct `value`). Then confirm the preset appears in `team_list_assistants`. If the create succeeds but the update or read-back does not match, fix it with another `config assistants update` rather than spawning from a partial preset.

### Constraints

- Presets are persistent AionUi configuration, not conversation state. Create and change them only through the config service (`config assistants create` / `update` / `get` / `state`) — never by editing `aionui-backend.db`, its WAL/SHM files, or `assistant-rules` files directly. A single preset spans multiple normalized tables plus compatibility and preference rows; direct writes can leave state that is inconsistent or not team-selectable even if the database stays readable.
- Changing a preset's defaults affects new conversations spawned from it going forward; it does not change a teammate already running.
- Once a preset exists, spawn it with the normal Spawn a Lineup flow above — `team_spawn_agent` still only takes `{name, assistant_id}`.

## Delegate Work

1. Create the task with `team_task_create`, setting `owner` to the teammate's exact `slot_id` when known.
2. Represent real dependencies with `blocked_by`; do not encode sequencing only in prose.
3. Send the teammate a concise kickoff message with `team_send_message` when context beyond the task description is useful.
4. Forward absolute attachment paths in `files` when the delegated work depends on user-provided files.
5. Mark or ask the owner to mark the task `in_progress`, then `completed` only when its acceptance condition is met.

All members share the same workspace, so edits are immediately visible.

Use a single teammate for bounded-scope tasks only. Reuse a teammate only when it is a follow-up work grounded in the same context. Roster another teammate for unrelated work.

## Communicate and Monitor

Use targeted messages for assignments, questions, decisions, and corrections. Broadcast with `to: "*"` only when every member needs the same information.

Monitor without noisy polling:

- Check `team_members` for roster state when progress appears stalled or before lifecycle changes.
- Query `team_task_list` with owner or status filters for focused status checks.
- Treat messages as asynchronous; sending a message does not guarantee an immediate reply.
- Resolve blockers by updating dependencies, ownership, or instructions rather than duplicating tasks.
- Synthesize teammate results for the user; do not merely relay unverified claims.

When a teammate reports completion, inspect the artifact or evidence in proportion to risk, update the task board, and communicate any follow-up through the same member slot.

## Adjust the Roster

Use `team_rename_agent` only for clearer ownership or a user-requested name change.

To replace a poorly matched member:

1. Preserve useful results and identify unfinished tasks.
2. Reassign or unblock tasks as needed.
3. Initiate shutdown with `team_shutdown_agent` and a concise reason.
4. Wait for the teammate's shutdown response or confirmed terminal state.
5. Select a replacement from `team_list_assistants`, obtain approval when the replacement changes the agreed lineup, then spawn and brief it.

Do not remove or shut down an agent merely because it is temporarily waiting on a declared dependency, but take down agents when they are no longer needed.


### Shutdown and respawn discipline

`team_shutdown_agent` only takes effect at the target's next turn boundary. A wedged or long-running agent (slow-flagged, deep queued-message backlog) keeps executing and can ignore the shutdown request for a long time — there is no hard-kill in the CLI; a mid-turn agent cannot be force-terminated.

- **Never spawn a replacement until the original is confirmed gone** — a `team_system` "was removed" notice, or its absence from a fresh `team_members` read. Spawning early risks two agents racing the same shared checkout (there is no worktree isolation for docs/prototype work), which causes collisions where one agent's commit resets the other's uncommitted work.
- **Require engineers to commit their own work in small steps as they go**, not in one large batch at the end, so a stray or racing parallel change can never wipe out validated progress.
- **If a member wedges**, do not wait on it to unblock the task: hand the work to a fresh, sole-owner replacement that commits frequently, and reap the wedged original once it finally reaches a turn boundary and the shutdown takes effect.

## Finish Cleanly

Before presenting the team result:

1. Confirm all required tasks are completed or explicitly report blocked items.
2. Reconcile conflicting teammate conclusions against source evidence.
3. Summarize the outcome, validation performed, and any remaining limitations.
4. Shut down teammates when the user requests teardown or when the team's agreed work is finished and they are no longer needed.

If a teammate receives a `shutdown_request`, it should approve shutdown and stop rather than continuing stale work.

## Command Reference

Use direct `team_*` tools when the runtime exposes them. For the agent-facing CLI, pipe the shown JSON into the mapped command:

```bash
printf '%s' '<json>' | "$AIONUI_HELPER_BIN" team <command>
```

### Discovery and roster

| Tool | CLI command | Permission | Input |
| --- | --- | --- | --- |
| `team_members` | `members` | Any team agent | `{}` |
| `team_list_assistants` | `list-assistants` | Any team agent | `{}` |
| `team_describe_assistant` | `describe-assistant` | Any team agent | `assistant_id`, optional `locale` |

Examples:

```bash
printf '%s' '{}' | "$AIONUI_HELPER_BIN" team members
printf '%s' '{}' | "$AIONUI_HELPER_BIN" team list-assistants
printf '%s' '{"assistant_id":"<catalog-id>","locale":"en-US"}' |
  "$AIONUI_HELPER_BIN" team describe-assistant
```

Never guess `assistant_id` from names such as `codex`, `claude`, or `gemini`. Use only catalog IDs returned by `team_list_assistants`.

### Spawn and manage members

| Tool | CLI command | Permission | Required input | Optional input |
| --- | --- | --- | --- | --- |
| `team_spawn_agent` | `spawn-agent` | Leader only | `name`, `assistant_id` | None |
| `team_rename_agent` | `rename-agent` | Leader only | `slot_id`, `new_name` | None |
| `team_shutdown_agent` | `shutdown-agent` | Leader only | `slot_id` | `reason` |

Examples:

```bash
printf '%s' '{"name":"API Reviewer","assistant_id":"<catalog-id>"}' |
  "$AIONUI_HELPER_BIN" team spawn-agent

printf '%s' '{"slot_id":"<slot-id>","new_name":"Backend Reviewer"}' |
  "$AIONUI_HELPER_BIN" team rename-agent

printf '%s' '{"slot_id":"<slot-id>","reason":"Assigned work is complete"}' |
  "$AIONUI_HELPER_BIN" team shutdown-agent
```

`team_spawn_agent` creates a rostered agent with an independent context. It does not create a provider-native subagent and does not accept a model field.

### Tasks

#### Create

Tool: `team_task_create`  
CLI: `task create`  
Permission: any team agent

```json
{
  "subject": "Review API authorization",
  "description": "Trace authorization checks and report source-grounded findings.",
  "owner": "<slot-id>",
  "blocked_by": ["<task-id>"]
}
```

Only `subject` is required. `owner`, `description`, and `blocked_by` are optional.

#### Update

Tool: `team_task_update`  
CLI: `task update`  
Permission: any team agent

```json
{
  "task_id": "<task-id>",
  "status": "in_progress",
  "description": "<replacement-description>",
  "owner": "<slot-id>",
  "blocked_by": []
}
```

Only `task_id` is required. Valid statuses are `pending`, `in_progress`, `completed`, and `deleted`. Supplied fields replace the corresponding task values.

#### List

Tool: `team_task_list`  
CLI: `task list`  
Permission: any team agent

Use `{}` for the full board. Optional filters:

```json
{
  "owner": "<slot-id>",
  "status": ["pending", "in_progress"],
  "include_deleted": false,
  "limit": 50
}
```

`status` accepts one status string or a non-empty array. Values above 200 for `limit` are clamped to 200.

### Messaging

Tool: `team_send_message`  
CLI: `send-message`  
Permission: any team agent

```json
{
  "to": "<slot-id>",
  "message": "Please verify the failing case and attach exact evidence.",
  "files": ["/absolute/path/to/input.pdf"]
}
```

`to` and `message` are required. Use `"to": "*"` to broadcast. `files` is optional and must contain absolute paths.

Messages are asynchronous. Use task state and roster state for durable coordination rather than assuming a sent message was read or completed.

### Assistant presets (model/effort)

No direct `team_*` tool manages presets; use the agent-facing CLI's `config` command group:

```bash
printf '%s' '<json>' | "$AIONUI_HELPER_BIN" config <command>
```

| CLI command | Purpose | Required input |
| --- | --- | --- |
| `agents list` | List backend agents and their available models/effort values | `{}` |
| `assistants create` | Create a new preset | `name`, `agent_id`; optional `description`, `prompts`, `enabled_skills` |
| `assistants update` | Set or change a preset's fixed defaults | `assistant_id`, `locale`, `defaults` |
| `assistants get` | Read back a preset's canonical record | `assistant_id`, `locale` |
| `assistants state` | Enable, disable, or reorder a preset | `assistant_id`, state fields |
| `capabilities` | Authoritative schema for the installed AionUi version | `{}` |

`defaults.model`, `defaults.thought_level`, `defaults.skills`, and `defaults.mcps` each take `{mode: "auto"}` or `{mode: "fixed", value: <value>}`; `defaults.permission` takes `{mode: "auto"}` or an explicit permission mode. A `fixed` mode requires a non-empty `value`. Run `config capabilities` whenever the exact shape is uncertain.

### Common failures

| Error | Meaning or response |
| --- | --- |
| `permission_denied` | The caller is not allowed to perform the operation; spawn, rename, and shutdown require the leader. |
| `not_in_team` or `team_not_found` | The conversation is not attached to an active AionUi Team. Do not fall back to subagent spawning. |
| `agent_not_found` | Refresh `team_members` and use the exact current `slot_id`. |
| `schema_validation_failed` | Re-read `team capabilities`; send JSON on stdin with no unknown fields. |
| `runtime_context_missing` or `runtime_auth_failed` | The operation is outside a valid AionUi agent runtime. Do not set or expose runtime environment values manually. |
| `transport_unavailable` | Report the transport problem and preserve task state; do not claim the operation succeeded. |

Treat the command's success envelope as authoritative. Do not claim a spawn, assignment, message, rename, or shutdown succeeded unless it returns `success: true`.
