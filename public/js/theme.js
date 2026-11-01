// Apply saved preferences before the stylesheet paints the page.
(function () {
  try {
    const saved = JSON.parse(localStorage.getItem('cs2guide.settings.v2')) || {};
    const root = document.documentElement;
    if (['light', 'dark'].includes(saved.theme)) root.dataset.theme = saved.theme;
    else if (saved.theme === 'system') delete root.dataset.theme;
    else root.dataset.theme = 'light';
    root.dataset.size = ['small', 'medium', 'large'].includes(saved.size) ? saved.size : 'large';
    if (['guided', 'reference'].includes(saved.mode)) root.dataset.guideMode = saved.mode;
  } catch (_) {
    // Defaults remain available when browser storage is blocked.
  }
})();
