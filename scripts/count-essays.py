#!/usr/bin/env python3
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
patterns = [
    'guides/infrastructure/asset-inventory/0*.md',
    'guides/infrastructure/analytics/0*.md',
    'guides/configure/rules-engine/0*.md',
    'guides/configure/correlation-builder/0*.md',
]
skip = {'01-how-to-use.md', '02-deep-dive.md'}
files = []
for p in patterns:
    files.extend(ROOT.glob(p))
files = sorted({f for f in files if f.name not in skip})

for f in files:
    wc = len(re.findall(r"[A-Za-z0-9'-]+", f.read_text(encoding='utf-8')))
    flag = 'OK' if wc >= 800 else 'LOW'
    print(f'{flag} {wc:4d}  {f.relative_to(ROOT).as_posix()}')
print('TOTAL', len(files))
