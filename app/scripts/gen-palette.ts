/**
 * Writes the Material 3 palette for the current seed to:
 *   app/src/theme/palette.css   (first-paint fallback for the app)
 *   docs/palette.css            (inlined into docs/overview.html)
 * Run via `just theme`.
 */
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { generatePalette, paletteCss } from "../src/theme/scheme.ts";
import { SEED, VARIANT } from "../src/theme/seed.ts";

const app = resolve(import.meta.dirname, "..");
const palette = generatePalette(SEED, VARIANT);
const appCss = paletteCss(palette);

// The overview page follows the artifact convention: data-theme on <html>.
const docsCss = appCss
  .replaceAll(":root:not(.light)", ':root:not([data-theme="light"])')
  .replaceAll(":root.dark", ':root[data-theme="dark"]')
  .replace(
    /(:root:not\(\[data-theme="light"\]\) \{|:root\[data-theme="dark"\] \{)/g,
    "$1\n  color-scheme: dark;",
  );

writeFileSync(resolve(app, "src/theme/palette.css"), `${appCss}\n`);
writeFileSync(resolve(app, "../docs/palette.css"), `${docsCss}\n`);
console.log(`palette: seed ${SEED} (${VARIANT}) -> app/src/theme/palette.css, docs/palette.css`);
