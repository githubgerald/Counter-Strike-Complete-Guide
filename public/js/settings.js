import { readProgress, writeProgress, resetProgress } from './progress.js';

const SETTINGS_KEY = 'cs2guide.settings.v2';
const VALID = {
  theme: ['system', 'light', 'dark'],
  mode: ['guided', 'reference'],
  size: ['small', 'medium', 'large'],
};
const byId = (id) => document.getElementById(id);

function readSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY));
    return {
      theme: VALID.theme.includes(saved?.theme) ? saved.theme : 'light',
      mode: VALID.mode.includes(saved?.mode) ? saved.mode : 'guided',
      size: VALID.size.includes(saved?.size) ? saved.size : 'large',
      name: typeof saved?.name === 'string' ? saved.name.slice(0, 30) : '',
    };
  } catch (_) {
    return { theme: 'light', mode: 'guided', size: 'large', name: '' };
  }
}

function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch (_) {
    return false;
  }
}

function applySettings(settings) {
  const root = document.documentElement;
  if (settings.theme === 'system') delete root.dataset.theme;
  else root.dataset.theme = settings.theme;
  root.dataset.guideMode = settings.mode;
  root.dataset.size = settings.size;
}

function announce(message) {
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
  const contents = {
    format: 'cs2-movement-guide-progress',
    version: 2,
    exportedAt: new Date().toISOString(),
    progress: readProgress(),
  };
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
    const validIds = new Set([...document.querySelectorAll('.practice[data-module]')].map((box) => box.dataset.module));
    const clean = {};
    Object.entries(parsed.progress).forEach(([id, done]) => {
      if (validIds.has(id) && done === true) clean[id] = true;
    });
    const saved = writeProgress(clean);
    if (!saved) return announce('Browser storage is unavailable; progress was not imported.');
    location.reload();
  } catch (_) {
    announce('This file is not a valid CS2 Movement Guide backup.');
  }
}

export function initSettings() {
  const modal = byId('settings');
  const openButton = byId('open-settings');
  const closeButton = byId('settings-close');
  if (!modal || !openButton || !closeButton) return;

  const settings = readSettings();
  byId('theme-select').value = settings.theme;
  byId('mode-select').value = settings.mode;
  byId('size-select').value = settings.size;
  byId('name-input').value = settings.name;
  applySettings(settings);

  const open = () => {
    modal.hidden = false;
    document.body.classList.add('modal-open');
    modal.querySelector('.modal-tab.is-active')?.focus();
  };
  const close = () => {
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    openButton.focus();
  };
  openButton.addEventListener('click', open);
  closeButton.addEventListener('click', close);
  modal.addEventListener('click', (event) => { if (event.target === modal) close(); });
  document.addEventListener('keydown', (event) => {
    if (modal.hidden) return;
    if (event.key === 'Escape') close();
    if (event.key === 'Tab') {
      const focusable = [...modal.querySelectorAll('button:not([disabled]), select:not([disabled]), input:not([disabled]):not([type="file"])')]
        .filter((element) => !element.hidden && element.offsetParent !== null);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });

  document.querySelectorAll('.modal-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.modal-tab').forEach((item) => item.classList.toggle('is-active', item === tab));
      document.querySelectorAll('.settings-panel').forEach((panel) => { panel.hidden = panel.dataset.panel !== tab.dataset.tab; });
      const message = byId('settings-message');
      if (message) message.textContent = '';
    });
  });

  byId('theme-select').addEventListener('change', (event) => {
    settings.theme = event.target.value;
    applySettings(settings);
    if (!saveSettings(settings)) announce('Could not save this setting in browser storage.');
  });
  byId('mode-select').addEventListener('change', (event) => {
    settings.mode = event.target.value;
    applySettings(settings);
    if (!saveSettings(settings)) announce('Could not save this setting in browser storage.');
  });
  byId('size-select').addEventListener('change', (event) => {
    settings.size = event.target.value;
    applySettings(settings);
    if (!saveSettings(settings)) announce('Could not save this setting in browser storage.');
  });
  byId('name-input').addEventListener('input', (event) => {
    settings.name = event.target.value.trim().slice(0, 30);
    if (!saveSettings(settings)) announce('Could not save this profile in browser storage.');
  });

  byId('reset-progress').addEventListener('click', () => {
    if (!window.confirm('Reset all completed sections? Your theme and profile will be kept.')) return;
    const saved = resetProgress();
    announce(saved ? 'Section progress has been reset.' : 'Could not reset progress because browser storage is unavailable.');
  });
  byId('clear-data').addEventListener('click', () => {
    if (!window.confirm('Clear all guide settings and progress stored in this browser?')) return;
    try {
      localStorage.removeItem(SETTINGS_KEY);
      localStorage.removeItem('cs2guide.progress.v3');
    } catch (_) {
      announce('Browser storage is unavailable.');
      return;
    }
    location.reload();
  });
  byId('export-progress').addEventListener('click', exportProgress);
  byId('import-progress').addEventListener('click', () => byId('import-file').click());
  byId('import-file').addEventListener('change', (event) => {
    importProgress(event.target.files?.[0]);
    event.target.value = '';
  });
}
