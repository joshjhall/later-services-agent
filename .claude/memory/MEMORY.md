# Memory index

- [Oxford comma](oxford-comma.md) — always use the serial comma in every list, everywhere
- [just is pinned to main](just-worktree-pinned.md) — in a worktree, `just test`/`lint` silently run main; override JUST_JUSTFILE
- [Broker golem prompts via AskUserQuestion](broker-golem-prompts-via-ask.md) — never tell the user to attach; ask in-session, then send-keys
- [Fine-grained PAT cannot read checks](ci-wait-false-green.md) — ci-wait fails closed (exit 3); confirm CI via `gh run watch`; no Checks permission exists for fine-grained PATs
- [No commit scopes](commit-no-scopes.md) — conform rejects `feat(app):`; use bare `feat:` / `fix:`
