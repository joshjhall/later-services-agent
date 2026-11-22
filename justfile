# Common tasks for the Later Services agent prototype. Run `just` to list recipes.
# Node and pnpm come from the devcontainer (or the host); the app lives in app/.

app := "app"

[private]
default:
    @just --list

# Install app dependencies from pnpm-lock.yaml
install:
    cd {{ app }} && pnpm install --frozen-lockfile

# Vite dev server on http://localhost:5173 (binds 0.0.0.0 for the devcontainer port)
[working-directory('app')]
dev: install
    pnpm dev

# Production build to app/dist (type-checks first)
[working-directory('app')]
build: install
    pnpm build

# Serve the production build
[working-directory('app')]
preview: build
    pnpm preview --host 0.0.0.0

# Run the vitest suite; extra args go to vitest (e.g. `just test App`)
[working-directory('app')]
test *args: install
    pnpm vitest run {{ args }}

# Regenerate the Material 3 palette from app/src/theme/seed.ts, then the overview page
theme: install
    cd {{ app }} && pnpm theme
    just docs

# Rebuild docs/overview.html from the markdown in docs/ and docs/palette.css
docs:
    python3 docs/build_overview.py

# Slidev deck on http://localhost:5173/slides/ via the prototype's proxy (or :3030/slides/)
[working-directory('slides')]
slides:
    pnpm install --frozen-lockfile
    pnpm dev

# Prototype and deck together: http://localhost:5173 and http://localhost:5173/slides/
present:
    #!/usr/bin/env bash
    set -euo pipefail
    trap 'kill 0' EXIT
    just slides &
    just dev

# Build the deck to slides/dist (a single-page app: serve it, don't open the file)
[working-directory('slides')]
slides-build:
    pnpm install --frozen-lockfile
    pnpm build

# Add shadcn components (e.g. `just ui table checkbox`)
[working-directory('app')]
ui +components:
    pnpm dlx shadcn@latest add {{ components }} -y

# --- Linting: `lint` checks everything (CI-safe); `fmt` applies fixes ---

# Run every linter and format check without changing files
lint: lint-web lint-types lint-docs lint-config lint-sh lint-spelling

# Apply every auto-fix and formatter
fmt: fmt-web fmt-docs fmt-config fmt-sh

# TS/TSX/CSS: biome lint + format check
lint-web:
    biome check

# TypeScript: project-wide type check
[working-directory('app')]
lint-types: install
    pnpm typecheck

# Markdown: rumdl
lint-docs:
    rumdl check .

# YAML/JSON (dprint) and TOML (taplo)
lint-config:
    dprint check
    git ls-files '*.toml' ':!containers' | xargs -r taplo fmt --check

# Shell scripts outside the containers submodule
lint-sh:
    git ls-files '*.sh' ':!containers' | xargs -r shellcheck --severity=warning
    git ls-files '*.sh' ':!containers' | xargs -r shfmt -d -i 4 -ci

# Spelling across the repo
lint-spelling:
    typos

[private]
fmt-web:
    biome check --write

[private]
fmt-docs:
    rumdl fmt .

[private]
fmt-config:
    dprint fmt
    git ls-files '*.toml' ':!containers' | xargs -r taplo fmt

[private]
fmt-sh:
    git ls-files '*.sh' ':!containers' | xargs -r shfmt -w -i 4 -ci

# Remove build output and caches; `just install` rebuilds
clean:
    rm -rf {{ app }}/dist {{ app }}/node_modules/.vite {{ app }}/node_modules/.tmp

# Remove node_modules too, then reinstall and test
reset: clean
    rm -rf {{ app }}/node_modules
    just test
