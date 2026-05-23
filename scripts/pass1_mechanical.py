#!/usr/bin/env python3
"""Pass-1 mechanical humanisation: audience, essay keys, INDEX, images, em-dashes, ban words."""
from __future__ import annotations

import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPTS))

from humanize_lib import WORD_REPLACEMENTS, clean_front_matter, humanize as lib_humanize  # noqa: E402

EM = "\u2014"
RAW = re.compile(
    r"https://raw\.githubusercontent\.com/Number-1-Python-Glazer/SIEM-Dashboard-Documentation/main/"
)
UI_LABEL = re.compile(
    r"(\*\*[A-Z0-9][A-Z0-9 /\-]*\*\*|\`[A-Z0-9][A-Z0-9 /\-]*\`|"
    r"[A-Z][A-Z0-9 /\-]{3,})\s*"
    + re.escape(EM)
    + r"\s*"
    + r"(\*\*[A-Z0-9][A-Z0-9 /\-]*\*\*|\`[A-Z0-9][A-Z0-9 /\-]*\`|[A-Z][A-Z0-9 /\-]{3,})"
)
TABLE_EM = re.compile(r"\|\s*" + re.escape(EM) + r"\s*\|")
ALT_PUNCT = [", ", "; ", ": ", ". "]


def rel_path(from_file: Path, asset: str) -> str:
    target = ROOT / asset.replace("\\", "/")
    return Path(os.path.relpath(target, from_file.parent)).as_posix()


def fix_front_matter(text: str) -> str:
    if not text.startswith("---"):
        return text
    end = text.find("---", 3)
    if end == -1:
        return text
    fm_lines = text[3:end].strip().splitlines()
    body = text[end + 3 :]
    kept: list[str] = []
    for line in fm_lines:
        if line.strip().startswith("audience:"):
            continue
        if line.strip().startswith("essay:"):
            kept.append("page:" + line.split(":", 1)[1])
            continue
        kept.append(line)
    if not kept:
        return body.lstrip()
    return "---\n" + "\n".join(kept) + "\n---" + body


def fix_index(text: str) -> str:
    text = text.replace("## Deep-dive essays", "## Detailed pages")
    text = text.replace("## Deep-dive pages", "## Detailed pages")
    text = re.sub(
        r"Each essay below is a standalone deep dive \(800\+ words\) for one concept within this module\.",
        "Each page below is a standalone detailed look (800+ words) for one concept within this module.",
        text,
    )
    text = re.sub(
        r"Each page below is a standalone deep dive \(800\+ words\) for one concept within this module\.",
        "Each page below is a standalone detailed look (800+ words) for one concept within this module.",
        text,
    )
    return text


def fix_images(text: str, fp: Path) -> str:
    def sub_url(m: re.Match) -> str:
        asset = m.group(0).split("/main/", 1)[-1].split("?")[0]
        return rel_path(fp, asset)

    return RAW.sub(sub_url, text)


def is_protected_emdash(text: str, pos: int) -> bool:
    start = max(0, pos - 80)
    end = min(len(text), pos + 80)
    window = text[start:end]
    local = pos - start
    if TABLE_EM.search(window):
        return True
    for m in UI_LABEL.finditer(window):
        if m.start() <= local <= m.end():
            return True
    before = text[max(0, pos - 30) : pos]
    after = text[pos + 1 : pos + 31]
    if re.search(r"\*\*[A-Z0-9 /\-]+$", before) and re.search(r"^[A-Z0-9 /\-]+\*\*", after):
        return True
    if re.search(r"^#{1,4} .+" + re.escape(EM), text[max(0, pos - 40) : pos + 5]):
        return True
    return False


def reduce_em_dashes(text: str, max_keep: int = 2) -> str:
    positions = [i for i, ch in enumerate(text) if ch == EM or ch == "—"]
    if len(positions) <= max_keep:
        return text

    protected = {p for p in positions if is_protected_emdash(text, p)}
    keep = set(sorted(protected)[:max_keep])
    if len(keep) < max_keep:
        for p in positions:
            if p not in keep:
                keep.add(p)
            if len(keep) >= max_keep:
                break

    alt_idx = 0
    out: list[str] = []
    for i, ch in enumerate(text):
        if ch != EM and ch != "—":
            out.append(ch)
            continue
        if i in keep:
            out.append(EM)
        else:
            out.append(ALT_PUNCT[alt_idx % len(ALT_PUNCT)])
            alt_idx += 1

    result = "".join(out)
    result = re.sub(r"\s+,", ",", result)
    result = re.sub(r"\s+;", ";", result)
    result = re.sub(r"\.\s+\.", ".", result)
    return result


def apply_word_replacements(text: str) -> str:
    for pat, repl in WORD_REPLACEMENTS:
        text = re.sub(pat, repl, text)
    text = re.sub(r"^[ \t]+,", "", text, flags=re.MULTILINE)
    text = re.sub(r"\.\s+\.", ".", text)
    return text


def strip_emoji_headings(text: str) -> str:
    text = re.sub(r"^####\s*❓\s*", "#### ", text, flags=re.MULTILINE)
    text = re.sub(r"^###\s*❓\s*", "### ", text, flags=re.MULTILINE)
    return text


def process_file(fp: Path) -> bool:
    orig = fp.read_text(encoding="utf-8")
    text = fix_front_matter(orig)
    text = fix_images(text, fp)
    if fp.name == "INDEX.md":
        text = fix_index(text)
    text = strip_emoji_headings(text)
    text = apply_word_replacements(text)
    text = reduce_em_dashes(text, max_keep=2)
    text = text.rstrip() + "\n"
    if text != orig:
        fp.write_text(text, encoding="utf-8")
        return True
    return False


def collect_files() -> list[Path]:
    files: list[Path] = []
    for sub in ("guides", "docs", "pentests"):
        d = ROOT / sub
        if d.exists():
            files.extend(sorted(d.rglob("*.md")))
    for name in ("README.md",):
        p = ROOT / name
        if p.exists():
            files.append(p)
    return files


def main() -> None:
    changed = 0
    for fp in collect_files():
        if process_file(fp):
            changed += 1
    print(f"pass1_mechanical changed={changed}")


if __name__ == "__main__":
    main()
