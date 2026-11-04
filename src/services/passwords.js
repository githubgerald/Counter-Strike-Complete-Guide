// Password and recovery-code hashing with scrypt (built into Node, OWASP-approved settings).
// A small queue limits how many hashes run at once, so a flood of logins cannot exhaust memory.
const crypto = require('crypto');
const { promisify } = require('util');

const scrypt = promisify(crypto.scrypt);
const PARAMS = { N: 32768, r: 8, p: 3, maxmem: 96 * 1024 * 1024 }; // OWASP: N=2^15, r=8, p=3
const KEY_LENGTH = 32;
const MAX_CONCURRENT = 2;
const MAX_QUEUE = 40;
let running = 0;
const waiting = [];

function acquire() {
  if (running < MAX_CONCURRENT) { running += 1; return Promise.resolve(); }
  if (waiting.length >= MAX_QUEUE) return Promise.reject(Object.assign(new Error('busy'), { status: 503 }));
  return new Promise((resolve) => waiting.push(resolve));
}
function release() {
  const next = waiting.shift();
  if (next) next(); else running -= 1;
}

async function hashSecret(secret) {
  await acquire();
  try {
    const salt = crypto.randomBytes(16);
    const key = await scrypt(secret.normalize('NFKC'), salt, KEY_LENGTH, PARAMS);
    return ['scrypt', PARAMS.N, PARAMS.r, PARAMS.p, salt.toString('base64'), key.toString('base64')].join('$');
  } finally { release(); }
}

async function verifySecret(secret, stored) {
  const parts = String(stored).split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;
  const [, N, r, p, salt, key] = parts;
  const expected = Buffer.from(key, 'base64');
  await acquire();
  try {
    const actual = await scrypt(secret.normalize('NFKC'), Buffer.from(salt, 'base64'), expected.length, { N: Number(N), r: Number(r), p: Number(p), maxmem: PARAMS.maxmem });
    return crypto.timingSafeEqual(actual, expected);
  } finally { release(); }
}

// Used for unknown usernames so a missing account takes as long as a wrong password.
let dummy = null;
async function dummyVerify() {
  if (!dummy) dummy = await hashSecret('not-a-real-password');
  await verifySecret('another-wrong-guess', dummy);
}

// A short list of passwords that are always rejected (no outside service is called).
const COMMON = new Set(['password1234', 'passwordpassword', '123456789012', '1234567890123', 'qwertyuiop12', 'qwertyuiopasdf', 'iloveyou1234', 'letmein123456', 'welcome12345', 'admin1234567', 'counterstrike', 'counterstrike2', 'cs2movement', 'bunnyhop1234', 'abcdefghijkl', 'aaaaaaaaaaaa', 'passw0rd1234', 'monkey123456', 'football1234', 'baseball1234']);

function checkPassword(password, username = '') {
  if (typeof password !== 'string') return 'Enter a password.';
  const length = [...password].length;
  if (length < 12) return 'Use at least 12 characters.';
  if (length > 128) return 'Use at most 128 characters.';
  const lower = password.toLowerCase();
  if (COMMON.has(lower) || /^(.)\1+$/.test(password)) return 'That password is too easy to guess.';
  if (username.length >= 3 && lower.includes(username.toLowerCase())) return 'Do not include your username in your password.';
  return null;
}

// 100-bit recovery code, shown once: XXXX-XXXX-XXXX-XXXX-XXXX
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
function generateRecoveryCode() {
  const chars = Array.from({ length: 20 }, () => ALPHABET[crypto.randomInt(ALPHABET.length)]);
  return chars.join('').match(/.{4}/g).join('-');
}
function normaliseRecovery(code) {
  return String(code || '').toUpperCase().replace(/[^0-9A-Z]/g, '').replace(/[IL]/g, '1').replace(/O/g, '0');
}

module.exports = { hashSecret, verifySecret, dummyVerify, checkPassword, generateRecoveryCode, normaliseRecovery };
