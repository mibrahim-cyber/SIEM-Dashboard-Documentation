#!/usr/bin/env python3
"""Merge exported pending leaderboard JSON into repo board files."""
from __future__ import annotations
import json
import sys
from pathlib import Path

MOD = Path(__file__).resolve().parents[1]
LB = MOD / "leaderboards"
MAX = 10


def merge_entries(a: list, b: list) -> list:
    combined = (a or []) + (b or [])
    combined.sort(key=lambda x: x.get("score", 0), reverse=True)
    seen = set()
    out = []
    for e in combined:
        k = (e.get("playerName"), e.get("score"), e.get("date"))
        if k in seen:
            continue
        seen.add(k)
        out.append(e)
    return out[:MAX]


def main() -> int:
    if len(sys.argv) < 2:
        print("Usage: python sync_leaderboards.py export.json")
        return 1
    export_path = Path(sys.argv[1])
    data = json.loads(export_path.read_text(encoding="utf-8"))
    pending = data.get("pending") or []
    for item in pending:
        gid = item["gameId"]
        cid = item["challengeId"]
        sp = item.get("storyPath") or "any"
        fname = LB / f"{gid}-{cid}-{sp}.json"
        existing = {"entries": []}
        if fname.is_file():
            existing = json.loads(fname.read_text(encoding="utf-8"))
        merged = merge_entries(existing.get("entries"), [item["entry"]])
        out = {"gameId": gid, "challengeId": cid, "storyPath": sp, "entries": merged}
        fname.write_text(json.dumps(out, indent=2), encoding="utf-8")
        print(f"Updated {fname.name} ({len(merged)} entries)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
