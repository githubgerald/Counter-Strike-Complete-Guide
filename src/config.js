// Central configuration. Values come from environment variables (see .env.example).
const path = require('path');

const root = path.join(__dirname, '..');
try { process.loadEnvFile(path.join(root, '.env')); } catch (_) { /* no .env file: use defaults */ }

const env = process.env;
const DAY = 24 * 60 * 60 * 1000;
const isProd = env.NODE_ENV === 'production';
const port = Number(env.PORT) || 3000;
const siteUrl = (env.SITE_URL || `http://localhost:${port}`).replace(/\/+$/, '');
const secureCookies = isProd || siteUrl.startsWith('https://');
const trust = env.TRUST_PROXY;

if (isProd && !siteUrl.startsWith('https://')) console.warn('WARNING: SITE_URL should start with https:// in production.');

module.exports = {
  root,
  port,
  host: env.HOST || '127.0.0.1',
  isProd,
  siteUrl,
  siteHost: new URL(siteUrl).host,
  // Set TRUST_PROXY=1 when the site sits behind one reverse proxy or CDN, so client IPs are read correctly.
  trustProxy: trust === undefined || trust === '' ? false : (/^\d+$/.test(trust) ? Number(trust) : trust),
  contentFile: path.join(root, 'content', 'guide.json'),
  dbPath: env.DB_PATH ? path.resolve(env.DB_PATH) : path.join(root, 'data', 'guide.db'),
  securityContact: env.SECURITY_CONTACT || '',
  // Multiplies every rate limit. Keep at 1 in production.
  rateScale: Number(env.RATE_LIMIT_SCALE) || 1,
  cookie: {
    name: secureCookies ? '__Host-cs2sid' : 'cs2sid', // __Host- locks the cookie to this exact host over HTTPS
    secure: secureCookies,
    maxAgeMs: 30 * DAY,   // a session ends after 30 days
    idleMs: 7 * DAY,      // or after 7 days without use
  },
  limits: { maxFriends: 100, maxPendingRequests: 20 },
};
