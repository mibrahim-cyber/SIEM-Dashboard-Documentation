#!/usr/bin/env python3
"""Apply shared favicon, font preloads, and per-page SEO meta across the site."""
from __future__ import annotations

import re
import struct
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCREENSHOTS = ROOT / "screenshots"
SITE = "HABIBI-SIEM"
BASE_OG = "https://number-1-python-glazer.github.io/SIEM-Dashboard-Documentation"

PAGES: dict[str, dict[str, str]] = {
    "index.html": {
        "title": "Meridian-7 · Approach Vector",
        "description": "Shuttle approach to Station Meridian-7 — interactive SIEM documentation deck and SOC experience hub.",
        "og": "Approach Vector — Meridian-7 SIEM Deck",
        "slug": "landing",
    },
    "brain/index.html": {
        "title": "SIEM Dashboard — Observation Deck",
        "description": "Module graph and documentation hub — explore architecture, detection, and all thirteen deck experiences.",
        "og": "Observation Deck — HABIBI-SIEM",
        "slug": "brain",
    },
    "left.html": {
        "title": "The War Room — Meridian-7",
        "description": "Live threat matrix, analyst comms, and pipeline gauges for tier-two SOC operations.",
        "og": "The War Room — HABIBI-SIEM",
        "slug": "war-room",
    },
    "right.html": {
        "title": "The Signal Room — SR-7",
        "description": "Spectrum, waterfall, and intercept modes — radio-frequency style alert monitoring.",
        "og": "The Signal Room — HABIBI-SIEM",
        "slug": "signal-room",
    },
    "terminal.html": {
        "title": "The Terminal — Meridian-7 SIEM",
        "description": "Boot the SOC shell — command-line triage, log grep, and virtual filesystem lab.",
        "og": "The Terminal — HABIBI-SIEM",
        "slug": "terminal",
    },
    "breach.html": {
        "title": "The Breach — Meridian-7",
        "description": "Red-team containment simulation — isolate nodes and stop lateral movement.",
        "og": "The Breach — HABIBI-SIEM",
        "slug": "breach",
    },
    "network.html": {
        "title": "The Ghost Network — Meridian-7",
        "description": "45-node threat graph with packet capture and live event engine.",
        "og": "The Ghost Network — HABIBI-SIEM",
        "slug": "network",
    },
    "cipher.html": {
        "title": "The Cipher — Meridian-7",
        "description": "Cryptographic puzzle room — decode signals and unlock classified briefs.",
        "og": "The Cipher — HABIBI-SIEM",
        "slug": "cipher",
    },
    "sim.html": {
        "title": "The Simulation — Meridian-7",
        "description": "Incident timeline replay — scrub through detections and analyst actions.",
        "og": "The Simulation — HABIBI-SIEM",
        "slug": "sim",
    },
    "intercept.html": {
        "title": "The Interrogation Room — Meridian-7",
        "description": "Signal decode chamber — interrogate captured traffic and extract IOCs.",
        "og": "The Interrogation Room — HABIBI-SIEM",
        "slug": "intercept",
    },
    "forge.html": {
        "title": "The Forge — Meridian-7",
        "description": "Detection rule crafting workshop — build and test STRIDE-aligned rules.",
        "og": "The Forge — HABIBI-SIEM",
        "slug": "forge",
    },
    "archive.html": {
        "title": "The Deep Archive — Meridian-7",
        "description": "Three-dimensional log vault — navigate retained evidence in spatial memory.",
        "og": "The Deep Archive — HABIBI-SIEM",
        "slug": "archive",
    },
    "heist.html": {
        "title": "The Heist — Meridian-7",
        "description": "Stealth data extraction puzzle — evade guards across segmented zones.",
        "og": "The Heist — HABIBI-SIEM",
        "slug": "heist",
    },
    "cartography.html": {
        "title": "The Cartography — Meridian-7",
        "description": "WebGL threat globe — plot actor arcs and geographic attack paths.",
        "og": "The Cartography — HABIBI-SIEM",
        "slug": "cartography",
    },
    "lab.html": {
        "title": "The Lab — Meridian-7",
        "description": "Detection experiment bay — tune rules against synthetic attack campaigns.",
        "og": "The Lab — HABIBI-SIEM",
        "slug": "lab",
    },
    "memorial.html": {
        "title": "The Memorial — Meridian-7",
        "description": "Incident remembrance wall — honor major breaches and lessons learned.",
        "og": "The Memorial — HABIBI-SIEM",
        "slug": "memorial",
    },
    "resonance.html": {
        "title": "The Resonance — Meridian-7",
        "description": "Six-channel alert sonification — mix ingest, rules, and threat feeds as sound.",
        "og": "The Resonance — HABIBI-SIEM",
        "slug": "resonance",
    },
    "motd.html": {
        "title": "Daily Briefing — Meridian-7",
        "description": "Daily threat summary and analyst tips from Meridian-7 SOC.",
        "og": "Daily Briefing — HABIBI-SIEM",
        "slug": "motd",
    },
    "trophy.html": {
        "title": "Achievements — Meridian-7",
        "description": "Unlock deck achievements by visiting experiences and completing challenges.",
        "og": "Achievements — HABIBI-SIEM",
        "slug": "trophy",
    },
    "404.html": {
        "title": "404 — Signal Lost",
        "description": "Page not found on Station Meridian-7.",
        "og": "404 — HABIBI-SIEM",
        "slug": "404",
    },
    "500.html": {
        "title": "500 — Station Fault",
        "description": "Internal error on Station Meridian-7.",
        "og": "500 — HABIBI-SIEM",
        "slug": "500",
    },
}


def asset_prefix(rel_path: str) -> str:
    return "../" if rel_path.startswith("brain/") else ""


def head_block(rel_path: str, meta: dict[str, str]) -> str:
    prefix = asset_prefix(rel_path)
    desc = meta["description"]
    og_title = meta["og"]
    og_image = f"{BASE_OG}/screenshots/{meta['slug']}-og.png"
    return f"""  <link rel="icon" href="{prefix}favicon.ico" sizes="any" />
  <link rel="icon" href="{prefix}favicon-32.png" type="image/png" sizes="32x32" />
  <link rel="apple-touch-icon" href="{prefix}apple-touch-icon.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <meta name="description" content="{desc}" />
  <meta property="og:title" content="{og_title}" />
  <meta property="og:description" content="{desc}" />
  <meta property="og:image" content="{og_image}" />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="{og_title}" />
  <meta name="twitter:description" content="{desc}" />
  <meta name="twitter:image" content="{og_image}" />
"""


def strip_old_meta(text: str) -> str:
    patterns = [
        r'\s*<link rel="icon"[^>]*>\n',
        r'\s*<link rel="apple-touch-icon"[^>]*>\n',
        r'\s*<meta name="description"[^>]*>\n',
        r'\s*<meta property="og:[^"]+"[^>]*>\n',
        r'\s*<meta name="twitter:[^"]+"[^>]*>\n',
        r'\s*<link rel="preconnect" href="https://fonts\.googleapis\.com"[^>]*>\n',
        r'\s*<link rel="preconnect" href="https://fonts\.gstatic\.com"[^>]*>\n',
    ]
    for pat in patterns:
        text = re.sub(pat, "", text, flags=re.IGNORECASE)
    return text


def apply_meta_to_file(rel_path: str, meta: dict[str, str]) -> None:
    path = ROOT / rel_path.replace("/", "\\") if "\\" not in rel_path else ROOT / rel_path
    path = ROOT / rel_path
    text = path.read_text(encoding="utf-8")
    text = strip_old_meta(text)
    block = head_block(rel_path, meta)
    if "<meta charset" in text:
        text = re.sub(
            r'(<meta charset="UTF-8"\s*/>)',
            r"\1\n" + block.rstrip(),
            text,
            count=1,
            flags=re.IGNORECASE,
        )
    else:
        text = text.replace("<head>", "<head>\n" + block, 1)
    if "<title>" in text:
        text = re.sub(r"<title>[^<]*</title>", f"<title>{meta['title']}</title>", text, count=1)
    path.write_text(text, encoding="utf-8")
    print("meta:", rel_path)


def png_chunk(tag: bytes, data: bytes) -> bytes:
    crc = zlib.crc32(tag + data) & 0xFFFFFFFF
    return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", crc)


def write_png(path: Path, width: int, height: int, rgba_fn) -> None:
    raw = b""
    for y in range(height):
        raw += b"\x00"
        for x in range(width):
            raw += bytes(rgba_fn(x, y))
    compressed = zlib.compress(raw, 9)
    ihdr = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    png = b"\x89PNG\r\n\x1a\n" + png_chunk(b"IHDR", ihdr) + png_chunk(b"IDAT", compressed) + png_chunk(b"IEND", b"")
    path.write_bytes(png)


def generate_favicons() -> None:
    def diamond(x: int, y: int, size: int) -> bool:
        cx, cy = size // 2, size // 2
        return abs(x - cx) + abs(y - cy) <= size // 2 - 1

    for size, name in [(32, "favicon-32.png"), (180, "apple-touch-icon.png")]:
        write_png(
            ROOT / name,
            size,
            size,
            lambda x, y, s=size: (0, 0, 0, 255) if not diamond(x, y, s) else (56, 189, 248, 255),
        )
    write_png(ROOT / "favicon.ico", 32, 32, lambda x, y: (0, 0, 0, 255) if not diamond(x, y, 32) else (56, 189, 248, 255))
    print("favicons written")


def generate_og_images() -> None:
    SCREENSHOTS.mkdir(exist_ok=True)
    try:
        from PIL import Image, ImageDraw, ImageFont
    except ImportError:
        for rel, meta in PAGES.items():
            slug = meta["slug"]
            w, h = 1200, 630

            def px(x, y, t=meta["og"], s=slug):
                if y < 80:
                    return (10, 4, 8, 255)
                if 60 <= x <= 1160 and 120 <= y <= 520:
                    return (15, 10, 30, 255)
                if y > 540:
                    return (56, 189, 248, 255) if (x // 40 + y // 20) % 2 else (10, 4, 8, 255)
                return (10, 4, 8, 255)

            write_png(SCREENSHOTS / f"{slug}-og.png", w, h, px)
        print("og images (fallback) written")
        return

    for meta in PAGES.values():
        slug = meta["slug"]
        img = Image.new("RGB", (1200, 630), (10, 4, 8))
        draw = ImageDraw.Draw(img)
        draw.rectangle([60, 120, 1140, 520], outline=(56, 189, 248), width=2)
        draw.polygon([(600, 200), (650, 280), (600, 360), (550, 280)], fill=(56, 189, 248))
        try:
            font_l = ImageFont.truetype("consola.ttf", 48)
            font_s = ImageFont.truetype("consola.ttf", 28)
        except OSError:
            font_l = ImageFont.load_default()
            font_s = font_l
        draw.text((80, 80), meta["og"], fill=(196, 181, 253), font=font_l)
        draw.text((80, 440), meta["description"][:90] + "…", fill=(148, 163, 184), font=font_s)
        draw.text((80, 560), SITE, fill=(56, 189, 248), font=font_s)
        img.save(SCREENSHOTS / f"{slug}-og.png")
    print("og images (PIL) written")


def main() -> None:
    generate_favicons()
    generate_og_images()
    for rel, meta in PAGES.items():
        if (ROOT / rel).is_file():
            apply_meta_to_file(rel, meta)
    print("done:", len(PAGES), "pages")


if __name__ == "__main__":
    main()
