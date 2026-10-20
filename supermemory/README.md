# Selective Supermemory retrieval

Claude connects directly to `https://mcp.supermemory.ai/mcp` using its supported
HTTP transport and `headersHelper`. The helper reads `SUPERMEMORY_CC_API_KEY`
first, then `~/.supermemory-claude/credentials.json`, matching the installed
plugin's credential priority for the current projects. No project credential
files existed when this configuration was installed. If one is added later,
update the routing before using that project.

Codex retains its existing MCP proxy and `SUPERMEMORY_CODEX_API_KEY` override.
RedStar supplies both environment variables through its existing direnv setup.
Launch RedStar clients from that environment; starting a GUI without those
variables uses the personal credential. Verify the account before searching.
The runtime mapping and account checks are kept locally in
`~/.local/state/supermemory-trial/`, outside Git.

Automatic profile injection, prompt recall, conversation capture, and Claude's
Supermemory status line are disabled. Native memory remains enabled. The same
retrieval policy is installed in `~/.codex/AGENTS.md` and `~/.claude/CLAUDE.md`.
Existing sessions must be replaced to discard already injected context.

Claude Code also imported a separate `claude.ai Supermemory` connector. A
targeted `deniedMcpServers` entry blocks that duplicate in terminal/IDE sessions;
otherwise a failed configured server could silently switch to another archive.
Other connectors remain enabled. Claude desktop's in-process connectors have
different controls; they are outside this terminal/IDE configuration and need
separate verification before including that surface in the trial.

Run the credential checks with:

```sh
node --test tests/supermemory-headers.test.cjs
```

The trial starts only after the parent task's fresh-session matrix passes.
Its local manifest records the actual start time, evidence, versions, backups,
and any remaining limitations. The parent task stays open for the evaluation.
At the checkpoint, request `audit the Supermemory trial`; no scheduler is used.

The CLI-verified trial started on 20 October 2026 at 17:54:20 +11:00. Its
checkpoint is 3 November, with a 17 November cap. Setup probes are excluded.
The manifest records verification limits; separate desktop in-process cloud
connectors are not counted as verified. Start fresh sessions for trial work.

## Rollback

The local manifest lists each original path, restricted backup, and SHA-256.
Compare the current file with its recorded installed hash before restoring.
If unchanged, copy its backup to that original path and preserve its mode.
If it has changed since installation, restore only this task's edits with a
three-way comparison against the backup and installed copy. For `~/.claude.json`,
remove only the added `mcpServers.supermemory` entry; the client updates other
fields during ordinary use. Remove only this policy's appended sections from
the instruction files. Keep the helper until the registration is removed.

Restoring the original hooks and enabling the old Claude plugin restores
automatic capture and recall. Verify fresh sessions after rollback. Rollback
does not delete remote memories, cancel a subscription, or reconcile uploads
from sessions that were already running.

References: [Claude MCP authentication and registration](https://code.claude.com/docs/en/mcp),
[Supermemory MCP](https://supermemory.ai/mcp/).
