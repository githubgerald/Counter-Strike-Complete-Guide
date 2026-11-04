// Account screens inside the settings window: sign up, sign in, details, security, friends,
// and progress sync. All text from the server is shown with textContent, never as HTML.
import { api, setCsrf } from './api.js';
import { readProgress, writeProgress, paintProgress, moduleIds, PROGRESS_EVENT } from './progress.js';
import { announce } from './settings.js';

const byId = (id) => document.getElementById(id);
let me = null;
let syncTimer = 0;

const formData = (form) => Object.fromEntries(new FormData(form).entries());
const show = (el, visible) => { if (el) el.hidden = !visible; };
const fail = (error) => announce(error.message || 'Something went wrong.');
function busy(form, on) { form.querySelectorAll('button[type="submit"]').forEach((b) => { b.disabled = on; }); }

// ---------- Progress sync: the account keeps the union of this device and the server ----------
async function pullAndMerge() {
  const server = (await api('/progress')).modules;
  const local = readProgress();
  const valid = new Set(moduleIds());
  const merged = { ...local };
  server.forEach((id) => { if (valid.has(id)) merged[id] = true; });
  writeProgress(merged);
  paintProgress(merged);
  if (Object.keys(merged).length !== server.length) await api('/progress', { method: 'PUT', body: { modules: Object.keys(merged) } });
}

function pushSoon() {
  if (!me) return;
  window.clearTimeout(syncTimer);
  syncTimer = window.setTimeout(() => {
    api('/progress', { method: 'PUT', body: { modules: Object.keys(readProgress()) } }).catch(() => announce('Could not save progress to your account.'));
  }, 600);
}

// ---------- Rendering ----------
function renderAccount() {
  const signedIn = Boolean(me);
  show(byId('account-out'), !signedIn && byId('recovery-box').hidden);
  show(byId('account-in'), signedIn && byId('recovery-box').hidden);
  show(byId('friends-in'), signedIn);
  show(byId('friends-out'), !signedIn);
  if (!signedIn) return;
  byId('acc-name').textContent = me.username;
  byId('acc-since').textContent = `Member since ${new Date(me.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}`;
  byId('share-select').value = me.shareProgress ? 'on' : 'off';
}

function personRow(name, detail, buttons) {
  const li = document.createElement('li');
  const text = document.createElement('div');
  const strong = document.createElement('strong');
  strong.textContent = name;
  text.append(strong);
  if (detail) { const small = document.createElement('span'); small.textContent = detail; text.append(small); }
  li.append(text);
  const actions = document.createElement('div');
  actions.className = 'button-pair';
  buttons.forEach(([label, handler]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn-subtle';
    button.textContent = label;
    button.addEventListener('click', handler);
    actions.append(button);
  });
  li.append(actions);
  return li;
}

function renderFriends(data) {
  const total = moduleIds().length;
  const fill = (id, rows, empty) => {
    const list = byId(id);
    list.replaceChildren(...(rows.length ? rows : [Object.assign(document.createElement('li'), { className: 'people-empty', textContent: empty })]));
  };
  const act = (path, name) => () => api(path, { method: 'POST', body: { username: name } }).then(renderFriends).catch(fail);
  fill('friends-incoming', data.incoming.map((n) => personRow(n, '', [['Accept', act('/friends/accept', n)], ['Decline', act('/friends/remove', n)]])), 'No requests.');
  fill('friends-list', data.friends.map((f) => personRow(f.username, f.completed === null ? 'Progress hidden' : `${f.completed} of ${total} modules`, [['Remove', act('/friends/remove', f.username)]])), 'No friends yet.');
  fill('friends-outgoing', data.outgoing.map((n) => personRow(n, 'Waiting for a reply', [['Cancel', act('/friends/remove', n)]])), 'No pending requests.');
}

const loadFriends = () => api('/friends').then(renderFriends).catch(fail);

// ---------- Sign in state ----------
async function setUser(data) {
  me = data.user;
  setCsrf(data.csrf);
  renderAccount();
  if (me) {
    try { await pullAndMerge(); } catch (_) { announce('Signed in, but progress could not be synced.'); }
    loadFriends();
  }
}

async function refresh() {
  try { await setUser(await api('/me')); } catch (_) { renderAccount(); }
}

function signedOut(message) {
  me = null;
  setCsrf('');
  renderAccount();
  if (message) announce(message);
}

// ---------- Forms ----------
function switchAuthTab(name) {
  document.querySelectorAll('[data-auth-tab]').forEach((b) => b.classList.toggle('is-active', b.dataset.authTab === name));
  document.querySelectorAll('[data-auth-panel]').forEach((f) => { f.hidden = f.dataset.authPanel !== name; });
  announce('');
}

function wireForms() {
  document.querySelectorAll('[data-auth-tab]').forEach((b) => b.addEventListener('click', () => switchAuthTab(b.dataset.authTab)));

  byId('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    busy(form, true);
    try {
      await setUser(await api('/auth/login', { method: 'POST', body: formData(form) }));
      form.reset();
      announce('Signed in.');
    } catch (err) { fail(err); } finally { busy(form, false); }
  });

  byId('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const values = formData(form);
    if (values.password !== values.confirm) return announce('The two passwords do not match.');
    busy(form, true);
    try {
      const data = await api('/auth/signup', { method: 'POST', body: { username: values.username, password: values.password, website: values.website } });
      form.reset();
      byId('recovery-code').textContent = data.recoveryCode;
      show(byId('recovery-box'), true);
      show(byId('account-out'), false);
      await setUser(data);
      show(byId('account-in'), false); // keep the recovery code on screen until it is acknowledged
      announce('Account created. Save your recovery code.');
    } catch (err) { fail(err); } finally { busy(form, false); }
  });

  byId('recovery-copy').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(byId('recovery-code').textContent); announce('Recovery code copied.'); } catch (_) { announce('Select the code and copy it manually.'); }
  });
  byId('recovery-done').addEventListener('click', () => {
    byId('recovery-code').textContent = '';
    show(byId('recovery-box'), false);
    renderAccount();
  });

  byId('recover-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const values = formData(form);
    busy(form, true);
    try {
      const data = await api('/auth/recover', { method: 'POST', body: { username: values.username, recoveryCode: values.code, newPassword: values.password } });
      form.reset();
      byId('recovery-code').textContent = data.recoveryCode;
      show(byId('recovery-box'), true);
      show(byId('account-out'), false);
      announce('Password reset. Save your new recovery code, then sign in.');
    } catch (err) { fail(err); } finally { busy(form, false); }
  });

  byId('logout-btn').addEventListener('click', () => api('/auth/logout', { method: 'POST', body: {} }).then(() => signedOut('Signed out.')).catch(fail));
  byId('logout-all').addEventListener('click', () => {
    if (window.confirm('Sign out on every device?')) api('/account/sign-out-everywhere', { method: 'POST', body: {} }).then(() => signedOut('Signed out everywhere.')).catch(fail);
  });

  byId('share-select').addEventListener('change', (e) => {
    api('/account/settings', { method: 'PUT', body: { shareProgress: e.target.value === 'on' } })
      .then((d) => { me.shareProgress = d.shareProgress; announce(d.shareProgress ? 'Friends can now see your progress.' : 'Your progress is hidden from friends.'); })
      .catch((err) => { fail(err); e.target.value = me.shareProgress ? 'on' : 'off'; });
  });

  byId('password-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const values = formData(form);
    if (values.next !== values.confirm) return announce('The two new passwords do not match.');
    busy(form, true);
    try {
      await api('/account/password', { method: 'POST', body: { current: values.current, next: values.next } });
      form.reset();
      announce('Password changed. Other devices were signed out.');
    } catch (err) { fail(err); } finally { busy(form, false); }
  });

  byId('export-account').addEventListener('click', async () => {
    try {
      const data = await api('/account/export');
      const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
      const link = Object.assign(document.createElement('a'), { href: url, download: 'cs2-guide-account-data.json' });
      document.body.append(link); link.click(); link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1200);
    } catch (err) { fail(err); }
  });

  byId('delete-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!window.confirm('Permanently delete your account, progress and friends?')) return;
    busy(form, true);
    try {
      await api('/account/delete', { method: 'POST', body: { password: formData(form).password } });
      form.reset();
      signedOut('Your account was deleted.');
    } catch (err) { fail(err); } finally { busy(form, false); }
  });

  byId('friend-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    busy(form, true);
    try {
      renderFriends(await api('/friends/request', { method: 'POST', body: { username: formData(form).username } }));
      form.reset();
      announce('If that username exists, a request is on its way.');
    } catch (err) { fail(err); } finally { busy(form, false); }
  });
}

export function initAccount() {
  if (!byId('account-out')) return;
  wireForms();
  document.addEventListener(PROGRESS_EVENT, pushSoon);
  refresh();
}
