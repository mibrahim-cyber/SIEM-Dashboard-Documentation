#!/usr/bin/env python3
"""Build assets/doc-index.json from INDEX.md files and SUBTOPIC-MANIFEST.json."""
from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "scripts" / "SUBTOPIC-MANIFEST.json"
OUT = ROOT / "assets" / "doc-index.json"


def parse_index_md(path: Path) -> dict:
    text = path.read_text(encoding="utf-8")
    module_dir = path.parent.relative_to(ROOT / "guides").as_posix()
    title_match = re.search(r"^#\s+(.+)$", text, re.M)
    module_title = title_match.group(1).strip() if title_match else module_dir

    pages: list[dict] = []
    for m in re.finditer(r"\[([^\]]+)\]\(([^)]+\.md)\)", text):
        link_title, href = m.group(1), m.group(2)
        if href.startswith("http"):
            continue
        file_name = Path(href).name
        pages.append(
            {
                "file": file_name,
                "path": f"guides/{module_dir}/{file_name}".replace("\\", "/"),
                "title": link_title.strip(),
            }
        )

    how_to = path.parent / "01-how-to-use.md"
    if how_to.exists() and not any(p["file"] == "01-how-to-use.md" for p in pages):
        pages.insert(
            0,
            {
                "file": "01-how-to-use.md",
                "path": f"guides/{module_dir}/01-how-to-use.md".replace("\\", "/"),
                "title": f"{module_title} — quick start",
            },
        )

    return {
        "module": module_dir,
        "module_title": module_title,
        "index_path": path.relative_to(ROOT).as_posix(),
        "pages": pages,
    }


def from_manifest() -> list[dict]:
    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    modules: list[dict] = []
    for module_key, entries in data.items():
        pages = [
            {
                "file": e["file"],
                "path": f"guides/{module_key}/{e['file']}".replace("\\", "/"),
                "title": e["title"],
            }
            for e in entries
        ]
        how_to_path = f"guides/{module_key}/01-how-to-use.md"
        if not any(p["file"] == "01-how-to-use.md" for p in pages):
            pages.insert(
                0,
                {
                    "file": "01-how-to-use.md",
                    "path": how_to_path,
                    "title": f"{module_key.split('/')[-1].replace('-', ' ').title()} — quick start",
                },
            )
        modules.append(
            {
                "module": module_key,
                "module_title": module_key.split("/")[-1].replace("-", " ").title(),
                "index_path": f"guides/{module_key}/INDEX.md",
                "pages": pages,
            }
        )
    return modules


def main() -> None:
    modules: dict[str, dict] = {}

    for index_path in sorted((ROOT / "guides").rglob("INDEX.md")):
        mod = parse_index_md(index_path)
        modules[mod["module"]] = mod

    for mod in from_manifest():
        key = mod["module"]
        if key not in modules:
            modules[key] = mod
        else:
            existing_files = {p["file"] for p in modules[key]["pages"]}
            for p in mod["pages"]:
                if p["file"] not in existing_files:
                    modules[key]["pages"].append(p)

    all_pages = []
    for mod in sorted(modules.values(), key=lambda m: m["module"]):
        for p in mod["pages"]:
            all_pages.append({**p, "module": mod["module"], "module_title": mod["module_title"]})

    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source": ["guides/**/INDEX.md", "scripts/SUBTOPIC-MANIFEST.json"],
        "module_count": len(modules),
        "page_count": len(all_pages),
        "modules": sorted(modules.values(), key=lambda m: m["module"]),
        "pages": all_pages,
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote {OUT.relative_to(ROOT)} — {payload['module_count']} modules, {payload['page_count']} pages")


if __name__ == "__main__":
    main()
