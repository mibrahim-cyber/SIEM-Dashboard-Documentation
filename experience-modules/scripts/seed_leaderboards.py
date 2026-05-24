#!/usr/bin/env python3
"""Generate seed leaderboard JSON files for GitHub static sync."""
from __future__ import annotations
import json
from pathlib import Path

MOD = Path(__file__).resolve().parents[1]
LB = MOD / "leaderboards"

GAMES = [
    "the_terminal", "the_breach", "the_ghost_network", "the_cipher", "the_simulation",
    "the_interrogation_room", "the_forge", "the_deep_archive", "the_heist", "the_lab",
    "the_cartography", "the_memorial", "the_resonance",
]

SEED_NAMES = ["GhostAnalyst", "Meridian7", "SOC_Ninja", "PacketHunter", "RuleSmith"]


def main() -> None:
    LB.mkdir(parents=True, exist_ok=True)
    for gid in GAMES:
        fname = f"{gid}-speedTrial-any.json"
        entries = [
            {
                "score": 950 - (i * 40),
                "playerName": SEED_NAMES[i % len(SEED_NAMES)],
                "date": "2026-05-2" + str(i % 4),
                "storyPath": "any",
                "skillChallenge": "speedTrial",
            }
            for i in range(5)
        ]
        (LB / fname).write_text(
            json.dumps({"gameId": gid, "challengeId": "speedTrial", "storyPath": "any", "entries": entries}, indent=2),
            encoding="utf-8",
        )
        print(f"Wrote {fname}")


if __name__ == "__main__":
    main()
