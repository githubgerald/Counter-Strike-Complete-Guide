// User, session and progress queries.
const db = require('./index');

const q = {
  byName: db.prepare('SELECT * FROM users WHERE username = ?'),
  byId: db.prepare('SELECT * FROM users WHERE id = ?'),
  insert: db.prepare('INSERT INTO users (username, pass_hash, recovery_hash, created_at) VALUES (?, ?, ?, ?)'),
  setPassword: db.prepare('UPDATE users SET pass_hash = ?, failed_logins = 0, locked_until = 0 WHERE id = ?'),
  setRecovery: db.prepare('UPDATE users SET pass_hash = ?, recovery_hash = ?, failed_logins = 0, locked_until = 0 WHERE id = ?'),
  setShare: db.prepare('UPDATE users SET share_progress = ? WHERE id = ?'),
  fail: db.prepare(`UPDATE users SET
      failed_logins = CASE WHEN failed_logins + 1 >= 10 THEN 0 ELSE failed_logins + 1 END,
      locked_until  = CASE WHEN failed_logins + 1 >= 10 THEN ? ELSE locked_until END
    WHERE id = ?`),
  clearFails: db.prepare('UPDATE users SET failed_logins = 0, locked_until = 0 WHERE id = ?'),
  remove: db.prepare('DELETE FROM users WHERE id = ?'),
  progressList: db.prepare('SELECT module_id FROM progress WHERE user_id = ? ORDER BY module_id'),
  progressDelete: db.prepare('DELETE FROM progress WHERE user_id = ?'),
  progressInsert: db.prepare('INSERT OR IGNORE INTO progress (user_id, module_id, completed_at) VALUES (?, ?, ?)'),
};

module.exports = {
  byName: (name) => q.byName.get(name),
  byId: (id) => q.byId.get(id),
  create: (name, passHash, recoveryHash) => {
    const info = q.insert.run(name, passHash, recoveryHash, Date.now());
    return q.byId.get(info.lastInsertRowid);
  },
  setPassword: (id, hash) => q.setPassword.run(hash, id),
  resetWithRecovery: (id, passHash, recoveryHash) => q.setRecovery.run(passHash, recoveryHash, id),
  setShare: (id, on) => q.setShare.run(on ? 1 : 0, id),
  recordFailure: (id) => q.fail.run(Date.now() + 15 * 60 * 1000, id),
  clearFailures: (id) => q.clearFails.run(id),
  remove: (id) => q.remove.run(id),
  getProgress: (id) => q.progressList.all(id).map((r) => r.module_id),
  replaceProgress: db.transaction((id, modules) => {
    q.progressDelete.run(id);
    const now = Date.now();
    modules.forEach((m) => q.progressInsert.run(id, m, now));
  }),
};
