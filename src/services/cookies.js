// Minimal cookie helpers. The session cookie is HttpOnly (scripts cannot read it),
// SameSite=Lax (not sent on cross-site posts) and Secure over HTTPS.
const config = require('../config');

function parseCookies(header = '') {
  const out = {};
  String(header).split(';').forEach((part) => {
    const i = part.indexOf('=');
    if (i < 1) return;
    out[part.slice(0, i).trim()] = part.slice(i + 1).trim();
  });
  return out;
}

function setSession(res, token) {
  const maxAge = Math.floor(config.cookie.maxAgeMs / 1000);
  res.append('Set-Cookie', `${config.cookie.name}=${token}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax${config.cookie.secure ? '; Secure' : ''}`);
}

function clearSession(res) {
  res.append('Set-Cookie', `${config.cookie.name}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${config.cookie.secure ? '; Secure' : ''}`);
}

module.exports = { parseCookies, setSession, clearSession };
