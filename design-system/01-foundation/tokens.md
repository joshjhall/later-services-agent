# Tokens

**Status:** Draft · **Source of truth:** `app/src/theme/`

Every color is generated from one seed (`app/src/theme/seed.ts`) by Material 3 dynamic color and exposed two ways:

- **shadcn tokens** for components: `background`, `foreground`, `card`, `primary`, `secondary`, `accent`, `muted`, `destructive`, `border`, `ring`, `chart-1…5`.
- **Semantic tokens**: `success`, `warning`, `info`, each with `-foreground`, `-container` and `on-*-container`, harmonized toward the seed.
- **Raw Material roles** as `--md-*` (e.g. `--md-surface-container-high`) when a component needs a specific surface level.

Rules:

- Pair every fill with its on-color (`bg-accent text-accent-foreground`, `bg-success-container text-on-success-container`). The palette guarantees WCAG AA for these pairs; ad hoc pairs are not guaranteed.
- Do not write values into this file. Run `just theme` and read `app/src/theme/palette.css` if you need them.

Radius: `--radius` (0.75rem) with `sm`…`4xl` steps. Type: Geist Variable, set in `app/src/index.css`.
