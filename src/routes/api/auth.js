// Sign up, sign in, sign out and password recovery.
const router = require('express').Router();
const users = require('../../db/users');
const sessions = require('../../services/sessions');
const { setSession, clearSession } = require('../../services/cookies');
const pw = require('../../services/passwords');
const { parseUsername } = require('../../services/validate');
const { securityEvent } = require('../../services/log');
const limits = require('../../middleware/limits');
const { requireAuth, requireCsrf } = require('../../middleware/auth');

const publicUser = (u) => ({ username: u.username, createdAt: u.created_at, shareProgress: Boolean(u.share_progress) });
const fail = (res, status, error) => res.status(status).json({ error });
const BAD_LOGIN = 'Incorrect username or password, or too many attempts. Try again later.';

// Who am I? Also hands the page its CSRF token. Mounted at /api/me.
router.me = (req, res) => {
  if (!req.auth) return res.json({ user: null });
  return res.json({
    user: { username: req.auth.username, createdAt: req.auth.createdAt, shareProgress: req.auth.shareProgress },
    csrf: req.auth.csrf,
  });
};

router.post('/signup', limits.signup, async (req, res) => {
  const { username, password, website } = req.body || {};
  if (website) return fail(res, 400, 'Request blocked.'); // hidden field only bots fill in
  const name = parseUsername(username);
  if (!name) return fail(res, 400, 'Usernames are 3 to 20 characters: letters, numbers, - and _.');
  const problem = pw.checkPassword(password, name);
  if (problem) return fail(res, 400, problem);
  if (users.byName(name)) return fail(res, 409, 'That username is taken.');

  const recoveryCode = pw.generateRecoveryCode();
  const [passHash, recoveryHash] = await Promise.all([pw.hashSecret(password), pw.hashSecret(pw.normaliseRecovery(recoveryCode))]);
  let user;
  try {
    user = users.create(name, passHash, recoveryHash);
  } catch (err) {
    if (String(err.code).startsWith('SQLITE_CONSTRAINT')) return fail(res, 409, 'That username is taken.');
    throw err;
  }
  const session = sessions.create(user.id, req.get('user-agent'));
  setSession(res, session.token);
  securityEvent('signup', req, { user: name });
  return res.status(201).json({ user: publicUser(user), csrf: session.csrf, recoveryCode });
});

router.post('/login', limits.login, async (req, res) => {
  const { username, password } = req.body || {};
  const name = parseUsername(username);
  if (!name || typeof password !== 'string' || password.length > 128) { await pw.dummyVerify(); return fail(res, 401, BAD_LOGIN); }
  const user = users.byName(name);
  if (!user || user.locked_until > Date.now()) { await pw.dummyVerify(); return fail(res, 401, BAD_LOGIN); }
  if (!(await pw.verifySecret(password, user.pass_hash))) {
    users.recordFailure(user.id);
    securityEvent('login_failed', req, { user: name });
    return fail(res, 401, BAD_LOGIN);
  }
  users.clearFailures(user.id);
  const session = sessions.create(user.id, req.get('user-agent')); // a fresh session on every sign-in
  setSession(res, session.token);
  securityEvent('login', req, { user: name });
  return res.json({ user: publicUser(user), csrf: session.csrf });
});

router.post('/logout', requireAuth, requireCsrf, (req, res) => {
  sessions.destroy(req.auth.token);
  clearSession(res);
  res.json({ ok: true });
});

// Reset a forgotten password with the recovery code shown at sign-up.
router.post('/recover', limits.recover, async (req, res) => {
  const { username, recoveryCode, newPassword } = req.body || {};
  const name = parseUsername(username);
  const BAD = 'Those recovery details are not correct.';
  if (!name || typeof recoveryCode !== 'string' || recoveryCode.length > 40) { await pw.dummyVerify(); return fail(res, 400, BAD); }
  const problem = pw.checkPassword(newPassword, name);
  if (problem) return fail(res, 400, problem);
  const user = users.byName(name);
  if (!user || !(await pw.verifySecret(pw.normaliseRecovery(recoveryCode), user.recovery_hash))) {
    if (!user) await pw.dummyVerify();
    securityEvent('recovery_failed', req, { user: name });
    return fail(res, 400, BAD);
  }
  const newCode = pw.generateRecoveryCode();
  const [passHash, recoveryHash] = await Promise.all([pw.hashSecret(newPassword), pw.hashSecret(pw.normaliseRecovery(newCode))]);
  users.resetWithRecovery(user.id, passHash, recoveryHash);
  sessions.destroyAll(user.id);
  securityEvent('recovery_used', req, { user: name });
  return res.json({ ok: true, recoveryCode: newCode });
});

module.exports = router;
