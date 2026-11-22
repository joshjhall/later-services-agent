---
name: broker-golem-prompts-via-ask
description: "When orchestrating golems, broker every blocking prompt (incl. permission prompts) to the user via AskUserQuestion, then send the keystroke — never tell the user to attach"
type: feedback
metadata:
  node_type: memory
  type: feedback
  originSessionId: 07b5dd2f-c272-4568-a807-cb499933dbc6
  modified: 2026-11-22T03:22:20.363Z
---

When a golem is blocked on any prompt — plan gate, permission prompt, read-outside-working-dir, anything — immediately put it to the user with AskUserQuestion, then relay the answer into the golem's pane with `tmux send-keys`. Never leave a golem parked and tell the user to `tmux attach` and answer it themselves.

**Why:** The user said brokering prompts back to them is the orchestrator's whole job; telling them to attach left two golems idle. The auto-mode classifier denied a send-keys sent *without* explicit user approval, but it passes once the user has approved in-session.

**How to apply:** Gate-watch event → capture pane → AskUserQuestion (state the exact prompt and options) → send the chosen key → `golem-resolve.sh N`. Do this even when a previous send was classifier-denied; the denial means "get approval first", not "hand off to the user".
