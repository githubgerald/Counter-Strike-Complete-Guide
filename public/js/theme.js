// Apply saved display settings before the page paints, so there is no flash.
(function () {
  try {
    var saved = JSON.parse(localStorage.getItem('cs2guide.settings.v2')) || {};
    var root = document.documentElement;
    var allowed = {
      size: ['small', 'medium', 'large'], spacing: ['compact', 'normal', 'relaxed'], width: ['narrow', 'standard', 'wide'],
      contrast: ['standard', 'high'], motion: ['system', 'reduce'], cues: ['animated', 'still'],
      autoplay: ['on', 'off'], saver: ['off', 'on'],
    };
    if (['light', 'dark'].indexOf(saved.theme) > -1) root.dataset.theme = saved.theme;
    else if (saved.theme === 'system') root.dataset.theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    else root.dataset.theme = 'light';
    if (['guided', 'reference'].indexOf(saved.mode) > -1) root.dataset.guideMode = saved.mode;
    Object.keys(allowed).forEach(function (key) {
      var value = allowed[key].indexOf(saved[key]) > -1 ? saved[key] : (key === 'size' ? 'large' : allowed[key][key === 'width' || key === 'spacing' ? 1 : 0]);
      root.dataset[key] = value;
    });
  } catch (e) { /* defaults apply when storage is blocked */ }
})();
