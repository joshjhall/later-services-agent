---
name: commit-no-scopes
description: "The conform commit-msg hook rejects conventional-commit scopes — write `feat: …`, never `feat(app): …`"
type: project
metadata:
  node_type: memory
  type: project
  modified: 2026-11-22T17:36:19.950Z
  originSessionId: 07b5dd2f-c272-4568-a807-cb499933dbc6
---

This repo's `conform` commit-msg hook rejects scoped conventional commits. `feat(agent): …` or `fix(app): …` fails; `feat: …` and `fix: …` pass.

**Why:** Nearly every golem in the 2026-11-22 orchestration run hit the rejection on its first commit and had to rewrite the message.

**How to apply:** Write commit headers and squash-merge titles with a bare type and no scope. Related: [[just-worktree-pinned]].
