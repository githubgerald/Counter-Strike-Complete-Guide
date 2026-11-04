// Server-side sessions. The browser holds a random token; only its SHA-256 hash is stored,
// so a leaked database cannot be used to log in.
const crypto = require('crypto');
const db = require('../db');
const { cookie } = require('../config');

const sha = (token) => crypto.createHash('sha256').update(token).digest('hex');
const q = {
  insert: db.prepare('INSERT INTO sessions (id_hash, user_id, csrf, created_at, last_seen, expires_at, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?)'),
  find: db.prepare(`SELECT s.id_hash, s.csrf, s.expires_at, s.last_seen, u.id AS user_id, u.username, u.created_at, u.share_progress
    FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id_hash = ?`),
  touch: db.prepare('UPDATE sessions SET last_seen = ? WHERE id_hash = ?'),
  remove: db.prepare('DELETE FROM sessions WHERE id_hash = ?'),
  removeUser: db.prepare('DELETE FROM sessions WHERE user_id = ?'),
  removeOthers: db.prepare('DELETE FROM sessions WHERE user_id = ? AND id_hash <> ?'),
  purge: db.prepare('DELETE FROM sessions WHERE expires_at <= ? OR last_seen <= ?'),
};

function create(userId, userAgent = '') {
  const token = crypto.randomBytes(32).toString('base64url');
  const csrf = crypto.randomBytes(24).toString('base64url');
  const now = Date.now();
  q.insert.run(sha(token), userId, csrf, now, now, now + cookie.maxAgeMs, String(userAgent).slice(0, 200));
  return { token, csrf };
}

function lookup(token) {
  if (typeof token !== 'string' || token.length !== 43) return null;
  const row = q.find.get(sha(token));
  if (!row) return null;
  const now = Date.now();
  if (row.expires_at <= now || row.last_seen <= now - cookie.idleMs) { q.remove.run(row.id_hash); return null; }
  if (now - row.last_seen > 10 * 60 * 1000) q.touch.run(now, row.id_hash);
  return row;
}

module.exports = {
  create, lookup,
  destroy: (token) => q.remove.run(sha(token)),
  destroyAll: (userId) => q.removeUser.run(userId),
  destroyOthers: (userId, token) => q.removeOthers.run(userId, sha(token)),
  purgeExpired: () => q.purge.run(Date.now(), Date.now() - cookie.idleMs),
};
