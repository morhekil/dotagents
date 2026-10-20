---
title: Rotate the RedStar Supermemory API key
priority: high
parent: 20261020T1119-evaluate-supermemory-retrieval
created_at: 2026-10-20T18:00:00+11:00
---

An implementation diagnostic printed the RedStar Supermemory key from
`~/Projects/redstar/.envrc` into this task's tool transcript. The value is not
included here and was not committed to dotagents. Restricted local trial
backups intentionally retain the original credential for rollback.

Rotate that key through Supermemory, replace both RedStar client environment
variables, reload direnv, and restart clients. Verify account access and a scoped
read in each client before invalidating the old key. Update the trial manifest's
credential fingerprint and record the configuration change for the audit.
Check any other consumers before revocation. Keep the remote archive intact.

The trial setup at `~/.local/state/supermemory-trial/20261020T174255+1100/`
records the affected credential fingerprint and configuration paths. Do not
copy raw keys into this task, Git, or diagnostics.
