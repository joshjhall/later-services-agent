/**
 * The one color that themes everything.
 *
 * Change SEED and the app (light + dark), the charts, and the semantic
 * colors regenerate from it via Material 3 dynamic color. `just theme` also
 * re-derives docs/overview.html from the same seed.
 *
 * Try: "#6a3fd1" violet · "#0b6bcb" blue · "#d1462f" coral · "#0f7b6c" teal
 */
export const SEED = "#6a3fd1";

/**
 * How the palette is derived from the seed. "tonalSpot" is the Material You
 * default (calm, low chroma); "fidelity" keeps the primary close to the exact
 * seed (useful for matching a brand color); "vibrant" and "expressive" push
 * chroma and hue rotation further.
 */
export const VARIANT: Variant = "fidelity";

export type Variant = "tonalSpot" | "fidelity" | "vibrant" | "expressive" | "neutral" | "content";
