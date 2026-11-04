// SQLite database: opens the file, applies safe settings, and runs migrations.
// All queries use prepared statements with bound values, never string building.
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const { dbPath } = require('../config');

fs.mkdirSync(path.dirname(dbPath), { recursive: true, mode: 0o700 });
const db = new Database(dbPath);
try { fs.chmodSync(dbPath, 0o600); } catch (_) { /* not supported on every system */ }

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.pragma('busy_timeout = 5000');
db.pragma('synchronous = NORMAL');
db.pragma('trusted_schema = OFF');

// Each entry runs once, in order. Never edit an old entry: add a new one.
const MIGRATIONS = [
  `CREATE TABLE users (
     id              INTEGER PRIMARY KEY,
     username        TEXT    NOT NULL UNIQUE COLLATE NOCASE,
     pass_hash       TEXT    NOT NULL,
     recovery_hash   TEXT    NOT NULL,
     share_progress  INTEGER NOT NULL DEFAULT 0,
     failed_logins   INTEGER NOT NULL DEFAULT 0,
     locked_until    INTEGER NOT NULL DEFAULT 0,
     created_at      INTEGER NOT NULL
   );
   CREATE TABLE sessions (
     id_hash     TEXT PRIMARY KEY,
     user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     csrf        TEXT    NOT NULL,
     created_at  INTEGER NOT NULL,
     last_seen   INTEGER NOT NULL,
     expires_at  INTEGER NOT NULL,
     user_agent  TEXT
   );
   CREATE INDEX sessions_user ON sessions(user_id);
   CREATE TABLE progress (
     user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     module_id     TEXT    NOT NULL,
     completed_at  INTEGER NOT NULL,
     PRIMARY KEY (user_id, module_id)
   );
   CREATE TABLE friendships (
     id            INTEGER PRIMARY KEY,
     requester_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     addressee_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     status        TEXT    NOT NULL CHECK (status IN ('pending', 'accepted')),
     created_at    INTEGER NOT NULL,
     CHECK (requester_id <> addressee_id)
   );
   CREATE UNIQUE INDEX friendship_pair ON friendships (MIN(requester_id, addressee_id), MAX(requester_id, addressee_id));
   CREATE INDEX friendship_addressee ON friendships(addressee_id);`,
];

const applied = db.pragma('user_version', { simple: true });
MIGRATIONS.slice(applied).forEach((sql, i) => {
  db.transaction(() => { db.exec(sql); db.pragma(`user_version = ${applied + i + 1}`); })();
});

module.exports = db;
