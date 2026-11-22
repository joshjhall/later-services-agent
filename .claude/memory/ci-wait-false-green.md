---
name: ci-wait-false-green
description: "GH_TOKEN is a fine-grained PAT, which can't hold Checks read, so `gh pr checks` and ci-wait.sh fail closed (exit 3) — confirm CI via the Actions run"
type: project
metadata:
  node_type: memory
  type: project
  originSessionId: 07b5dd2f-c272-4568-a807-cb499933dbc6
  modified: 2026-11-22T14:38:58.579Z
---

`GH_TOKEN` in this devcontainer is a fine-grained PAT. The check-runs API requires `checks=read`, which fine-grained PATs cannot be granted (the permission exists only for GitHub Apps). So `gh pr checks` returns "Resource not accessible by personal access token". The workflow plugin's `ci-wait.sh` fails closed: exit **3**, "unreadable check state", never a false green (verified 2026-11-22 on PR #66).

**Why:** Golems can't use the standard CI gate, so every merge relies on a fallback.

**How to apply:** Confirm CI with `gh run list --branch <branch> --limit 1` then `gh run watch <id> --exit-status`, and check the run's head SHA matches the PR head (needs only Actions: Read, which the PAT has). Don't tell the user to add a "Checks" permission to the fine-grained PAT; it doesn't exist. Real fixes are a classic PAT with `repo` scope, or teaching ci-wait.sh to fall back to the Actions runs API (filed upstream as joshjhall/librarian#1272). Related: [[just-worktree-pinned]].
