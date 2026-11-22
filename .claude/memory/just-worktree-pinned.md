---
name: just-worktree-pinned
description: JUST_JUSTFILE env pins `just` to the main checkout, so `just test`/`just lint` in a .worktrees/ checkout silently test main
type: project
metadata:
  node_type: memory
  type: project
  modified: 2026-11-22T03:17:00.000Z
---

The devcontainer sets `JUST_JUSTFILE=/workspace/later-services-agent/justfile`. Inside a `.worktrees/issue-N` checkout, `just test` and `just lint` therefore run against the **main** checkout and report green regardless of the worktree's changes (seen 2026-11-22 on issue #4: `just test` passed 24 tests while the worktree had 8 failing).

**Why:** a false green before shipping is the worst failure mode for the panel demo.

**How to apply:** in a worktree, run `JUST_JUSTFILE=./justfile just test` (and `lint`), or run the tools directly from the worktree's `app/`. Confirm the vitest `RUN` line shows the worktree path.
