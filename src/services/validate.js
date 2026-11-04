// Input checks. Everything that arrives from the browser is treated as untrusted.
const { getContent } = require('./content');

const RESERVED = new Set(['admin', 'administrator', 'root', 'system', 'support', 'moderator', 'mod', 'staff', 'owner', 'anonymous', 'null', 'undefined', 'cs2', 'valve']);

// 3 to 20 characters: letters, numbers, underscore, hyphen. Stored lowercase.
function parseUsername(value) {
  if (typeof value !== 'string') return null;
  const name = value.trim().toLowerCase();
  if (!/^[a-z0-9_-]{3,20}$/.test(name) || RESERVED.has(name)) return null;
  return name;
}

// Only modules that have a quiz can be completed.
function validModules() {
  return new Set(getContent().data.categories.filter((c) => c.quiz).map((c) => c.id));
}

function parseModules(value) {
  if (!Array.isArray(value) || value.length > 50) return null;
  const valid = validModules();
  const out = new Set();
  for (const id of value) {
    if (typeof id !== 'string' || !valid.has(id)) return null;
    out.add(id);
  }
  return [...out];
}

module.exports = { parseUsername, parseModules, validModules };
