#!/usr/bin/env python3
"""Remove decorative emojis from documentation; keep UI symbols in bold labels."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

HEADING_Q = re.compile(r"^(#{1,6})\s*❓\s*", re.MULTILINE)
# Decorative section markers only (not ▶ ⏸ ✓ ⚠ which mirror UI text)
DECORATIVE = [
    "\u2753",  # ❓
    "\u2b05\ufe0f",  # ⬅️
    "\u2b05",  # ⬅
    "\U0001f4ca",  # 📊
    "\U0001f4cb",  # 📋
    "\U0001f4c1",  # 📁
    "\U0001f9ea",  # 🧪
    "\U0001f4c5",  # 📅 calendar (if any)
    "\U0001f680",  # 🚀
    "\u2728",  # ✨
    "\U0001f525",  # 🔥
    "\U0001f4a1",  # 💡
    "\U0001f6e1\ufe0f",  # 🛡️
    "\U0001f50d",  # 🔍
    "\u26a1",  # ⚡
    "\u2705",  # ✅
]

def strip_decorative(text: str) -> str:
    text = HEADING_Q.sub(r"\1 ", text)
    for ch in DECORATIVE:
        text = text.replace(ch, "")
    # collapse double spaces left after emoji removal (not newlines)
    text = re.sub(r" {2,}", " ", text)
    text = re.sub(r" +([,.;:])", r"\1", text)
    return text

changed = 0
total_q = 0
for fp in ROOT.rglob("*.md"):
    if "__pycache__" in str(fp):
        continue
    orig = fp.read_text(encoding="utf-8")
    new = strip_decorative(orig)
    if new != orig:
        total_q += orig.count("❓") - new.count("❓")
        fp.write_text(new, encoding="utf-8")
        changed += 1

# index.html / README decorative nav emoji
for fp in [ROOT / "README.md", ROOT / "guides" / "README.md", ROOT / "index.html"]:
    if not fp.exists():
        continue
    orig = fp.read_text(encoding="utf-8")
    new = strip_decorative(orig)
    if new != orig:
        fp.write_text(new, encoding="utf-8")
        changed += 1

print(f"cleaned {changed} files")
