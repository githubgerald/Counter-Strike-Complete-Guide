// End-to-end check of the account system and its protections. Run with: npm test
// Starts the app on a random port with a throwaway database.
const fs = require('fs');
const os = require('os');
const path = require('path');

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cs2guide-'));
process.env.DB_PATH = path.join(dir, 'test.db');
process.env.RATE_LIMIT_SCALE = '2';
process.env.SECURITY_CONTACT = '';

const app = require('../src/app');
const db = require('../src/db');

let passed = 0;
let failed = 0;
function check(name, condition, detail = '') {
  if (condition) { passed += 1; console.log(`  ok   ${name}`); } else { failed += 1; console.log(`  FAIL ${name} ${detail}`); }
}

async function main() {
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const origin = base;

  async function call(method, url, body, { cookie = '', csrf = '', origin: o = origin, type = 'application/json', raw } = {}) {
    const headers = {};
    if (o) headers.Origin = o;
    if (cookie) headers.Cookie = cookie;
    if (csrf) headers['X-CSRF-Token'] = csrf;
    if (body !== undefined || raw !== undefined) headers['Content-Type'] = type;
    const res = await fetch(base + url, { method, headers, body: raw !== undefined ? raw : (body !== undefined ? JSON.stringify(body) : undefined) });
    let json = null;
    try { json = await res.clone().json(); } catch (_) { /* not json */ }
    const setCookie = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
    const sid = setCookie.map((c) => c.split(';')[0]).find((c) => c.startsWith('cs2sid=')) || '';
    return { status: res.status, json, headers: res.headers, setCookie, cookie: sid };
  }

  const PW = 'correct horse battery staple';
  const PW2 = 'another long passphrase here';

  console.log('Pages and headers');
  const home = await fetch(base + '/');
  const html = await home.text();
  check('home page loads', home.status === 200);
  check('settings window has all six tabs', ['general', 'display', 'performance', 'account', 'friends', 'about'].every((t) => html.includes(`data-tab="${t}"`)));
  check('no inline scripts in the page', !/<script(?![^>]*\bsrc=)[^>]*>[^<]/.test(html));
  check('CSP header set', /default-src 'self'/.test(home.headers.get('content-security-policy') || ''));
  check('CSP blocks framing', /frame-ancestors 'none'/.test(home.headers.get('content-security-policy') || ''));
  check('x-powered-by hidden', !home.headers.get('x-powered-by'));
  check('nosniff set', home.headers.get('x-content-type-options') === 'nosniff');
  check('permissions policy set', Boolean(home.headers.get('permissions-policy')));
  check('robots.txt blocks /api/', (await (await fetch(base + '/robots.txt')).text()).includes('Disallow: /api/'));
  check('sitemap.xml is valid xml', (await (await fetch(base + '/sitemap.xml')).text()).startsWith('<?xml'));
  check('security.txt absent until configured', (await fetch(base + '/.well-known/security.txt')).status === 404);
  check('DELETE method refused', (await fetch(base + '/', { method: 'DELETE' })).status === 405);
  check('database folder is not served', (await fetch(base + '/data/test.db')).status === 404);

  console.log('Request protections');
  check('post without Origin is blocked', (await call('POST', '/api/auth/signup', { username: 'x' }, { origin: '' })).status === 403);
  check('post from another site is blocked', (await call('POST', '/api/auth/signup', { username: 'x' }, { origin: 'https://evil.example' })).status === 403);
  check('non-JSON body is refused', (await call('POST', '/api/auth/signup', undefined, { raw: 'a=b', type: 'application/x-www-form-urlencoded' })).status === 415);
  check('oversized body is refused', (await call('POST', '/api/auth/login', { username: 'a'.repeat(30000) })).status === 413);
  check('broken JSON is refused', (await call('POST', '/api/auth/login', undefined, { raw: '{bad' })).status === 400);

  console.log('Sign up');
  check('bad username rejected', (await call('POST', '/api/auth/signup', { username: 'a b', password: PW })).status === 400);
  check('short password rejected', (await call('POST', '/api/auth/signup', { username: 'alice', password: 'short' })).status === 400);
  check('honeypot rejected', (await call('POST', '/api/auth/signup', { username: 'botty', password: PW, website: 'x' })).status === 400);
  const a = await call('POST', '/api/auth/signup', { username: 'Alice', password: PW });
  check('account created', a.status === 201 && a.json.user.username === 'alice');
  check('recovery code returned once', /^[0-9A-Z]{4}(-[0-9A-Z]{4}){4}$/.test(a.json.recoveryCode));
  check('session cookie is HttpOnly and SameSite=Lax', /HttpOnly/i.test(a.setCookie[0]) && /SameSite=Lax/i.test(a.setCookie[0]));
  check('duplicate username rejected', (await call('POST', '/api/auth/signup', { username: 'ALICE', password: PW })).status === 409);
  const b = await call('POST', '/api/auth/signup', { username: 'bob', password: PW });
  check('second account created', b.status === 201);

  console.log('Sessions');
  const me = await call('GET', '/api/me', undefined, { cookie: a.cookie });
  check('me returns the user and a csrf token', me.json.user.username === 'alice' && me.json.csrf === a.json.csrf);
  check('api responses are not cached', (me.headers.get('cache-control') || '').includes('no-store'));
  check('signed-out me is empty', (await call('GET', '/api/me')).json.user === null);
  check('forged cookie is ignored', (await call('GET', '/api/me', undefined, { cookie: 'cs2sid=' + 'A'.repeat(43) })).json.user === null);

  console.log('Progress');
  check('progress needs a csrf token', (await call('PUT', '/api/progress', { modules: ['cat-ground'] }, { cookie: a.cookie })).status === 403);
  check('unknown module rejected', (await call('PUT', '/api/progress', { modules: ['nope'] }, { cookie: a.cookie, csrf: a.json.csrf })).status === 400);
  check('progress saved', (await call('PUT', '/api/progress', { modules: ['cat-ground', 'cat-air'] }, { cookie: a.cookie, csrf: a.json.csrf })).status === 200);
  check('progress read back', (await call('GET', '/api/progress', undefined, { cookie: a.cookie })).json.modules.length === 2);
  check('progress needs sign-in', (await call('GET', '/api/progress')).status === 401);

  console.log('Sign in');
  const bad1 = await call('POST', '/api/auth/login', { username: 'alice', password: 'wrong password here' });
  const bad2 = await call('POST', '/api/auth/login', { username: 'nobody', password: 'wrong password here' });
  check('wrong password gives 401', bad1.status === 401);
  check('unknown user gives the same message (no account leak)', bad2.status === 401 && bad1.json.error === bad2.json.error);
  const a2 = await call('POST', '/api/auth/login', { username: 'alice', password: PW });
  check('sign in works', a2.status === 200 && a2.json.user.username === 'alice');
  check('each sign-in gets a new session', a2.cookie !== a.cookie);

  console.log('Friends');
  const bobMe = b.json;
  check('friend actions need csrf', (await call('POST', '/api/friends/request', { username: 'bob' }, { cookie: a.cookie })).status === 403);
  check('cannot add yourself', (await call('POST', '/api/friends/request', { username: 'alice' }, { cookie: a.cookie, csrf: a.json.csrf })).status === 400);
  const unknown = await call('POST', '/api/friends/request', { username: 'ghost' }, { cookie: a.cookie, csrf: a.json.csrf });
  check('unknown username looks like success', unknown.status === 200 && unknown.json.outgoing.length === 0);
  const req = await call('POST', '/api/friends/request', { username: 'bob' }, { cookie: a.cookie, csrf: a.json.csrf });
  check('request sent', req.json.outgoing[0] === 'bob');
  const bobList = await call('GET', '/api/friends', undefined, { cookie: b.cookie });
  check('other user sees the request', bobList.json.incoming[0] === 'alice');
  check('only the addressee can accept', (await call('POST', '/api/friends/accept', { username: 'bob' }, { cookie: a.cookie, csrf: a.json.csrf })).status === 404);
  const acc = await call('POST', '/api/friends/accept', { username: 'alice' }, { cookie: b.cookie, csrf: bobMe.csrf });
  check('request accepted', acc.json.friends[0].username === 'alice');
  check('progress hidden by default', (await call('GET', '/api/friends', undefined, { cookie: a.cookie })).json.friends[0].completed === null);
  await call('PUT', '/api/account/settings', { shareProgress: true }, { cookie: a.cookie, csrf: a.json.csrf });
  check('progress shared when allowed', (await call('GET', '/api/friends', undefined, { cookie: b.cookie })).json.friends[0].completed === 2);

  console.log('Account');
  check('wrong current password refused', (await call('POST', '/api/account/password', { current: 'nope nope nope nope', next: PW2 }, { cookie: a.cookie, csrf: a.json.csrf })).status === 400);
  check('weak new password refused', (await call('POST', '/api/account/password', { current: PW, next: 'short' }, { cookie: a.cookie, csrf: a.json.csrf })).status === 400);
  check('password changed', (await call('POST', '/api/account/password', { current: PW, next: PW2 }, { cookie: a.cookie, csrf: a.json.csrf })).status === 200);
  check('other sessions ended after password change', (await call('GET', '/api/me', undefined, { cookie: a2.cookie })).json.user === null);
  check('current session kept', (await call('GET', '/api/me', undefined, { cookie: a.cookie })).json.user !== null);
  const exported = await call('GET', '/api/account/export', undefined, { cookie: a.cookie });
  check('export has the data', exported.json.username === 'alice' && exported.json.completedModules.length === 2);
  check('export has no secrets', !/hash|scrypt|csrf/i.test(JSON.stringify(exported.json)));

  console.log('Recovery');
  const wrongRecover = await call('POST', '/api/auth/recover', { username: 'bob', recoveryCode: 'AAAA-AAAA-AAAA-AAAA-AAAA', newPassword: PW2 });
  check('wrong recovery code refused', wrongRecover.status === 400);
  const rec = await call('POST', '/api/auth/recover', { username: 'bob', recoveryCode: b.json.recoveryCode.toLowerCase(), newPassword: PW2 });
  check('recovery works and returns a new code', rec.status === 200 && rec.json.recoveryCode !== b.json.recoveryCode);
  check('old sessions ended by recovery', (await call('GET', '/api/me', undefined, { cookie: b.cookie })).json.user === null);
  check('old password no longer works', (await call('POST', '/api/auth/login', { username: 'bob', password: PW })).status === 401);
  const b2 = await call('POST', '/api/auth/login', { username: 'bob', password: PW2 });
  check('new password works', b2.status === 200);

  console.log('Storage');
  const files = [process.env.DB_PATH, process.env.DB_PATH + '-wal'].filter((f) => fs.existsSync(f));
  const bytes = Buffer.concat(files.map((f) => fs.readFileSync(f))).toString('latin1');
  check('no plaintext passwords in the database', !bytes.includes(PW) && !bytes.includes(PW2));
  check('no raw session tokens in the database', !bytes.includes(a.cookie.replace('cs2sid=', '')));
  check('passwords stored as scrypt hashes', bytes.includes('scrypt$32768$8$3$'));

  console.log('Sign out and delete');
  check('sign out works', (await call('POST', '/api/auth/logout', {}, { cookie: a.cookie, csrf: a.json.csrf })).status === 200);
  check('session is gone after sign out', (await call('GET', '/api/me', undefined, { cookie: a.cookie })).json.user === null);
  const a3 = await call('POST', '/api/auth/login', { username: 'alice', password: PW2 });
  check('delete needs the password', (await call('POST', '/api/account/delete', { password: 'wrong wrong wrong' }, { cookie: a3.cookie, csrf: a3.json.csrf })).status === 400);
  check('account deleted', (await call('POST', '/api/account/delete', { password: PW2 }, { cookie: a3.cookie, csrf: a3.json.csrf })).status === 200);
  check('deleted user cannot sign in', (await call('POST', '/api/auth/login', { username: 'alice', password: PW2 })).status === 401);
  check('friendship removed with the account', (await call('GET', '/api/friends', undefined, { cookie: b2.cookie })).json.friends.length === 0);

  console.log('Brute force protection');
  for (let i = 0; i < 10; i += 1) await call('POST', '/api/auth/login', { username: 'bob', password: 'guess guess guess ' + i });
  const locked = await call('POST', '/api/auth/login', { username: 'bob', password: PW2 });
  check('account locks after repeated failures (even the right password is refused)', locked.status === 401);
  let limited = 0;
  for (let i = 0; i < 25 && !limited; i += 1) {
    const r = await call('POST', '/api/auth/login', { username: 'nobody' + i, password: 'guess guess guess' });
    if (r.status === 429) limited = i + 1;
  }
  check('login attempts are rate limited', limited > 0, '(no 429 after 25 tries)');

  server.close();
  db.close();
  fs.rmSync(dir, { recursive: true, force: true });
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}

main().catch((err) => { console.error(err); process.exit(1); });
