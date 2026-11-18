#!/usr/bin/env python3
"""Render the discovery docs into one reviewable page: docs/overview.html.

Sources (the markdown stays the source of truth):
  discovery/framing.md, flows.md, assumptions.md, discovery/research.md
Theme: docs/palette.css, generated from app/src/theme/seed.ts by `just theme`,
so the page and the prototype share one Material 3 palette.

Mermaid fences become <pre class="mermaid"> blocks; everything else goes
through pandoc (gfm -> html). Run: `just docs` (or python3 docs/build_overview.py).
"""

import html
import re
import subprocess
from pathlib import Path

DOCS = Path(__file__).resolve().parent
SECTIONS = [
    ("framing", "Framing", "The problem, tested assumptions, and the autonomy split", DOCS / "discovery/framing.md"),
    ("flows", "Flows", "How information moves between brand, creators, agent and CM", DOCS / "flows.md"),
    ("assumptions", "Assumptions", "What is public, what is invented, what is a design call", DOCS / "assumptions.md"),
    ("research", "Research", "Sources behind every claim", DOCS / "discovery/research.md"),
]
MERMAID = re.compile(r"^```mermaid\n(.*?)^```\n", re.S | re.M)
VERDICT = {"✅": ("ok", "Holds"), "🔶": ("partial", "Corrected"), "❌": ("no", "Doesn't hold")}
LANE = {"🤖": ("auto", "Agent acts alone"), "🤝": ("propose", "Agent proposes, CM approves"), "🧑": ("human", "Human only")}


def pandoc(md: str, slug: str) -> str:
    return subprocess.run(
        ["pandoc", "-f", "gfm", "-t", "html", "--wrap=none", "--id-prefix", f"{slug}-"],
        input=md, capture_output=True, text=True, check=True,
    ).stdout


def verdict_cards(table_html: str) -> str:
    """Turn the assumptions table (#, Assumption, Verdict, Evidence) into cards."""
    rows = re.findall(r"<tr>\s*<td>(.*?)</td>\s*<td>(.*?)</td>\s*<td>(.*?)</td>\s*<td>(.*?)</td>\s*</tr>", table_html, re.S)
    cards = []
    for num, claim, mark, evidence in rows:
        cls, label = VERDICT.get(mark.strip(), ("partial", mark))
        cards.append(
            f'<article class="verdict-card {cls}"><header><span class="vnum">{num}</span>'
            f'<span class="vchip">{label}</span></header><h4>{claim}</h4><p>{evidence}</p></article>'
        )
    return f'<div class="verdicts">{"".join(cards)}</div>'


def to_html(md: str, slug: str) -> tuple[str, list[tuple[str, str]]]:
    blocks: list[str] = []

    def stash(m: re.Match[str]) -> str:
        blocks.append(m.group(1))
        return f"\n\nMERMAIDBLOCK{len(blocks) - 1}\n\n"

    md = MERMAID.sub(stash, md)
    md = re.sub(r"\A# .*\n", "", md)  # the section header supplies the title
    out = pandoc(md, slug)

    # Lede: the first paragraph of a doc reads as its standfirst.
    out = re.sub(r"\A\s*<p>", '<p class="lede">', out, count=1)
    # Framing §1 is the thesis: promote it to a pull statement.
    if slug == "framing":
        out = re.sub(
            r'(<h2 id="framing-1-the-thesis-in-one-paragraph">.*?</h2>)\s*<p>(.*?)</p>',
            r'\1<blockquote class="thesis"><p>\2</p></blockquote>', out, count=1, flags=re.S,
        )
        out = re.sub(
            r"<table>\s*<thead>\s*<tr>\s*<th>#</th>\s*<th>Assumption</th>.*?</table>",
            lambda m: verdict_cards(m.group(0)), out, count=1, flags=re.S,
        )

    # Section numbers in headings ("3. Testing...") become a styled index.
    out = re.sub(r'<h2 id="([^"]+)">(\d+)\. ', r'<h2 id="\1"><span class="hnum">\2</span>', out)
    toc = re.findall(r'<h2 id="([^"]+)">(?:<span class="hnum">\d+</span>)?(.*?)</h2>', out)

    out = re.sub(r'href="(?:\.\./|discovery/)?framing\.md"', 'href="#framing"', out)
    out = re.sub(r'href="(?:\.\./)?flows\.md"', 'href="#flows"', out)
    out = re.sub(r'href="(?:discovery/)?research\.md"', 'href="#research"', out)
    for mark, (cls, label) in LANE.items():
        out = out.replace(mark, f'<span class="lane {cls}" title="{label}" aria-label="{label}"></span>')
    out = out.replace("<table>", '<div class="table-wrap"><table>').replace("</table>", "</table></div>")
    out = re.sub(r'<a href="http', '<a target="_blank" rel="noopener" href="http', out)

    # Diagrams last, so none of the rewrites above touch Mermaid source. The
    # nearest preceding heading becomes the figure caption.
    for i, src in enumerate(blocks):
        out = out.replace(
            f"<p>MERMAIDBLOCK{i}</p>",
            f'<figure class="diagram"><div class="diagram-scroll"><pre class="mermaid">{html.escape(src)}</pre></div></figure>',
        )
    return out, [(i, re.sub(r"<.*?>", "", t)) for i, t in toc]


def main() -> None:
    shell = (DOCS / "overview.template.html").read_text()
    palette = (DOCS / "palette.css").read_text()
    seed = re.search(r"seed (#[0-9a-fA-F]{6})", palette)

    sections, nav = [], []
    for slug, title, dek, path in SECTIONS:
        body, toc = to_html(path.read_text(), slug)
        sub = "".join(f'<li><a href="#{i}">{t}</a></li>' for i, t in toc)
        nav.append(f'<li><a class="nav-section" href="#{slug}">{title}</a>{f"<ol>{sub}</ol>" if sub else ""}</li>')
        sections.append(
            f'<section id="{slug}" class="doc"><header class="doc-head">'
            f'<p class="kicker">{title}</p><p class="doc-title">{dek}</p>'
            f'<p class="src">Source: <code>{path.relative_to(DOCS.parent)}</code></p></header>{body}</section>'
        )

    out = (
        shell.replace("/*{{PALETTE}}*/", palette)
        .replace("{{SEED}}", seed.group(1) if seed else "")
        .replace("{{NAV}}", "\n".join(nav))
        .replace("{{BODY}}", "\n".join(sections))
    )
    (DOCS / "overview.html").write_text(out)
    print(f"wrote {DOCS / 'overview.html'} ({len(out):,} bytes)")


if __name__ == "__main__":
    main()
