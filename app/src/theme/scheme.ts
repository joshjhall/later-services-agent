import {
  argbFromHex,
  Blend,
  type DynamicScheme,
  Hct,
  hexFromArgb,
  SchemeContent,
  SchemeExpressive,
  SchemeFidelity,
  SchemeNeutral,
  SchemeTonalSpot,
  SchemeVibrant,
  TonalPalette,
} from "@material/material-color-utilities";
import type { Variant } from "./seed";

/** CSS custom properties for one theme (name without the leading `--`). */
export type TokenMap = Record<string, string>;

export interface Palette {
  seed: string;
  light: TokenMap;
  dark: TokenMap;
}

const SCHEMES = {
  tonalSpot: SchemeTonalSpot,
  fidelity: SchemeFidelity,
  vibrant: SchemeVibrant,
  expressive: SchemeExpressive,
  neutral: SchemeNeutral,
  content: SchemeContent,
} as const satisfies Record<Variant, unknown>;

/**
 * Fixed brand-agnostic hues for status colors, harmonized toward the seed so
 * they sit in the same family without losing their meaning.
 */
const SEMANTIC = { success: "#2e7d32", warning: "#b26a00", info: "#1565c0" } as const;

/** Material roles exposed verbatim as `--md-<kebab-name>`. */
const MD_ROLES = [
  "primary",
  "onPrimary",
  "primaryContainer",
  "onPrimaryContainer",
  "secondary",
  "onSecondary",
  "secondaryContainer",
  "onSecondaryContainer",
  "tertiary",
  "onTertiary",
  "tertiaryContainer",
  "onTertiaryContainer",
  "error",
  "onError",
  "errorContainer",
  "onErrorContainer",
  "surface",
  "surfaceDim",
  "surfaceBright",
  "onSurface",
  "onSurfaceVariant",
  "surfaceContainerLowest",
  "surfaceContainerLow",
  "surfaceContainer",
  "surfaceContainerHigh",
  "surfaceContainerHighest",
  "outline",
  "outlineVariant",
  "inverseSurface",
  "inverseOnSurface",
  "inversePrimary",
] as const satisfies readonly (keyof DynamicScheme)[];

const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

function semantic(name: string, hex: string, seed: number, dark: boolean): TokenMap {
  const palette = TonalPalette.fromInt(Blend.harmonize(argbFromHex(hex), seed));
  const t = (tone: number) => hexFromArgb(palette.tone(tone));
  return dark
    ? {
        [name]: t(80),
        [`${name}-foreground`]: t(20),
        [`${name}-container`]: t(30),
        [`on-${name}-container`]: t(90),
      }
    : {
        [name]: t(40),
        [`${name}-foreground`]: t(100),
        [`${name}-container`]: t(90),
        [`on-${name}-container`]: t(10),
      };
}

function tokens(s: DynamicScheme, seed: number): TokenMap {
  const c = (role: (typeof MD_ROLES)[number]) => hexFromArgb(s[role]);
  const md = Object.fromEntries(MD_ROLES.map((r) => [`md-${kebab(r)}`, c(r)]));
  const charts = [s.primaryPalette, s.tertiaryPalette, s.secondaryPalette];
  const chartTone = s.isDark ? 75 : 45;

  return {
    ...md,
    // shadcn/ui contract. Surfaces step up through the container ladder so
    // cards and popovers separate from the page without borders doing it all.
    background: c("surface"),
    foreground: c("onSurface"),
    card: s.isDark ? c("surfaceContainer") : c("surfaceContainerLowest"),
    "card-foreground": c("onSurface"),
    popover: c("surfaceContainerHigh"),
    "popover-foreground": c("onSurface"),
    primary: c("primary"),
    "primary-foreground": c("onPrimary"),
    secondary: c("secondaryContainer"),
    "secondary-foreground": c("onSecondaryContainer"),
    muted: c("surfaceContainerHigh"),
    "muted-foreground": c("onSurfaceVariant"),
    accent: c("primaryContainer"),
    "accent-foreground": c("onPrimaryContainer"),
    destructive: c("error"),
    "destructive-foreground": c("onError"),
    border: c("outlineVariant"),
    input: c("outline"),
    ring: c("primary"),
    sidebar: c("surfaceContainerLow"),
    "sidebar-foreground": c("onSurface"),
    "sidebar-primary": c("primary"),
    "sidebar-primary-foreground": c("onPrimary"),
    "sidebar-accent": c("secondaryContainer"),
    "sidebar-accent-foreground": c("onSecondaryContainer"),
    "sidebar-border": c("outlineVariant"),
    "sidebar-ring": c("primary"),
    // Charts: primary, tertiary, secondary hues at a tone readable on surface.
    "chart-1": hexFromArgb(charts[0].tone(chartTone)),
    "chart-2": hexFromArgb(charts[1].tone(chartTone)),
    "chart-3": hexFromArgb(charts[2].tone(chartTone)),
    "chart-4": hexFromArgb(charts[0].tone(s.isDark ? 60 : 70)),
    "chart-5": hexFromArgb(charts[1].tone(s.isDark ? 60 : 70)),
    ...Object.entries(SEMANTIC).reduce<TokenMap>(
      (acc, [name, hex]) => Object.assign(acc, semantic(name, hex, seed, s.isDark)),
      {},
    ),
  };
}

/** Generate light and dark token maps from one seed color. */
export function generatePalette(
  seedHex: string,
  variant: Variant = "tonalSpot",
  contrast = 0,
): Palette {
  const seed = argbFromHex(seedHex);
  const Scheme: (typeof SCHEMES)[Variant] = SCHEMES[variant];
  const hct = Hct.fromInt(seed);
  return {
    seed: seedHex,
    light: tokens(new Scheme(hct, false, contrast), seed),
    dark: tokens(new Scheme(hct, true, contrast), seed),
  };
}

const block = (selector: string, map: TokenMap) =>
  `${selector} {\n${Object.entries(map)
    .map(([k, v]) => `  --${k}: ${v};`)
    .join("\n")}\n}`;

/**
 * Serialize a palette as CSS. Light is the default; dark applies with the
 * `.dark` class (shadcn convention) or, unless `.light` is set, the OS setting.
 */
export function paletteCss(p: Palette): string {
  return [
    `/* Generated from seed ${p.seed} by src/theme/scheme.ts. Do not edit. */`,
    block(":root", p.light),
    `@media (prefers-color-scheme: dark) {\n${block(":root:not(.light)", p.dark).replace(/^/gm, "  ")}\n}`,
    block(":root.dark", p.dark),
  ].join("\n\n");
}
