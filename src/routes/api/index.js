// All JSON API routes live under /api.
const express = require('express');
const limits = require('../../middleware/limits');
const { sameOrigin, jsonOnly } = require('../../middleware/security');
const { attachUser } = require('../../middleware/auth');

const router = express.Router();

router.use((req, res, next) => { res.set('Cache-Control', 'no-store'); next(); }); // never cache account data
router.use(limits.api);
router.use(sameOrigin);
router.use(express.json({ limit: '8kb', strict: true }));
router.use(jsonOnly);
router.use(attachUser);

const auth = require('./auth');
router.get('/me', auth.me);
router.use('/auth', auth);
router.use('/account', require('./account'));
router.use('/progress', require('./progress'));
router.use('/friends', require('./friends'));

router.use((req, res) => res.status(404).json({ error: 'Not found.' }));
router.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  if (err && err.type === 'entity.too.large') return res.status(413).json({ error: 'Request too large.' });
  if (err && (err.type === 'entity.parse.failed' || err instanceof SyntaxError)) return res.status(400).json({ error: 'Invalid request.' });
  if (err && err.status === 503) return res.status(503).json({ error: 'Busy. Try again in a moment.' });
  console.error(err);
  return res.status(500).json({ error: 'Something went wrong.' });
});

module.exports = router;
