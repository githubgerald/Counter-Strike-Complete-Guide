// Reads the session cookie and exposes req.auth. requireAuth and requireCsrf guard routes.
const crypto = require('crypto');
const config = require('../config');
const sessions = require('../services/sessions');
const { parseCookies } = require('../services/cookies');

function attachUser(req, res, next) {
  req.auth = null;
  const token = parseCookies(req.headers.cookie)[config.cookie.name];
  if (token) {
    const row = sessions.lookup(token);
    if (row) {
      req.auth = {
        token, userId: row.user_id, username: row.username, createdAt: row.created_at,
        shareProgress: Boolean(row.share_progress), csrf: row.csrf,
      };
    }
  }
  next();
}

function requireAuth(req, res, next) {
  if (!req.auth) return res.status(401).json({ error: 'Please sign in first.' });
  return next();
}

// CSRF defence 2: state-changing requests must echo the token this session was given.
function requireCsrf(req, res, next) {
  if (req.method === 'GET' || req.method === 'HEAD') return next(); // reading changes nothing
  const sent = Buffer.from(String(req.get('x-csrf-token') || ''));
  const real = Buffer.from(req.auth.csrf);
  if (sent.length !== real.length || !crypto.timingSafeEqual(sent, real)) {
    return res.status(403).json({ error: 'Security check failed. Reload the page and try again.' });
  }
  return next();
}

module.exports = { attachUser, requireAuth, requireCsrf, guard: [requireAuth, requireCsrf] };
