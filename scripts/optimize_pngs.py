#!/usr/bin/env python3
"""Lossless-then-lossy PNG compression for documentation assets."""
from __future__ import annotations

import io
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def compress_png(path: Path) -> tuple[int, int, str]:
    from PIL import Image

    original = path.read_bytes()
    before = len(original)
    if before == 0:
        return before, before, "empty"

    img = Image.open(io.BytesIO(original))
    img.load()
    has_alpha = img.mode in ("RGBA", "LA") or ("transparency" in img.info)

    # Pass 1: lossless palette optimization for small indexed images
    if img.mode == "P":
        buf = io.BytesIO()
        img.save(buf, format="PNG", optimize=True, compress_level=9)
        best = buf.getvalue()
    else:
        work = img.convert("RGBA") if has_alpha else img.convert("RGB")
        buf = io.BytesIO()
        work.save(buf, format="PNG", optimize=True, compress_level=9)
        best = buf.getvalue()

    method = "lossless"

    # Pass 2: sensible lossy — quantize only if still large (>80 KB)
    if len(best) > 80_000 and img.width * img.height > 200_000:
        work = img.convert("RGBA") if has_alpha else img.convert("RGB")
        q_img = work.quantize(colors=256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.FLOYDSTEINBERG)
        buf = io.BytesIO()
        q_img.save(buf, format="PNG", optimize=True, compress_level=9)
        lossy = buf.getvalue()
        if len(lossy) < len(best) * 0.92:
            best = lossy
            method = "lossy-quantize"

    # Pass 3: resize oversized hero captures (keep aspect, max 1600px wide)
    if path.name.startswith("readme-wormhole") and img.width > 1600:
        work = img.convert("RGBA") if has_alpha else img.convert("RGB")
        ratio = 1600 / img.width
        resized = work.resize((1600, max(1, int(img.height * ratio))), Image.Resampling.LANCZOS)
        buf = io.BytesIO()
        resized.save(buf, format="PNG", optimize=True, compress_level=9)
        resized_bytes = buf.getvalue()
        if len(resized_bytes) < len(best):
            best = resized_bytes
            method = "resize+lossless"

    after = len(best)
    if after < before:
        path.write_bytes(best)

    return before, after, method


def main() -> None:
    try:
        from PIL import Image  # noqa: F401
    except ImportError:
        import subprocess

        subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow", "-q"])
        from PIL import Image  # noqa: F401

    targets: list[Path] = []
    for sub in ("screenshots", "assets"):
        d = ROOT / sub
        if d.exists():
            targets.extend(sorted(d.rglob("*.png")))

    total_before = 0
    total_after = 0
    changed = 0
    report: list[dict] = []

    for path in targets:
        before, after, method = compress_png(path)
        total_before += before
        total_after += after
        if after < before:
            changed += 1
            report.append(
                {
                    "file": path.relative_to(ROOT).as_posix(),
                    "before_kb": round(before / 1024, 1),
                    "after_kb": round(after / 1024, 1),
                    "saved_kb": round((before - after) / 1024, 1),
                    "method": method,
                }
            )

    summary = {
        "files_scanned": len(targets),
        "files_changed": changed,
        "before_mb": round(total_before / 1024 / 1024, 2),
        "after_mb": round(total_after / 1024 / 1024, 2),
        "saved_mb": round((total_before - total_after) / 1024 / 1024, 2),
        "top_savings": sorted(report, key=lambda x: -x["saved_kb"])[:15],
    }
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
