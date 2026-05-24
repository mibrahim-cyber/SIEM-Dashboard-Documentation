#!/usr/bin/env python3
"""Apply per-game accent colours to styles.css"""
from pathlib import Path

MOD = Path(__file__).resolve().parents[1]

THEMES = {
    "game1-terminal": ("#030a04", "#39ff14"),
    "game2-breach": ("#120608", "#ff4444"),
    "game3-network": ("#020818", "#38bdf8"),
    "game4-cipher": ("#0d0a04", "#f5e642"),
    "game5-simulation": ("#080412", "#a855f7"),
    "game6-intercept": ("#040c08", "#10b981"),
    "game7-forge": ("#100804", "#f97316"),
    "game8-archive": ("#04080c", "#93c5fd"),
    "game9-heist": ("#0a0a04", "#eab308"),
    "game10-lab": ("#04100a", "#4ade80"),
    "game11-cartography": ("#040816", "#818cf8"),
    "game12-memorial": ("#080408", "#c084fc"),
    "game13-resonance": ("#040c0c", "#2dd4bf"),
}

TEMPLATE = """:root {{
  --bg: {bg};
  --accent: {accent};
  --accent-dim: {accent}55;
}}
html, body {{ background: var(--bg); }}
"""

for folder, (bg, accent) in THEMES.items():
    p = MOD / folder / "styles.css"
    p.write_text(TEMPLATE.format(bg=bg, accent=accent), encoding="utf-8")
    print("Updated", p)
