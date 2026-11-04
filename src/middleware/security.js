// Request-level protections for the JSON API.
const config = require('../config');

// CSRF defence 1: browsers always send Origin on cross-site posts, so it must match this site.
function sameOrigin(req, res, next) {
  if (req.method === 'GET' || req.method === 'HEAD') return next();
  let ok = false;
  const origin = req.get('origin');
  if (origin) {
    try {
      const host = new URL(origin).host;
      ok = host === req.get('host') || host === config.siteHost;
    } catch (_) { ok = false; }
  }
  if (!ok) return res.status(403).json({ error: 'Request blocked.' });
  return next();
}

// Only JSON bodies are accepted (a plain HTML form cannot send these cross-site).
function jsonOnly(req, res, next) {
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && !req.is('application/json')) {
    return res.status(415).json({ error: 'Unsupported content type.' });
  }
  return next();
}

// Allowed methods site-wide.
function methods(req, res, next) {
  if (['GET', 'HEAD', 'POST', 'PUT'].includes(req.method)) return next();
  return res.sendStatus(405);
}

// Browser features this site never needs.
function permissions(req, res, next) {
  res.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=(), interest-cohort=()');
  next();
}

module.exports = { sameOrigin, jsonOnly, methods, permissions };
