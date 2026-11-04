// Friend requests and the friends list.
const router = require('express').Router();
const users = require('../../db/users');
const friends = require('../../db/friends');
const config = require('../../config');
const { parseUsername } = require('../../services/validate');
const limits = require('../../middleware/limits');
const { requireAuth, requireCsrf } = require('../../middleware/auth');

const overview = (req) => friends.overview(req.auth.userId);
const fail = (res, status, error) => res.status(status).json({ error });

router.get('/', requireAuth, (req, res) => res.json(overview(req)));

router.use(requireAuth, requireCsrf, limits.friends);

// Send a request. The answer is the same whether or not the username exists.
router.post('/request', (req, res) => {
  const name = parseUsername(req.body && req.body.username);
  if (!name) return fail(res, 400, 'Enter a valid username.');
  const me = req.auth.userId;
  const target = users.byName(name);
  if (target && target.id === me) return fail(res, 400, 'You cannot add yourself.');
  if (target) {
    const existing = friends.pair(me, target.id);
    if (!existing) {
      if (friends.pendingCount(me) >= config.limits.maxPendingRequests) return fail(res, 429, 'You have too many pending requests.');
      if (friends.friendCount(me) >= config.limits.maxFriends) return fail(res, 400, 'Your friends list is full.');
      friends.request(me, target.id);
    } else if (existing.status === 'pending' && existing.addressee_id === me) {
      friends.accept(me, target.id); // they already asked you: this accepts it
    }
  }
  return res.json(overview(req));
});

router.post('/accept', (req, res) => {
  const name = parseUsername(req.body && req.body.username);
  const from = name && users.byName(name);
  if (!from || !friends.accept(req.auth.userId, from.id)) return fail(res, 404, 'No such request.');
  return res.json(overview(req));
});

// Decline a request, cancel your own request, or remove a friend.
router.post('/remove', (req, res) => {
  const name = parseUsername(req.body && req.body.username);
  const other = name && users.byName(name);
  if (other) friends.remove(req.auth.userId, other.id);
  return res.json(overview(req));
});

module.exports = router;
