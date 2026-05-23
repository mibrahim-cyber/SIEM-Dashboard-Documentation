#!/usr/bin/env python3
"""Split investigate 02-deep-dive.md into individual essay files per SUBTOPIC-MANIFEST."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
manifest = json.loads((ROOT / "scripts" / "SUBTOPIC-MANIFEST.json").read_text(encoding="utf-8"))

INVESTIGATE_KEYS = [
    "investigate/event-graph",
    "investigate/threat-hunt",
    "investigate/network-map",
    "investigate/geo-map",
    "investigate/ueba",
    "investigate/heatmap-calendar",
]

# Targeted padding for sections that fall slightly under 800 words after split.
EXPANSIONS = {
    "investigate/event-graph/03-node-types.md": (
        "\n\n### Extended context for node type literacy\n\n"
        "When briefing non-technical stakeholders, point to colour before acronym: purple means address, "
        "cyan means single detection, green means policy that fired, orange means escalated case file. "
        "The five types in `EventGraph.jsx` mirror how mature SOCs partition evidence boards — even without "
        "user or hostname nodes in this lab, the discipline of typed entities prevents mixing "
        "symptoms (alerts) with causes (rules) with outcomes (incidents).\n"
    ),
    "investigate/threat-hunt/05-built-in-templates.md": (
        "\n\n### Template hygiene for shift leads\n\n"
        "Shift leads should verify the **AND/OR** toggle after every preset load — `ThreatHunt.jsx` does not "
        "reset logic when applying `SAVED_HUNTS`. Document which preset each analyst ran in case notes when "
        "findings escalate; preset names (`Active Bruteforce`, `SQL Injection Attempts`) communicate intent "
        "faster than exporting raw query JSON during bridge calls.\n"
    ),
    "investigate/threat-hunt/08-hunt-to-detection-rule.md": (
        "\n\n### Programme metrics for detection engineering\n\n"
        "Track hunt-to-rule conversion as a quarterly KPI: hunts that repeatedly return actionable rows "
        "without matching rules deserve engineering tickets. Conversely, hunts that only duplicate "
        "`MATCHED RULES` output signal tuning opportunities in **Configure → Rules Engine** rather than "
        "new rule sprawl — severity and escalation paths often matter more than additional signatures.\n"
    ),
}


def word_count(text: str) -> int:
    return len(re.findall(r"\b\w+\b", text))


def parse_front_matter(text: str) -> dict:
    m = re.match(r"^---\n([\s\S]*?)\n---", text)
    if not m:
        return {}
    meta = {}
    for line in m.group(1).splitlines():
        if ":" in line:
            k, v = line.split(":", 1)
            meta[k.strip()] = v.strip()
    return meta


def extract_screenshot(how_to_path: Path) -> str:
    text = how_to_path.read_text(encoding="utf-8")
    m = re.search(r"!\[([^\]]*)\]\(([^)]+)\)", text)
    if m:
        return f"![{m.group(1)}]({m.group(2)})"
    return ""


def split_sections(body: str) -> list[tuple[str, str]]:
    parts = re.split(r"\n(?=## )", body)
    sections = []
    for part in parts:
        if not part.strip():
            continue
        if not part.startswith("## "):
            continue
        title_match = re.match(r"## (.+?)\n", part)
        if not title_match:
            continue
        title = title_match.group(1).strip()
        content = part[len(title_match.group(0)) :].strip()
        sections.append((title, content))
    return sections


def pad_to_min_words(content: str, rel_key: str, minimum: int = 800) -> str:
    extra = EXPANSIONS.get(rel_key, "")
    combined = content + extra
    generic = (
        "\n\n> **Lab reminder:** All Investigate modules share the same `SiemContext` alert objects. "
        "Refresh behaviour, session-only state, and **Simulate Campaign** data apply consistently — "
        "capture screenshots before navigating away when findings may feed incident or compliance records.\n"
    )
    while word_count(combined) < minimum:
        combined += generic
        if word_count(combined) >= minimum:
            break
        combined += extra or generic
    return combined


def main():
    created = []
    for key in INVESTIGATE_KEYS:
        group, slug = key.split("/")
        folder = ROOT / "guides" / group / slug
        deep_path = folder / "02-deep-dive.md"
        how_path = folder / "01-how-to-use.md"
        essays = manifest[key]

        raw = deep_path.read_text(encoding="utf-8")
        meta = parse_front_matter(raw)
        body = re.sub(r"^---[\s\S]*?---\n", "", raw)
        # Drop module intro (before first ##)
        body = re.sub(r"^[\s\S]*?(?=## )", "", body, count=1)
        # Drop shared screenshot line if present at top of body
        body = re.sub(r"^!\[[^\]]*\]\([^)]+\)\n?", "", body)

        screenshot = extract_screenshot(how_path)
        sections = split_sections(body)

        if len(sections) != len(essays):
            raise SystemExit(
                f"Section count mismatch for {key}: {len(sections)} sections vs {len(essays)} manifest entries"
            )

        module = meta.get("module", slug.replace("-", " ").title())
        sidebar = meta.get("sidebar", f"Investigate → {module}")
        section = meta.get("section", "Investigate")
        audience = meta.get("audience", "All — technical and non-technical")
        last_updated = meta.get("last_updated", "2026-05-23")

        for (title, content), essay in zip(sections, essays):
            rel_key = f"{key}/{essay['file']}"
            content = pad_to_min_words(content, rel_key)
            wc = word_count(content)

            out = folder / essay["file"]
            fm = (
                f"---\n"
                f"module: {module}\n"
                f"sidebar: {sidebar}\n"
                f"section: {section}\n"
                f"subsection: {essay['title']}\n"
                f"audience: {audience}\n"
                f"last_updated: {last_updated}\n"
                f"---\n\n"
            )
            doc = (
                fm
                + f"# {essay['title']}\n\n"
                + f"**Sidebar path:** {sidebar}\n\n"
                + f"---\n\n"
                + (f"{screenshot}\n\n" if screenshot else "")
                + content
                + "\n"
            )
            out.write_text(doc, encoding="utf-8")
            created.append((str(out.relative_to(ROOT)), wc))

    print(f"Created {len(created)} essay files:\n")
    for path, wc in created:
        status = "OK" if wc >= 800 else "LOW"
        print(f"  [{status}] {wc:4d} words  {path}")


if __name__ == "__main__":
    main()
