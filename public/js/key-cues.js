// Animated keyboard hints. The steps (keys, mouse, ms, label) come from content/animations.js.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function readSteps(element) {
  try {
    const steps = JSON.parse(element.dataset.steps || '[]');
    return Array.isArray(steps) ? steps.filter((s) => s && Array.isArray(s.keys) && s.ms > 0) : [];
  } catch (_) { return []; }
}

function paint(element, step) {
  element.querySelectorAll('[data-key]').forEach((key) => key.classList.toggle('is-pressed', step.keys.includes(key.dataset.key)));
  element.querySelector('.mouse-motion').textContent = step.mouse || '•';
  element.querySelector('.cue-frame-label').textContent = step.label || '';
}

// Each cue runs its own timeline: show a step, wait its own `ms`, move on, loop.
function run(element, steps, pause) {
  const state = { index: 0, visible: false, timer: 0 };
  const next = () => {
    window.clearTimeout(state.timer);
    if (!state.visible || document.hidden) return;
    const step = steps[state.index];
    paint(element, step);
    const last = state.index === steps.length - 1;
    state.index = last ? 0 : state.index + 1;
    state.timer = window.setTimeout(next, step.ms + (last ? pause : 0));
  };
  new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const was = state.visible;
      state.visible = entry.isIntersecting;
      if (state.visible && !was) next();
      if (!state.visible) window.clearTimeout(state.timer);
    });
  }, { rootMargin: '120px 0px', threshold: 0.05 }).observe(element);
}

export function initKeyCues() {
  document.querySelectorAll('[data-key-cue]').forEach((element) => {
    const steps = readSteps(element);
    if (!steps.length) return;
    paint(element, steps[0]);
    if (!reducedMotion && 'IntersectionObserver' in window) run(element, steps, Number(element.dataset.pause) || 0);
  });
}
