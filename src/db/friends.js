// Friend requests and friend lists.
const db = require('./index');

const q = {
  pair: db.prepare(`SELECT * FROM friendships
    WHERE (requester_id = @a AND addressee_id = @b) OR (requester_id = @b AND addressee_id = @a)`),
  insert: db.prepare("INSERT INTO friendships (requester_id, addressee_id, status, created_at) VALUES (?, ?, 'pending', ?)"),
  accept: db.prepare("UPDATE friendships SET status = 'accepted' WHERE requester_id = ? AND addressee_id = ? AND status = 'pending'"),
  remove: db.prepare(`DELETE FROM friendships
    WHERE (requester_id = @a AND addressee_id = @b) OR (requester_id = @b AND addressee_id = @a)`),
  friends: db.prepare(`SELECT u.username, u.share_progress AS share,
      (SELECT COUNT(*) FROM progress p WHERE p.user_id = u.id) AS done
    FROM friendships f
    JOIN users u ON u.id = CASE WHEN f.requester_id = @id THEN f.addressee_id ELSE f.requester_id END
    WHERE f.status = 'accepted' AND (f.requester_id = @id OR f.addressee_id = @id)
    ORDER BY u.username`),
  incoming: db.prepare(`SELECT u.username FROM friendships f JOIN users u ON u.id = f.requester_id
    WHERE f.addressee_id = ? AND f.status = 'pending' ORDER BY u.username`),
  outgoing: db.prepare(`SELECT u.username FROM friendships f JOIN users u ON u.id = f.addressee_id
    WHERE f.requester_id = ? AND f.status = 'pending' ORDER BY u.username`),
  countOut: db.prepare("SELECT COUNT(*) AS n FROM friendships WHERE requester_id = ? AND status = 'pending'"),
  countFriends: db.prepare("SELECT COUNT(*) AS n FROM friendships WHERE status = 'accepted' AND (requester_id = ? OR addressee_id = ?)"),
};

module.exports = {
  pair: (a, b) => q.pair.get({ a, b }),
  request: (from, to) => q.insert.run(from, to, Date.now()),
  accept: (me, from) => q.accept.run(from, me).changes > 0,
  remove: (a, b) => q.remove.run({ a, b }).changes > 0,
  pendingCount: (id) => q.countOut.get(id).n,
  friendCount: (id) => q.countFriends.get(id, id).n,
  overview: (id) => ({
    friends: q.friends.all({ id }).map((f) => ({ username: f.username, completed: f.share ? f.done : null })),
    incoming: q.incoming.all(id).map((r) => r.username),
    outgoing: q.outgoing.all(id).map((r) => r.username),
  }),
};
