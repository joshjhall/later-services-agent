/// <reference types="node" />
import { readFileSync } from "node:fs";
import path from "node:path";
import { render } from "@testing-library/react";
import type { Lane } from "@/agent/rules";
import { LaneBadge } from "./LaneBadge";

// The docs copy the badge labels by hand (#22). Labels are read from the
// rendered badge, so a relabel here fails until the docs are updated and
// overview.html is rebuilt. The rendered HTML is checked at label positions
// (lane titles and legend pills), not by grepping for old labels: phrases like
// "Agent proposes" also appear legitimately as prose.
const docs = path.resolve(import.meta.dirname, "../../../../docs");
const read = (file: string) => readFileSync(path.join(docs, file), "utf8");

const lanes: Lane[] = ["auto", "propose", "human"];

function labelOf(lane: Lane) {
  const { container } = render(<LaneBadge lane={lane} />);
  return container.textContent ?? "";
}

// A legend pill holds the label, optionally followed by a ", qualifier"
// ("Automatic, logged and undoable"), then closes: no bare prefix matches.
const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const pill = (lane: Lane, label: string) =>
  new RegExp(`<span class="lane ${lane}"></span>${escapeRegExp(label)}(, [^<]*)?</span>`);

describe.each(lanes)("the %s lane label", (lane) => {
  test("matches the LANE map in build_overview.py", () => {
    expect(read("build_overview.py")).toContain(`("${lane}", "${labelOf(lane)}")`);
  });

  test("matches the legend pill in overview.template.html", () => {
    expect(read("overview.template.html")).toMatch(pill(lane, labelOf(lane)));
  });

  test("matches every lane title and the legend pill in overview.html", () => {
    const label = labelOf(lane);
    const html = read("overview.html");
    expect(html).toMatch(pill(lane, label));
    const titles = [...html.matchAll(new RegExp(`class="lane ${lane}" title="([^"]*)"`, "g"))].map(
      (m) => m[1],
    );
    expect(titles.length).toBeGreaterThan(0);
    for (const title of titles) expect(title).toBe(label);
  });
});
