# Later Services Agent

A prototype of a Services campaign manager working alongside an agent that runs the repetitive coordination of managed influencer campaigns. The human states the goal, reviews the agent's proposed creator lineup, and handles the hard moments.

Built for the Later VP, UX take-home exercise (`reference/`).

**Start here:** [Discovery overview](docs/overview.html). It brings together the framing, the tested assumptions, the workflow diagrams and the research in one page; download it or open it locally to view. The markdown sources are in [`docs/`](docs/).

## Layout

| Path | What |
| --- | --- |
| `app/` | Clickable prototype: Vite, React, TypeScript, Tailwind, shadcn/ui |
| `docs/` | Assumptions, workflow diagrams, and the brief |
| `design-system/` | Agent-readable design system (stub; see `docs/design-system-proposal.md`) |
| `reference/` | The exercise brief as received |
| `containers/` | Devcontainer build tooling (submodule) |

## Run it

In the devcontainer, or on a host with Node 26+, pnpm, and `just`:

```sh
just dev   # http://localhost:5173
```

`just` lists the other recipes (`test`, `build`, `lint`, `fmt`). The walkthrough path is in [`docs/demo-script.md`](docs/demo-script.md).

## Theming from one color

The whole palette (app light and dark, charts, status colors, and the overview page) comes from a single seed color through Material 3 dynamic color.

1. Edit `SEED` (and optionally `VARIANT`) in `app/src/theme/seed.ts`. With `just dev` running, the app re-themes immediately.
2. Run `just theme` to regenerate the committed CSS fallbacks and rebuild `docs/overview.html` to match.

## Development setup

```sh
git submodule update --init --checkout containers
cp .env.example .env                  # non-secret config + 1Password refs
cp .env.secrets.example .env.secrets  # OP service-account token
```

Then open the folder in the devcontainer (VS Code or Zed). Lefthook hooks install on container start.
