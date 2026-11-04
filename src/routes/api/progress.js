// Saved progress (completed modules) for signed-in users.
const router = require('express').Router();
const users = require('../../db/users');
const { parseModules } = require('../../services/validate');
const { guard } = require('../../middleware/auth');

router.get('/', (req, res) => {
  if (!req.auth) return res.status(401).json({ error: 'Please sign in first.' });
  return res.json({ modules: users.getProgress(req.auth.userId) });
});

// Replaces the saved list. The page sends the merged list when you sign in.
router.put('/', guard, (req, res) => {
  const modules = parseModules(req.body && req.body.modules);
  if (!modules) return res.status(400).json({ error: 'Invalid progress data.' });
  users.replaceProgress(req.auth.userId, modules);
  return res.json({ modules });
});

module.exports = router;
