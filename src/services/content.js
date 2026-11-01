// Loads and validates guide content. In development it reloads on each request.
const fs = require('fs');
const path = require('path');
const { contentFile, isProd, root } = require('../config');
const { createRenderer } = require('./richText');

let cache = null;
const isLocalMedia = (v) => typeof v === 'string' && (!v || (v.startsWith('/media/') && !v.includes('..') && !v.includes('\\')));

function validateQuiz(quiz, label) {
  if (!Array.isArray(quiz) || quiz.length < 2) throw new Error(`${label} needs at least two quiz questions`);
  quiz.forEach((q, i) => {
    if (!q.q || !Array.isArray(q.options) || q.options.length < 2 || !Number.isInteger(q.answer) ||
        q.answer < 0 || q.answer >= q.options.length || !q.explain) throw new Error(`Quiz question ${i + 1} in "${label}" is invalid`);
  });
}

function validate(data) {
  if (!data.site || !Array.isArray(data.categories) || data.categories.length === 0) throw new Error('guide.json needs site details and categories');
  const ids = new Set();
  const add = (id, what) => { if (!id || ids.has(id)) throw new Error(`Missing or duplicate ${what} id: ${id}`); ids.add(id); };
  for (const cat of data.categories) {
    add(cat.id, 'category');
    if (!cat.title || !Array.isArray(cat.sections)) throw new Error(`Category "${cat.id}" is invalid`);
    const groups = new Set((cat.groups || []).map((g) => g.id));
    if (cat.quiz) {
      validateQuiz(cat.quiz, cat.id);
      if (!Array.isArray(cat.checklist) || cat.checklist.length === 0) throw new Error(`Category "${cat.id}" needs a checklist`);
    }
    for (const s of cat.sections) {
      add(s.id, 'section');
      if (!s.title || !Array.isArray(s.body)) throw new Error(`Section "${s.id}" needs a title and body`);
      if (s.group && !groups.has(s.group)) throw new Error(`Section "${s.id}" uses unknown group "${s.group}"`);
            if (s.media) for (const f of ['src', 'poster']) if (!isLocalMedia(s.media[f] || '')) throw new Error(`Section "${s.id}" media ${f} must be a local /media/ path`);
    }
  }
  const termIds = new Set();
  (data.terms || []).forEach((t) => {
    if (!t.id || !t.term || !t.short || termIds.has(t.id)) throw new Error(`Invalid or duplicate term: ${t.id}`);
    termIds.add(t.id);
  });
  [...(data.bibliography || []), ...(data.resources || [])].forEach((g) => (g.items || []).forEach((i) => {
    if (!/^https:\/\//.test(i.url)) throw new Error(`Link must use https: ${i.url}`);
  }));
}

function readCfg(name) {
  try { return fs.readFileSync(path.join(root, 'content', 'autoexec', name), 'utf8'); } catch (_) { return ''; }
}

// Key animations live in content/animations.js so they are easy to edit.
function attachAnimations(data) {
  const file = path.join(root, 'content', 'animations.js');
  delete require.cache[require.resolve(file)];
  const animations = require(file);
  const byId = new Map(data.categories.flatMap((c) => c.sections.map((s) => [s.id, s])));
  for (const [id, a] of Object.entries(animations)) {
    const section = byId.get(id);
    if (!section) throw new Error(`animations.js: no section with id "${id}"`);
    if (!Array.isArray(a.steps) || a.steps.length === 0) throw new Error(`animations.js: "${id}" needs steps`);
    a.steps.forEach((st, i) => {
      if (!Array.isArray(st.keys) || !(st.ms > 0)) throw new Error(`animations.js: "${id}" step ${i + 1} needs keys and ms`);
    });
    section.keyCue = { side: a.side === 'left' ? 'left' : 'right', title: a.title || '', hint: a.hint || '', steps: a.steps, pauseMs: a.pauseMs ?? 500 };
    if (a.graph) section.graph = a.graph;
  }
}

function load() {
  const data = JSON.parse(fs.readFileSync(contentFile, 'utf8'));
  validate(data);
  attachAnimations(data);
  const sections = new Map();
  data.categories.forEach((c) => c.sections.forEach((s) => sections.set(s.id, { summary: s.summary || '' })));
  const terms = new Map((data.terms || []).map((t) => [t.id, t]));
  const sorted = [...(data.terms || [])].sort((a, b) => a.term.localeCompare(b.term, 'en', { sensitivity: 'base' }));
  return {
    data, terms: sorted, render: createRenderer(sections, terms),
    autoexec: { minimal: readCfg('minimal.cfg'), full: readCfg('full.cfg') },
  };
}

function getContent() {
  if (isProd && cache) return cache;
  cache = load();
  return cache;
}

module.exports = { getContent, validate, load };
