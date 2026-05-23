#!/usr/bin/env python3
"""Build deck-changelog.json from git history mapped to observation deck node labels."""
from __future__ import annotations

import json
import re
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BRIEFS = ROOT / "assets" / "deck-briefs.json"
OUT = ROOT / "assets" / "deck-changelog.json"

# Map path prefixes to deck node labels (longest match wins)
DIR_TO_LABELS: dict[str, list[str]] = {}


def load_briefs() -> None:
    data = json.loads(BRIEFS.read_text(encoding="utf-8"))
    for label, meta in data.items():
        d = (meta.get("dir") or "").replace("\\", "/").strip("/")
        if not d:
            continue
        DIR_TO_LABELS.setdefault(d, []).append(label)


def labels_for_path(path: str) -> list[str]:
    path = path.replace("\\", "/")
    hits: list[str] = []
    for prefix, labels in DIR_TO_LABELS.items():
        if path.startswith(prefix + "/") or path == prefix:
            hits.extend(labels)
    if not hits and path.startswith("guides/"):
        parts = path.split("/")
        if len(parts) >= 3:
            mod = parts[1] + "/" + parts[2]
            for prefix, labels in DIR_TO_LABELS.items():
                if prefix.startswith("guides/") and mod in prefix:
                    hits.extend(labels)
    if not hits and path.startswith("pentests/"):
        hits.extend(DIR_TO_LABELS.get("pentests/", []))
    return list(dict.fromkeys(hits))


def git_log(limit: int = 400) -> list[dict]:
    fmt = "%H%x00%aI%x00%s"
    try:
        out = subprocess.check_output(
            ["git", "log", f"-{limit}", f"--pretty=format:{fmt}", "--", "docs/", "guides/", "pentests/"],
            cwd=ROOT,
            text=True,
            encoding="utf-8",
            errors="replace",
        )
    except (subprocess.CalledProcessError, FileNotFoundError):
        return []
    entries = []
    for line in out.strip().splitlines():
        if not line.strip():
            continue
        parts = line.split("\x00", 2)
        if len(parts) < 3:
            continue
        sha, date_iso, subject = parts[0], parts[1], parts[2]
        entries.append({"sha": sha[:8], "date": date_iso, "subject": subject})
    return entries


def git_files_for_commit(sha: str) -> list[str]:
    try:
        out = subprocess.check_output(
            ["git", "show", "--name-only", "--pretty=format:", sha],
            cwd=ROOT,
            text=True,
            encoding="utf-8",
            errors="replace",
        )
    except subprocess.CalledProcessError:
        return []
    return [ln.strip().replace("\\", "/") for ln in out.splitlines() if ln.strip().endswith(".md")]


def recency_score(date_iso: str) -> float:
    try:
        dt = datetime.fromisoformat(date_iso.replace("Z", "+00:00"))
    except ValueError:
        return 0.2
    days = (datetime.now(timezone.utc) - dt.astimezone(timezone.utc)).days
    if days <= 7:
        return 1.0
    if days <= 30:
        return 0.75
    if days <= 90:
        return 0.45
    if days <= 180:
        return 0.25
    return 0.1


def build() -> dict:
    load_briefs()
    node_changes: dict[str, dict] = {}
    log = git_log()
    for entry in log:
        files = git_files_for_commit(entry["sha"])
        touched: set[str] = set()
        for fp in files:
            touched.update(labels_for_path(fp))
        for label in touched:
            rec = node_changes.setdefault(
                label,
                {"label": label, "date": entry["date"], "summary": entry["subject"], "sha": entry["sha"], "recency": 0.0},
            )
            score = recency_score(entry["date"])
            if score >= rec["recency"]:
                rec["date"] = entry["date"]
                rec["summary"] = entry["subject"]
                rec["sha"] = entry["sha"]
                rec["recency"] = score
            elif entry["subject"] not in rec.get("summary", ""):
                rec["summary"] = (rec["summary"][:120] + " · " + entry["subject"])[:220]

    all_labels = json.loads(BRIEFS.read_text(encoding="utf-8")).keys()
    for label in all_labels:
        if label not in node_changes:
            node_changes[label] = {
                "label": label,
                "date": "2024-09-01T00:00:00Z",
                "summary": "No recent edits in tracked doc paths.",
                "sha": "",
                "recency": 0.08,
            }

    return {
        "generated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "nodes": node_changes,
    }


def main() -> None:
    data = build()
    OUT.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {OUT} ({len(data['nodes'])} nodes)")


if __name__ == "__main__":
    main()
