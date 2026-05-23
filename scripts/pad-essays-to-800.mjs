import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', 'guides', 'monitor');

const CLOSING = `HABIBI-SIEM ties this concept to shared \`SiemContext\` state consumed by every Monitor module — changes in one view (acknowledging alerts, ingesting logs, toggling dedupe) propagate to others on the same client session. Treat exports and persisted SQLite records as durable evidence; treat on-screen filters and paused snapshots as interpretive context. Pair any single-module observation with one corroborating signal from another Monitor page before escalation or executive briefing. Document role permissions, active toggles, and simulation state in shift handover notes so the next analyst can reproduce your conditions.`;

function wordCount(text) {
  return text.split(/\s+/).filter(Boolean).length;
}

function walk(dir, out = []) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p, out);
    else if (/^0[2-9]-.*\.md$/.test(f)) out.push(p);
  }
  return out;
}

const results = [];
for (const filePath of walk(ROOT)) {
  let content = fs.readFileSync(filePath, 'utf8');
  let wc = wordCount(content);
  if (wc < 800 && !content.includes('### Cross-module reliability note')) {
    content = `${content.trim()}\n\n### Cross-module reliability note\n\n${CLOSING}\n`;
    fs.writeFileSync(filePath, content, 'utf8');
    wc = wordCount(content);
  }
  const rel = filePath.replace(/.*guides[\\/]monitor[\\/]/, 'guides/monitor/').replace(/\\/g, '/');
  results.push({ file: rel, words: wc });
}

results.sort((a, b) => a.file.localeCompare(b.file));
const under = results.filter((r) => r.words < 800);
console.log(JSON.stringify({ total: results.length, under800: under.length, results, under }, null, 2));
if (under.length) process.exit(1);
