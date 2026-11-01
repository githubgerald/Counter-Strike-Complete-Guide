// Run before publishing: checks the guide data and that every [[link]] resolves.
const fs = require('node:fs');
const path = require('node:path');
const { validate, load } = require('../src/services/content');

const guide = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'content', 'guide.json'), 'utf8'));
validate(guide);
load(); // also checks content/animations.js

const known = new Set([...guide.terms.map((t) => t.id)]);
const termSections = new Set(guide.terms.map((t) => t.section).filter(Boolean));
guide.categories.forEach((c) => { known.add(c.id); c.sections.forEach((s) => known.add(s.id)); });
let links = 0; const broken = [];
const scan = (where, text) => String(text).replace(/\[\[([\w-]+)\|/g, (m, id) => { links += 1; if (!known.has(id)) broken.push(`${where}: ${id}`); return m; });
guide.categories.forEach((c) => c.sections.forEach((s) => s.body.forEach((b) => scan(s.id, b.text || (b.items || []).join(' ')))));
guide.terms.forEach((t) => { if (t.section && !known.has(t.section)) broken.push(`term ${t.id}: section ${t.section}`); });
if (broken.length) { console.error('Broken links:\n' + broken.join('\n')); process.exit(1); }
const sections = guide.categories.reduce((n, c) => n + c.sections.length, 0);
console.log(`OK: ${guide.categories.length} modules, ${sections} sections, ${guide.terms.length} terms, ${links} links.`);
