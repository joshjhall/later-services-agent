import { generatePalette, paletteCss } from "./scheme";

const HEX = /^#[0-9a-f]{6}$/;
const lum = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = Number.parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

describe("generatePalette", () => {
  const seeds = ["#6a3fd1", "#0b6bcb", "#d1462f", "#0f7b6c", "#e6c200"];

  test.each(seeds)("%s yields the same token set for light and dark", (seed) => {
    const p = generatePalette(seed, "fidelity");
    expect(Object.keys(p.dark)).toEqual(Object.keys(p.light));
    for (const v of [...Object.values(p.light), ...Object.values(p.dark)]) expect(v).toMatch(HEX);
  });

  test.each(seeds)("%s keeps text pairs at WCAG AA (4.5:1) in both themes", (seed) => {
    const p = generatePalette(seed, "fidelity");
    for (const t of [p.light, p.dark]) {
      for (const [bg, fg] of [
        ["background", "foreground"],
        ["card", "card-foreground"],
        ["primary", "primary-foreground"],
        ["accent", "accent-foreground"],
        ["muted", "muted-foreground"],
      ]) {
        expect(contrast(t[bg], t[fg]), `${seed} ${bg}/${fg}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  test("dark applies under the OS preference unless .light is forced", () => {
    const css = paletteCss(generatePalette("#6a3fd1"));
    expect(css).toContain(":root:not(.light)");
    expect(css).toContain(":root.dark");
  });
});
