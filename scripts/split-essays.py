#!/usr/bin/env python3
"""Split consolidated 02-deep-dive.md files into individual essay files."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
manifest = json.loads((ROOT / 'scripts' / 'SUBTOPIC-MANIFEST.json').read_text(encoding='utf-8'))

MODULE_META = {
    'infrastructure/asset-inventory': ('Asset Inventory', 'Infrastructure → Asset Inventory', 'AssetInventory.jsx'),
    'infrastructure/analytics': ('Analytics', 'Infrastructure → Analytics', 'Analytics.jsx'),
    'configure/rules-engine': ('Rules Engine', 'Configure → Rules Engine', 'RulesManager.jsx'),
    'configure/correlation-builder': ('Correlation Builder', 'Configure → Correlation Builder', 'CorrelationBuilder.jsx'),
}

SECTION_MAP = {
    'infrastructure/asset-inventory': [
        'Why you cannot protect what you cannot see',
        'What an asset is in this context',
        'Every field in an asset record',
        'Asset discovery trade-offs',
        'Asset lifecycle Discovered→Decommissioned',
        'Orphaned asset / shadow IT',
        'Asset inventory and compliance',
    ],
    'infrastructure/analytics': [
        'Operational vs analytics dashboards',
        'Every chart type in analytics view',
        'Alert volume over time / seasonality',
        'Top attackers, assets, rules ranked lists',
        'MTTD and MTTR',
        'Trend analysis week/month',
        'Using analytics to justify budget',
    ],
    'configure/rules-engine': [
        'What a detection rule is',
        'Rule anatomy',
        'Sliding window temporal logic',
        'Sequence/correlation rules',
        'Creating new rule step-by-step',
        'Tuning false positives',
        'Rule versioning and change management',
        'Importing SIGMA/community rules',
    ],
    'configure/correlation-builder': [
        'What correlation means in SIEM',
        'Correlation builder UI elements',
        'Event pattern design',
        'Time windows and dwell time',
        'Testing before deployment',
        'Performance cost of correlations',
        'Real-world correlation examples',
    ],
}


def word_count(text: str) -> int:
    return len(re.findall(r"[A-Za-z0-9'-]+", text))


def split_deep_dive(path: Path) -> dict[str, str]:
    content = path.read_text(encoding='utf-8')
    if content.startswith('---'):
        end = content.find('---', 3)
        content = content[end + 3 :].lstrip()
    m = re.search(r'^## ', content, re.M)
    if m:
        content = content[m.start() :]
    parts = re.split(r'\n(?=## )', content)
    sections: dict[str, str] = {}
    for part in parts:
        if not part.strip():
            continue
        title = part.split('\n', 1)[0].replace('## ', '').strip()
        sections[title] = part.strip()
    return sections


def main() -> None:
    results: list[tuple[str, int]] = []
    keys = [
        'infrastructure/asset-inventory',
        'infrastructure/analytics',
        'configure/rules-engine',
        'configure/correlation-builder',
    ]
    for key in keys:
        group, slug = key.split('/', 1)
        deep = ROOT / 'guides' / group / slug / '02-deep-dive.md'
        sections = split_deep_dive(deep)
        mod_name, sidebar, component = MODULE_META[key]
        essays = manifest[key]
        headers = SECTION_MAP[key]
        if len(headers) != len(essays):
            print('MISMATCH', key, len(headers), len(essays))
            continue
        for essay, header in zip(essays, headers):
            body = sections.get(header)
            if not body:
                print('MISSING', key, header, 'available:', list(sections.keys()))
                continue
            title = essay['title']
            fname = essay['file']
            wc = word_count(body)
            frontmatter = (
                f"---\n"
                f"module: {mod_name}\n"
                f"sidebar: {sidebar}\n"
                f"component: {component}\n"
                f"essay: {fname}\n"
                f'title: "{title}"\n'
                f"audience: All — technical and non-technical\n"
                f"last_updated: 2026-05-23\n"
                f"---\n\n"
                f"# {title}\n\n"
                f"**Sidebar path:** {sidebar}\n\n"
            )
            out_path = ROOT / 'guides' / group / slug / fname
            out_path.write_text(frontmatter + body + '\n', encoding='utf-8')
            rel = out_path.relative_to(ROOT).as_posix()
            results.append((rel, wc))

    for path, wc in sorted(results):
        flag = 'OK' if wc >= 800 else 'LOW'
        print(f'{flag} {wc:4d}  {path}')
    print('TOTAL', len(results))


if __name__ == '__main__':
    main()
