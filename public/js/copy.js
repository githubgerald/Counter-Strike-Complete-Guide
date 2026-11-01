// Copy buttons: command chips (data-copy) and the autoexec boxes (data-copy-target).
async function writeClipboard(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch (_) {
    const area = document.createElement('textarea');
    area.value = text; area.setAttribute('readonly', ''); area.style.position = 'fixed'; area.style.opacity = '0';
    document.body.appendChild(area); area.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (_) { ok = false; }
    area.remove();
    return ok;
  }
}

export function initCopy() {
  document.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-copy], [data-copy-target]');
    if (!button) return;
    const text = button.dataset.copyTarget ? (document.getElementById(button.dataset.copyTarget)?.value || '') : button.dataset.copy;
    const ok = await writeClipboard(text);
    const original = button.dataset.label || button.textContent;
    button.dataset.label = original;
    button.classList.add('is-copied');
    if (button.classList.contains('btn')) button.textContent = ok ? 'Copied' : 'Press Ctrl+C';
    window.setTimeout(() => { button.classList.remove('is-copied'); if (button.classList.contains('btn')) button.textContent = original; }, 1400);
  });
}
