#!/usr/bin/env python3
"""Inject Dio guide + narrative engine into all HTML pages."""
from __future__ import annotations
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
HTML_FILES = list(REPO.rglob("*.html"))

DIO_CSS = '<link rel="stylesheet" href="{base}dio-guide.css" />'
DIO_SCRIPTS = '''<script src="{base}narrative-engine.js"></script>
<script src="{base}dio-guide.js"></script>'''


def base_path(html: Path) -> str:
    rel = html.parent.relative_to(REPO)
    parts = len(rel.parts)
    if parts == 0:
        return "experience-modules/shared/"
    prefix = "../" * parts
    return prefix + "experience-modules/shared/"


def inject(html: Path) -> bool:
    text = html.read_text(encoding="utf-8")
    if "dio-guide.js" in text:
        return False
    base = base_path(html)
    css = DIO_CSS.format(base=base)
    scripts = DIO_SCRIPTS.format(base=base)
    if "</head>" in text:
        text = text.replace("</head>", "  " + css + "\n</head>", 1)
    if "</body>" in text:
        text = text.replace("</body>", "  " + scripts + "\n</body>", 1)
    else:
        text += "\n" + scripts
    html.write_text(text, encoding="utf-8")
    return True


def main() -> None:
    n = 0
    for h in HTML_FILES:
        if "node_modules" in str(h):
            continue
        if inject(h):
            print("Injected", h.relative_to(REPO))
            n += 1
    print(f"Done: {n} files updated")


if __name__ == "__main__":
    main()
