// Settings window: tabs, display and performance settings, local data tools.
// Account and friends screens live in account.js.
import { readProgress, writeProgress, resetProgress, moduleIds } from './progress.js';
import { SETTINGS_EVENT } from './prefs.js';

const SETTINGS_KEY = 'cs2guide.settings.v2';

// Every setting: its allowed values and its default. Anything else is ignored.
const DEFINITIONS = {
  theme: { values: ['system', 'light', 'dark'], fallback: 'light' },
  mode: { values: ['guided', 'reference'], fallback: 'guided' },
  size: { values: ['small', 'medium', 'large'], fallback: 'large' },
  spacing: { values: ['compact', 'normal', 'relaxed'], fallback: 'normal' },
  width: { values: ['narrow', 'standard', 'wide'], fallback: 'standard' },
  contrast: { values: ['standard', 'high'], fallback: 'standard' },
  motion: { values: ['system', 'reduce'], fallback: 'system' },
  cues: { values: ['animated', 'still'], fallback: 'animated' },
  autoplay: { values: ['on', 'off'], fallback: 'on' },
  saver: { values: ['off', 'on'], fallback: 'off' },
};
const byId = (id) => document.getElementById(id);

function readSettings() {
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(SETTINGS_KEY)); } catch (_) { saved = null; }
  const settings = {};
  Object.entries(DEFINITIONS).forEach(([key, def]) => {
    settings[key] = def.values.includes(saved && saved[key]) ? saved[key] : def.fallback;
  });
  return settings;
}

function saveSettings(settings) {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); return true; } catch (_) { return false; }
}

// Put each setting on the <html> element. CSS and the other scripts read them from there.
function applySettings(settings) {
  const root = document.documentElement;
  // "System" follows the device's light or dark setting
  root.dataset.theme = settings.theme === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : settings.theme;
  root.dataset.guideMode = settings.mode;
  ['size', 'spacing', 'width', 'contrast', 'motion', 'cues', 'autoplay', 'saver'].forEach((key) => { root.dataset[key] = settings[key]; });
  document.dispatchEvent(new CustomEvent(SETTINGS_EVENT));
}

export function announce(message) {
  const target = byId('settings-message');
  if (target) target.textContent = message;
  const toast = byId('toast');
  if (toast) {
    toast.textContent = message;
    toast.hidden = false;
    window.clearTimeout(announce.timeout);
    announce.timeout = window.setTimeout(() => { toast.hidden = true; }, 2600);
  }
}

function exportProgress() {
  const contents = { format: 'cs2-movement-guide-progress', version: 2, exportedAt: new Date().toISOString(), progress: readProgress() };
  const blob = new Blob([JSON.stringify(contents, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'cs2-movement-guide-progress.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1200);
  announce('Progress backup exported.');
}

async function importProgress(file) {
  if (!file) return;
  if (file.size > 50000) return announce('That file is too large to be a guide progress backup.');
  try {
    const parsed = JSON.parse(await file.text());
    if (parsed.format !== 'cs2-movement-guide-progress' || !parsed.progress || typeof parsed.progress !== 'object' || Array.isArray(parsed.progress)) {
      throw new Error('Unsupported backup format');
    }
    const valid = new Set(moduleIds());
    const clean = {};
    Object.entries(parsed.progress).forEach(([id, done]) => { if (valid.has(id) && done === true) clean[id] = true; });
    if (!writeProgress(clean)) return announce('Browser storage is unavailable; progress was not imported.');
    return location.reload();
  } catch (_) {
    return announce('This file is not a valid CS2 Movement Guide backup.');
  }
}

export function initSettings() {
  const modal = byId('settings');
  const openButton = byId('open-settings');
  const closeButton = byId('settings-close');
  if (!modal || !openButton || !closeButton) return;

  const settings = readSettings();
  document.querySelectorAll('[data-setting]').forEach((select) => { select.value = settings[select.dataset.setting]; });
  applySettings(settings);
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if (settings.theme === 'system') applySettings(settings); });

  // Open, close and keep keyboard focus inside the window
  const open = () => { modal.hidden = false; document.body.classList.add('modal-open'); modal.querySelector('.modal-tab.is-active')?.focus(); };
  const close = () => { modal.hidden = true; document.body.classList.remove('modal-open'); openButton.focus(); };
  openButton.addEventListener('click', open);
  closeButton.addEventListener('click', close);
  modal.addEventListener('click', (event) => { if (event.target === modal) close(); });
  document.addEventListener('keydown', (event) => {
    if (modal.hidden) return;
    if (event.key === 'Escape') close();
    if (event.key === 'Tab') {
      const focusable = [...modal.querySelectorAll('button:not([disabled]), select:not([disabled]), input:not([disabled]):not([type="file"]):not(.hp), a[href]')]
        .filter((el) => el.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });

  // Tabs
  document.querySelectorAll('.modal-tab').forEach((tab) => tab.addEventListener('click', () => {
    document.querySelectorAll('.modal-tab').forEach((item) => item.classList.toggle('is-active', item === tab));
    document.querySelectorAll('.settings-panel').forEach((panel) => { panel.hidden = panel.dataset.panel !== tab.dataset.tab; });
    byId('settings-message').textContent = '';
    modal.querySelector('.modal-body').scrollTop = 0;
  }));

  // One handler for every display and performance setting
  document.querySelectorAll('[data-setting]').forEach((select) => select.addEventListener('change', () => {
    const key = select.dataset.setting;
    if (!DEFINITIONS[key].values.includes(select.value)) return;
    settings[key] = select.value;
    // Data saver implies autoplay off
    if (key === 'saver' && select.value === 'on') { settings.autoplay = 'off'; document.querySelector('[data-setting="autoplay"]').value = 'off'; }
    applySettings(settings);
    if (!saveSettings(settings)) announce('Could not save this setting in browser storage.');
  }));

  byId('reset-progress').addEventListener('click', () => {
    if (!window.confirm('Mark every module as not completed? If you are signed in, your saved progress is cleared too.')) return;
    announce(resetProgress() ? 'Progress has been reset.' : 'Could not reset progress because browser storage is unavailable.');
  });
  byId('clear-data').addEventListener('click', () => {
    if (!window.confirm('Clear all guide settings and progress stored in this browser? Your account, if any, is not affected.')) return;
    try { localStorage.removeItem(SETTINGS_KEY); localStorage.removeItem('cs2guide.progress.v3'); } catch (_) { announce('Browser storage is unavailable.'); return; }
    location.reload();
  });
  byId('export-progress').addEventListener('click', exportProgress);
  byId('import-progress').addEventListener('click', () => byId('import-file').click());
  byId('import-file').addEventListener('change', (event) => { importProgress(event.target.files?.[0]); event.target.value = ''; });
}
