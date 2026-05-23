import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', 'guides', 'monitor');
const EXPANSIONS = JSON.parse(fs.readFileSync(path.join(__dirname, 'essay-expansions.json'), 'utf8'));

function wordCount(text) {
  return text.split(/\s+/).filter(Boolean).length;
}

const results = [];
for (const [rel, expansion] of Object.entries(EXPANSIONS)) {
  const filePath = path.join(ROOT, ...rel.replace('guides/monitor/', '').split('/'));
  if (!fs.existsSync(filePath)) {
    console.warn('Missing:', rel);
    continue;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  const section = `### Supplemental implementation notes\n\n${expansion.trim()}`;
  if (!content.includes('### Supplemental implementation notes')) {
    content = `${content.trim()}\n\n${section}\n`;
    fs.writeFileSync(filePath, content, 'utf8');
  }
  results.push({ file: rel, words: wordCount(content) });
}

results.sort((a, b) => a.file.localeCompare(b.file));
const under = results.filter((r) => r.words < 800);
console.log(JSON.stringify({ total: results.length, under800: under.length, results, under }, null, 2));
if (under.length) process.exit(1);
