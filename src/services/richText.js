// Turns plain content text into safe HTML.
// Markup: [[id|label]] hover link, [text](https://url) external link, **bold**, `command` (copy chip).
// Pass a Set as `seen` so each term is underlined only once per subsection.
const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const escapeHtml = (text) => String(text).replace(/[&<>"']/g, (c) => ESCAPES[c]);

const COPY_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></svg>';

// sections: Map id -> { summary }; terms: Map id -> { short, section }
function createRenderer(sections, terms) {
  const termBySection = new Map();
  terms.forEach((term) => { if (term.section && !termBySection.has(term.section)) termBySection.set(term.section, term); });

  function link(id, label, seen) {
    const term = terms.get(id) || termBySection.get(id) || null;
    const section = sections.has(id) ? id : (term && term.section && sections.has(term.section) ? term.section : null);
    if (!term && !section) return label;
    const key = term ? term.id : id;
    if (seen) { if (seen.has(key)) return label; seen.add(key); }
    const short = (term && term.short) || (sections.get(section) || {}).summary || '';
    const href = section ? `#${section}` : `#term-${term.id}`;
    const dict = term ? ` data-dict="#term-${escapeHtml(term.id)}"${section ? '' : ' data-nosection="1"'}` : '';
    return `<a class="term" href="${escapeHtml(href)}" data-summary="${escapeHtml(short)}"${dict}>${label}</a>`;
  }

  return function render(text = '', seen = null) {
    return escapeHtml(text) // escape first, so content can never inject HTML
      .replace(/\[\[([\w-]+)\|([^\]]+)\]\]/g, (m, id, label) => link(id, label, seen))
      .replace(/\[([^\]]+)\]\((https:\/\/[^\s)]+)\)/g, '<a class="ext" href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, (m, cmd) => `<span class="chip"><code>${cmd}</code><button type="button" class="copy" data-copy="${cmd}" aria-label="Copy command" title="Copy">${COPY_ICON}</button></span>`);
  };
}

module.exports = { createRenderer, escapeHtml };
