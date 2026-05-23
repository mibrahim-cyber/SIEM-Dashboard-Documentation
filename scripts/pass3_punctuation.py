#!/usr/bin/env python3
"""Pass-3: fix remaining em-dash artifact punctuation."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

REPLACEMENTS = [
    (r"` \. narrow", "` to narrow"),
    (r"above 5 \. quick", "above 5: quick"),
    (r"windowSec` field \(default 60\), which is not executed by engine in demo\.", "windowSec` field (default 60), which is not executed by engine in demo."),
    (r"`correlationEngine\.js` \. separate", "`correlationEngine.js`; separate"),
    (r"clears `focusTime` \. deliberate", "clears `focusTime`; deliberate"),
    (r"RULES ACTIVE` \. confirm", "RULES ACTIVE`; confirm"),
    (r"\*\*HOW RULES WORK\*\* \. internalise", "**HOW RULES WORK** to internalise"),
    (r"criticality 3 \. same", "criticality 3; same"),
    (r"\*\*GROUP: IP\*\* \. confirm", "**GROUP: IP** to confirm"),
    (r"\*\*GROUP: IP\*\* \. compare", "**GROUP: IP** to compare"),
    (r"alert JSON \. inspect", "alert JSON; inspect"),
    (r"\*\*RES\*\* \. human", "**RES**; human"),
    (r"Overview feed : typically", "Overview feed: typically"),
    (r"alert ID \. tier2", "alert ID; tier2 continues"),
    (r"`203\.0` \. narrow", "`203.0` to narrow"),
    (r"Not in UI \. formula", "Not in UI; formula"),
    (r"`canAdmin` \. tier3", "`canAdmin` (tier3"),
    (r"\*\*CRITICAL\*\* \. page", "**CRITICAL**: page"),
    (r"\*\*LOW\*\* : batch", "**LOW**: batch"),
    (r"TimeString` \. bucket", "TimeString`; bucket"),
    (r"clock times, less readable", "clock times; less readable"),
    (r"Threshold to 5 \. emulating", "Threshold to 5, emulating"),
    (r"satisfying conditions : noisy", "satisfying conditions; noisy"),
    (r"`Date\.now\(\)` \. dwell", "`Date.now()`; dwell"),
    (r"// TOP ATTACKERS \. three", "// TOP ATTACKERS; three"),
    (r"right : stats", "right; stats"),
    (r"Health\.jsx` \. not", "Health.jsx`; not"),
    (r"Log4Shell\) \. max", "Log4Shell); max"),
    (r"`isBlocked` \. block", "`isBlocked`; block"),
    (r"\*\*TOP ATTACKERS\*\* \. confirm", "**TOP ATTACKERS** to confirm"),
    (r"concentrate\?\" : executive", "concentrate?\"; executive"),
    (r"correlateAlerts\(alerts\)\. the same", "correlateAlerts(alerts), the same"),
    (r"KPI tile\. only CRITICAL", "KPI tile; only CRITICAL"),
    (r"numbers; \*\*MTTR\*\* fixed at `12` minutes and FALSE POS % at `8`: are", "numbers: **MTTR** fixed at `12` minutes and FALSE POS % at `8` are"),
    (r"HTTP 200;  any", "HTTP 200; any"),
    (r"403;  RBAC", "403; RBAC"),
]

TOPIC_CASE = {
    "ip geolocation": "IP geolocation",
    "ip diversity": "IP diversity",
    "ueba": "UEBA",
    "geo map": "Geo Map",
    "network map": "Network Map",
    "heatmap calendar": "Heatmap Calendar",
    "threat hunt": "Threat Hunt",
    "event graph": "Event Graph",
    "impossible travel": "impossible travel",
    "lateral movement visual": "lateral movement on the network map",
    "external connections": "external connections",
    "subnet grouping": "subnet grouping",
    "normal vs anomalous": "normal vs anomalous traffic",
    "baselining": "baselining",
    "risk score": "risk score",
    "insider threat": "insider threat",
    "entity behaviour": "entity behaviour",
    "false positive management": "false-positive management",
    "ueba and compliance": "UEBA and compliance",
    "time based attack patterns": "time-based attack patterns",
    "reading the calendar": "reading the calendar",
    "layering metrics": "layering metrics",
    "slow burn attacks": "slow-burn attacks",
    "shift handover": "shift handover",
    "heatmap concept": "heatmap concept",
    "geo map during ddos": "Geo Map during DDoS",
    "country threat context": "country threat context",
    "isp asn column": "ISP/ASN column",
    "geo map visual elements": "Geo Map visual elements",
    "documenting a hunt": "documenting a hunt",
    "saving scheduling hunts": "saving and scheduling hunts",
    "graph filtering": "graph filtering",
    "click through to logs": "click-through to logs",
}


def titlecase_topic(topic: str) -> str:
    t = topic.lower()
    if t in TOPIC_CASE:
        return TOPIC_CASE[t]
    return topic.title()


def process_text(text: str) -> str:
    for pat, repl in REPLACEMENTS:
        text = re.sub(pat, repl, text)
    # Generic: backtick/code followed by " . verb" → "; verb" or " to verb"
    text = re.sub(r"(`[^`]+`) \. ([a-z])", r"\1; \2", text)
    # Bold label followed by " . "
    text = re.sub(r"(\*\*[^*]+\*\*) \. ([a-z])", r"\1; \2", text)
    # Fix topic case in generated headings
    for raw, fixed in TOPIC_CASE.items():
        text = re.sub(rf"\b{re.escape(raw)}\b", fixed, text, flags=re.IGNORECASE)
    return text


def main() -> None:
    changed = 0
    for sub in ("guides", "docs", "pentests"):
        d = ROOT / sub
        if not d.exists():
            continue
        for fp in sorted(d.rglob("*.md")):
            orig = fp.read_text(encoding="utf-8")
            text = process_text(orig).rstrip() + "\n"
            if text != orig:
                fp.write_text(text, encoding="utf-8")
                changed += 1
    print(f"pass3_punctuation changed={changed}")


if __name__ == "__main__":
    main()
