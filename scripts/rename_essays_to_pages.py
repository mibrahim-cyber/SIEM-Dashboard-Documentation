#!/usr/bin/env python3
"""Replace essay terminology with pages; bump INDEX counts to include 01-how-to-use."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GUIDES = ROOT / "guides"

INDEX_COUNT = re.compile(r"INDEX — (\d+) essays?", re.IGNORECASE)
LISTS_ALL = re.compile(r"lists all (\d+) essays?", re.IGNORECASE)


def convert_index_count(m: re.Match) -> str:
    n = int(m.group(1))
    return f"INDEX — {n + 1} pages"


def convert_lists_all(m: re.Match) -> str:
    n = int(m.group(1))
    return f"lists all {n + 1} pages"


def convert_text(text: str) -> str:
    text = INDEX_COUNT.sub(convert_index_count, text)
    text = LISTS_ALL.sub(convert_lists_all, text)
    text = text.replace("Detailed essays", "Detailed pages")
    text = text.replace("detailed essays", "detailed pages")
    text = text.replace("Each essay below", "Each page below")
    text = text.replace("each essay below", "each page below")
    text = text.replace("per-topic detailed essays", "per-topic detailed pages")
    text = text.replace("deep-dive_essays-190", "detailed_pages-217")
    text = text.replace("Essays", "Pages")
    text = text.replace("Essay index", "Page index")
    text = text.replace("essay index", "page index")
    text = text.replace("all essays in that module", "all pages in that module")
    text = text.replace("One standalone essay per sub-topic", "One standalone page per sub-topic")
    text = text.replace("standalone essay", "standalone page")
    text = re.sub(r"\bessays\b", "pages", text)
    text = re.sub(r"\bEssays\b", "Pages", text)
    text = re.sub(r"\bessay\b", "page", text)
    text = re.sub(r"\bEssay\b", "Page", text)
    # YAML front matter key
    text = re.sub(r"^page: ", "page: ", text, flags=re.MULTILINE)
    return text


changed = 0
for fp in ROOT.rglob("*.md"):
    if "__pycache__" in str(fp):
        continue
    orig = fp.read_text(encoding="utf-8")
    new = convert_text(orig)
    if new != orig:
        fp.write_text(new, encoding="utf-8")
        changed += 1

print(f"updated {changed} markdown files")
