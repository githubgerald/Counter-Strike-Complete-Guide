// Rate limits (per client IP). They slow guessing and flooding at the application level.
// For large floods, put the site behind a CDN or host firewall as well (see docs/SECURITY.md).
const rateLimit = require('express-rate-limit');
const { rateScale } = require('../config');

function limiter(windowMs, max, message, options = {}) {
  return rateLimit({
    windowMs, max: Math.max(1, Math.round(max * rateScale)),
    standardHeaders: true, legacyHeaders: false,
    message: { error: message },
    ...options,
  });
}

const MINUTE = 60 * 1000;
module.exports = {
  everything: rateLimit({ windowMs: MINUTE, max: Math.round(600 * rateScale), standardHeaders: true, legacyHeaders: false }),
  api: limiter(MINUTE, 120, 'Too many requests. Slow down and try again soon.'),
  login: limiter(15 * MINUTE, 10, 'Too many sign-in attempts. Try again in a few minutes.', { skipSuccessfulRequests: true }),
  signup: limiter(60 * MINUTE, 5, 'Too many accounts created from this network. Try again later.'),
  recover: limiter(60 * MINUTE, 5, 'Too many recovery attempts. Try again later.', { skipSuccessfulRequests: true }),
  sensitive: limiter(15 * MINUTE, 10, 'Too many attempts. Try again in a few minutes.'),
  friends: limiter(MINUTE, 40, 'Too many friend actions. Slow down.'),
};
