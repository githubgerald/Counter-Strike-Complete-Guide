// Signed-in account actions. Every route needs a session and a matching CSRF token.
const router = require('express').Router();
const users = require('../../db/users');
const friends = require('../../db/friends');
const sessions = require('../../services/sessions');
const { clearSession } = require('../../services/cookies');
const pw = require('../../services/passwords');
const { securityEvent } = require('../../services/log');
const limits = require('../../middleware/limits');
const { guard } = require('../../middleware/auth');

const fail = (res, status, error) => res.status(status).json({ error });

router.use(guard);

router.put('/settings', (req, res) => {
  const { shareProgress } = req.body || {};
  if (typeof shareProgress !== 'boolean') return fail(res, 400, 'Invalid setting.');
  users.setShare(req.auth.userId, shareProgress);
  return res.json({ shareProgress });
});

router.post('/password', limits.sensitive, async (req, res) => {
  const { current, next } = req.body || {};
  const user = users.byId(req.auth.userId);
  if (typeof current !== 'string' || current.length > 128 || !(await pw.verifySecret(current, user.pass_hash))) {
    securityEvent('password_change_failed', req, { user: user.username });
    return fail(res, 400, 'Your current password is not correct.');
  }
  const problem = pw.checkPassword(next, user.username);
  if (problem) return fail(res, 400, problem);
  users.setPassword(user.id, await pw.hashSecret(next));
  sessions.destroyOthers(user.id, req.auth.token); // other devices must sign in again
  securityEvent('password_changed', req, { user: user.username });
  return res.json({ ok: true });
});

router.post('/sign-out-everywhere', (req, res) => {
  sessions.destroyAll(req.auth.userId);
  clearSession(res);
  res.json({ ok: true });
});

router.post('/delete', limits.sensitive, async (req, res) => {
  const { password } = req.body || {};
  const user = users.byId(req.auth.userId);
  if (typeof password !== 'string' || password.length > 128 || !(await pw.verifySecret(password, user.pass_hash))) {
    return fail(res, 400, 'Your password is not correct.');
  }
  users.remove(user.id); // sessions, progress and friendships are removed with it
  clearSession(res);
  securityEvent('account_deleted', req, { user: user.username });
  return res.json({ ok: true });
});

// A copy of everything stored about the account.
router.get('/export', (req, res) => {
  const user = users.byId(req.auth.userId);
  res.set('Content-Disposition', 'attachment; filename="cs2-guide-account-data.json"');
  res.json({
    username: user.username,
    createdAt: new Date(user.created_at).toISOString(),
    shareProgress: Boolean(user.share_progress),
    completedModules: users.getProgress(user.id),
    friends: friends.overview(user.id),
  });
});

module.exports = router;
