#!/usr/bin/env python3
"""Optimize SIEM dashboard guide markdown without losing information."""
from __future__ import annotations

import re
from difflib import SequenceMatcher
from pathlib import Path

GUIDES = Path(__file__).resolve().parent / "guides"

AG_SECTIONS = [
    "What you are looking at",
    "What is happening underneath",
    "Why this matters",
    "Step-by-step walkthrough",
    "Common questions",
    "How an analyst uses this during an active incident",
    "How an analyst uses this during active incident",
    "Edge cases and gotchas",
]

BOILERPLATE_HDR = re.compile(
    r"^#{2,4}\s+(?:Supplemental implementation notes|Additional analyst guidance|"
    r"Additional guidance|Extended operational context(?:\s+for\s+.+)?|"
    r"Extended context(?:\s+for\s+.+)?)\s*$",
    re.MULTILINE | re.IGNORECASE,
)

SECTION_HDR = re.compile(
    r"^(?:\*\*(.+?)\*\*|###\s+(.+?))\s*$",
    re.MULTILINE,
)

FLUFF = (
    "Summary slide for training deck:",
    "Training deck one-liner:",
    "Correlation vocabulary quiz",
    "Industry vocabulary precision:",
    "Vocabulary split:",
    "For non-technical readers, correlation simply",
    "Onboarding quiz:",
    "Plain-language recap:",
)
TIGHTEN = [
    (r"\bin order to\b", "to"),
    (r"\bdue to the fact that\b", "because"),
    (r"\bfor the purpose of\b", "to"),
    (r"\bin the event that\b", "if"),
    (r"\bit is important to note that\b", ""),
    (r"\bit should be noted that\b", ""),
    (r"\bas a matter of fact,\s*", ""),
    (r"\bin other words,\s*", ""),
    (r"\bthat being said,\s*", ""),
    (r"\bneedless to say,\s*", ""),
]


def split_fm(text: str) -> tuple[str, str]:
    m = re.match(r"^(---\n.*?\n---\n)", text, re.DOTALL)
    return (m.group(1), text[m.end() :]) if m else ("", text)


def wc(text: str) -> int:
    _, body = split_fm(text)
    return len(body.split())


def norm(s: str) -> str:
    s = re.sub(r"[*_`#\[\]()❓>]", "", s.lower())
    return re.sub(r"\s+", " ", s).strip()


def word_set(s: str) -> set[str]:
    return set(re.findall(r"[a-z0-9]{3,}", norm(s)))


def jaccard(a: str, b: str) -> float:
    sa, sb = word_set(a), word_set(b)
    if not sa or not sb:
        return 0.0
    return len(sa & sb) / len(sa | sb)


def is_dup(a: str, b: str, thr: float = 0.72) -> bool:
    if jaccard(a, b) >= thr:
        return True
    na, nb = norm(a), norm(b)
    if len(na) > 40 and (na in nb or nb in na):
        return True
    return SequenceMatcher(None, na, nb).ratio() >= 0.82


def dup_of_corpus(para: str, corpus: str, thr: float = 0.72) -> bool:
    para = para.strip()
    if not para or len(para.split()) < 5:
        return True
    for chunk in re.split(r"\n\n+", corpus):
        chunk = chunk.strip()
        if len(chunk.split()) >= 5 and is_dup(para, chunk, thr):
            return True
    return False


def classify_target(para: str) -> str:
    low = para.lower()
    if any(x in low for x in ("jsx", "usememo", "usestate", "engineer", "integration point", "recomputes", "component")):
        return "What is happening underneath"
    if any(x in low for x in ("analyst", "before clicking", "operationalise", "procedure", "runbook", "shift handover", "during active")):
        if "How an analyst uses this during an active incident" in AG_SECTIONS:
            return "How an analyst uses this during an active incident"
        return "How an analyst uses this during active incident"
    return "Edge cases and gotchas"


def parse_sections(body: str) -> tuple[str, dict[str, str], str]:
    """Return preamble, ag_sections dict, tail_after_ag."""
    first_ag = None
    for sec in AG_SECTIONS:
        for pat in (rf"\*\*{re.escape(sec)}\*\*", rf"^### {re.escape(sec)}\s*$"):
            m = re.search(pat, body, re.MULTILINE)
            if m and (first_ag is None or m.start() < first_ag):
                first_ag = m.start()
    if first_ag is None:
        return body, {}, ""

    preamble = body[:first_ag].rstrip()
    rest = body[first_ag:]

    # cut boilerplate from rest
    bm = BOILERPLATE_HDR.search(rest)
    ag_text = rest[: bm.start()].rstrip() if bm else rest.rstrip()
    boilerplate = rest[bm.start() :].strip() if bm else ""

    sections: dict[str, str] = {}
    matches = list(SECTION_HDR.finditer(ag_text))
    for i, m in enumerate(matches):
        name = (m.group(1) or m.group(2)).strip()
        start = m.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(ag_text)
        content = ag_text[start:end].strip()
        if name in sections:
            sections[name] = (sections[name] + "\n\n" + content).strip()
        else:
            sections[name] = content

    return preamble, sections, boilerplate


def boilerplate_paragraphs(boiler: str) -> list[str]:
    if not boiler:
        return []
    text = BOILERPLATE_HDR.sub("", boiler)
    text = re.sub(r"\n####\s+[^\n]+\n", "\n\n", text)
    paras: list[str] = []
    seen: list[str] = []
    for p in re.split(r"\n\n+", text.strip()):
        p = p.strip()
        if not p or p.startswith(">"):
            continue
        if any(dup_of_corpus(p, s) for s in seen):
            continue
        seen.append(p)
        paras.append(p)
    return paras


def merge_boilerplate(sections: dict[str, str], boiler: str) -> int:
    merged = 0
    corpus = "\n\n".join(sections.values())
    for para in boilerplate_paragraphs(boiler):
        if dup_of_corpus(para, corpus):
            continue
        target = classify_target(para)
        if target not in sections:
            # alias active incident naming
            for k in sections:
                if "analyst uses" in k.lower() and "analyst" in target.lower():
                    target = k
                    break
            else:
                target = "Edge cases and gotchas"
        sections[target] = (sections.get(target, "") + "\n\n" + para).strip()
        corpus += "\n\n" + para
        merged += 1
    return merged


def trim_edge_fluff(sections: dict[str, str]) -> None:
    key = next((k for k in sections if k.startswith("Edge cases")), None)
    if not key:
        return
    corpus = "\n\n".join(v for k, v in sections.items() if k != key)
    paras = [p.strip() for p in re.split(r"\n\n+", sections[key]) if p.strip()]
    kept = []
    fluff_additions: dict[str, list[str]] = {}
    for p in paras:
        if any(p.startswith(f) for f in FLUFF):
            unique_sents = [s for s in sentences(p) if not dup_of_corpus(s, corpus, 0.68)]
            for s in unique_sents:
                target = classify_target(s)
                fluff_additions.setdefault(target, []).append(s)
                corpus += "\n\n" + s
            continue
        if len(p.split()) > 30 and dup_of_corpus(p, corpus, 0.64):
            continue
        kept.append(p)
    sections[key] = "\n\n".join(kept)
    for target, sents in fluff_additions.items():
        resolved = target
        if resolved not in sections:
            for k in sections:
                if "analyst uses" in k.lower() and "analyst" in target.lower():
                    resolved = k
                    break
            else:
                resolved = key
        sections[resolved] = (sections.get(resolved, "") + "\n\n" + "\n\n".join(sents)).strip()


def sentences(text: str) -> list[str]:
    parts = re.split(r"(?<=[.!?])\s+(?=[A-Z`\"(])", text.strip())
    return [p.strip() for p in parts if len(p.split()) >= 4]


def dedupe_section_content(sections: dict[str, str]) -> None:
    for k, v in list(sections.items()):
        paras = [p.strip() for p in re.split(r"\n\n+", v) if p.strip()]
        kept, seen = [], []
        for p in paras:
            if any(is_dup(p, s) for s in seen):
                continue
            seen.append(p)
            kept.append(p)
        sections[k] = "\n\n".join(kept)


def clean_cross_section_dupes(sections: dict[str, str]) -> None:
    order = [s for s in AG_SECTIONS if s in sections] + [s for s in sections if s not in AG_SECTIONS]
    prior = ""
    for sec in order:
        paras = [p.strip() for p in re.split(r"\n\n+", sections.get(sec, "")) if p.strip()]
        thr = 0.52 if sec.startswith("Edge cases") else 0.64
        kept = []
        for p in paras:
            if prior and dup_of_corpus(p, prior, thr):
                continue
            kept.append(p)
        sections[sec] = "\n\n".join(kept)
        if kept:
            prior = prior + "\n\n" + sections[sec] if prior else sections[sec]


def section_format(body: str) -> str:
    if re.search(r"^\*\*What you are looking at\*\*", body, re.MULTILINE):
        return "bold"
    return "hash"


def rebuild(preamble: str, sections: dict[str, str], fmt: str) -> str:
    order = []
    for sec in AG_SECTIONS:
        if sec in sections:
            order.append(sec)
    for sec in sections:
        if sec not in order:
            order.append(sec)

    parts = [preamble.rstrip()] if preamble.strip() else []
    for sec in order:
        content = sections[sec].strip()
        if not content:
            continue
        if fmt == "bold":
            parts.append(f"**{sec}**\n\n{content}")
        else:
            parts.append(f"### {sec}\n\n{content}")
    return "\n\n".join(parts).rstrip() + "\n"


def trim_hr(body: str) -> str:
    body = re.sub(r"(\*\*One-sentence focus:\*\*[^\n]+)\n---\n", r"\1\n\n", body)
    body = re.sub(r"(\*\*One-sentence purpose:\*\*[^\n]+)\n---\n", r"\1\n\n", body)
    body = re.sub(r"\n---\n(\n(?:\*\*|### |!))", r"\n\n\1", body)
    body = re.sub(r"\n---\s*\n\s*$", "\n", body)
    body = re.sub(r"(\n---\n){2,}", "\n\n", body)
    return body


def remove_dup_h2(body: str) -> str:
    m = re.match(r"(# [^\n]+)\n\n(## [^\n]+)\n", body)
    if not m:
        return body
    h1 = re.sub(r"^#\s+", "", m.group(1)).strip().lower()
    h2 = re.sub(r"^##\s+", "", m.group(2)).strip().lower()
    if h1 == h2 or h1 in h2 or h2 in h1:
        return body.replace(m.group(2) + "\n", "", 1)
    return body


def trim_bold(line: str) -> str:
    if line.startswith("#") or line.startswith("!") or line.startswith("|") or line.startswith(">"):
        return line
    if "**Part of:**" in line or "**One-sentence" in line or "**Sidebar" in line:
        return line

    def repl(m: re.Match) -> str:
        inner = m.group(1)
        if inner in AG_SECTIONS:
            return m.group(0)
        if re.match(r"^[A-Z0-9][A-Z0-9 /→&+:\-]{1,}$", inner):
            return m.group(0)
        if re.match(r"^[▶+✕]", inner):
            return m.group(0)
        if "`" in inner or inner.startswith("Technical note"):
            return m.group(0)
        return inner

    return re.sub(r"\*\*([^*\n]+?)\*\*", repl, line)


def tighten(body: str) -> str:
    for pat, repl in TIGHTEN:
        body = re.sub(pat, repl, body, flags=re.IGNORECASE)
    body = re.sub(r" +([,.;:])", r"\1", body)
    body = re.sub(r"\n{4,}", "\n\n\n", body)
    return body


def optimize_index_or_readme(text: str) -> str:
    _, body = split_fm(text)
    body = trim_hr(body)
    body = remove_dup_h2(body)
    body = tighten(body)
    fm, _ = split_fm(text)
    return fm + body.rstrip() + "\n"


def optimize_howto(text: str) -> str:
    _, body = split_fm(text)
    body = trim_hr(body)
    lines = [trim_bold(l) for l in body.split("\n")]
    body = tighten("\n".join(lines))
    fm, _ = split_fm(text)
    return fm + body.rstrip() + "\n"


def optimize_topic(text: str) -> tuple[str, dict]:
    stats = {"merged": 0, "boilerplate": False}
    fm, body = split_fm(text)
    fmt = section_format(body)

    preamble, sections, boiler = parse_sections(body)
    if not sections:
        # configure-style ### sections without bold wrapper
        body = trim_hr(remove_dup_h2(body))
        lines = [trim_bold(l) for l in body.split("\n")]
        return fm + tighten("\n".join(lines)).rstrip() + "\n", stats

    if boiler:
        stats["boilerplate"] = True
        stats["merged"] = merge_boilerplate(sections, boiler)

    trim_edge_fluff(sections)
    dedupe_section_content(sections)
    clean_cross_section_dupes(sections)
    body = rebuild(preamble, sections, fmt)
    body = trim_hr(remove_dup_h2(body))
    lines = [trim_bold(l) for l in body.split("\n")]
    body = tighten("\n".join(lines))
    return fm + body.rstrip() + "\n", stats


def optimize(text: str, path: Path) -> tuple[str, dict]:
    name = path.name
    if name in ("INDEX.md", "README.md") or name == "01-how-to-use.md":
        return (optimize_index_or_readme(text) if name != "01-how-to-use.md" else optimize_howto(text), {"merged": 0, "boilerplate": False})
    return optimize_topic(text)


def main() -> None:
    files = sorted(GUIDES.rglob("*.md"))
    before = after = 0
    edited = merged_total = boiler_files = 0
    risky: list[str] = []

    for fp in files:
        raw = fp.read_text(encoding="utf-8")
        bw = wc(raw)
        before += bw
        opt, stats = optimize(raw, fp)
        aw = wc(opt)
        after += aw
        if opt != raw:
            fp.write_text(opt, encoding="utf-8", newline="\n")
            edited += 1
            merged_total += stats["merged"]
            if stats["boilerplate"]:
                boiler_files += 1
        if bw and (bw - aw) / bw > 0.40:
            risky.append(f"{fp.relative_to(GUIDES)} ({(bw-aw)/bw*100:.0f}%)")

    pct = (before - after) / before * 100 if before else 0
    print(f"FILES_EDITED={edited}")
    print(f"FILES_TOTAL={len(files)}")
    print(f"WORDS_BEFORE={before}")
    print(f"WORDS_AFTER={after}")
    print(f"WORD_REDUCTION_PCT={pct:.1f}")
    print(f"BOILERPLATE_FILES={boiler_files}")
    print(f"UNIQUE_PARAS_MERGED={merged_total}")
    print(f"RISKY={len(risky)}")
    for r in risky:
        print(f"  {r}")


if __name__ == "__main__":
    main()
