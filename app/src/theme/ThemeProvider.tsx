import { createContext, type ReactNode, use, useEffect, useMemo, useState } from "react";
import { generatePalette, paletteCss } from "./scheme";
import { SEED, VARIANT } from "./seed";

type Mode = "system" | "light" | "dark";

interface ThemeState {
  seed: string;
  setSeed: (hex: string) => void;
  mode: Mode;
  setMode: (mode: Mode) => void;
}

const ThemeContext = createContext<ThemeState | null>(null);
const STYLE_ID = "md3-palette";

/**
 * Generates the Material 3 palette from the seed and injects it as CSS
 * variables. Editing seed.ts hot-reloads this module, so a live seed change
 * re-themes the whole app without a page refresh. `setSeed` lets an in-app
 * picker override the file for exploration.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [seed, setSeed] = useState(SEED);
  const [mode, setMode] = useState<Mode>("system");

  // A new file seed (HMR) wins over any picker override.
  useEffect(() => setSeed(SEED), []);

  const css = useMemo(() => paletteCss(generatePalette(seed, VARIANT)), [seed]);

  useEffect(() => {
    let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement("style");
      el.id = STYLE_ID;
      document.head.appendChild(el);
    }
    el.textContent = css;
  }, [css]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", mode === "dark");
    root.classList.toggle("light", mode === "light");
  }, [mode]);

  const value = useMemo(() => ({ seed, setSeed, mode, setMode }), [seed, mode]);
  return <ThemeContext value={value}>{children}</ThemeContext>;
}

export function useTheme(): ThemeState {
  const ctx = use(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
