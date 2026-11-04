// Saved progress: which modules are complete. Stored in localStorage on this device,
// and copied to the account when signed in (see account.js).
const STORAGE_KEY = 'cs2guide.progress.v3';
export const PROGRESS_EVENT = 'cs2guide:progress';

function validModuleIds() {
  return new Set([...document.querySelectorAll('.practice[data-module]')].map((box) => box.dataset.module));
}

export function moduleIds() { return [...validModuleIds()]; }

// Read progress and keep only valid entries (storage can be edited by the user)
export function readProgress() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
    const valid = validModuleIds();
    return Object.fromEntries(Object.entries(raw).filter(([id, done]) => valid.has(id) && done === true));
  } catch (_) { return {}; }
}

export function writeProgress(progress) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); return true; } catch (_) { return false; }
}

// Tick completed modules in the sidebar and collapse their checklist and quiz
export function paintProgress(progress = readProgress()) {
  document.querySelectorAll('.nav-category[data-module]').forEach((link) => {
    link.classList.toggle('done', progress[link.dataset.module] === true);
  });
  document.querySelectorAll('.practice[data-module]').forEach((box) => {
    const done = progress[box.dataset.module] === true;
    box.classList.toggle('is-complete', done);
    ['.practice-prompt', '.checklist', '.quiz-actions', '.quiz'].forEach((sel) => {
      box.querySelectorAll(`:scope > ${sel}`).forEach((el) => {
        if (done) el.hidden = true;
        else if (sel === '.practice-prompt' || sel === '.checklist') el.hidden = false; // shown again after a reset
      });
    });
    const note = box.querySelector('.practice-done');
    if (note) note.hidden = !done;
  });
  const count = document.getElementById('progress-count');
  if (count) count.textContent = Object.keys(progress).length;
}

export function markComplete(moduleId) {
  if (!validModuleIds().has(moduleId)) return false;
  const progress = readProgress();
  progress[moduleId] = true;
  const saved = writeProgress(progress);
  paintProgress(progress);
  document.dispatchEvent(new CustomEvent(PROGRESS_EVENT));
  return saved;
}

export function resetProgress() {
  const saved = writeProgress({});
  paintProgress({});
  document.dispatchEvent(new CustomEvent(PROGRESS_EVENT));
  return saved;
}
