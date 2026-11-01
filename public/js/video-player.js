// Custom clip player: autoplays while on screen, pauses off screen, with a timeline,
// speed buttons (0.1x to 2x) and a floating larger view that dims the page.
let backdrop = null;
let floating = null;

function closeFloat() {
  if (!floating) return;
  floating.classList.remove('is-float');
  floating.style.minHeight = '';
  backdrop?.remove();
  backdrop = null; floating = null;
  document.body.classList.remove('no-scroll');
}

function openFloat(root) {
  closeFloat();
  root.style.minHeight = `${root.offsetHeight}px`; // keep the page layout steady
  root.classList.add('is-float');
  backdrop = document.createElement('div');
  backdrop.className = 'vp-backdrop';
  backdrop.addEventListener('click', closeFloat);
  document.body.appendChild(backdrop);
  document.body.classList.add('no-scroll');
  floating = root;
}

function setup(root, observer) {
  const video = root.querySelector('video');
  const seek = root.querySelector('.vp-seek');
  const state = { video, userPaused: false };
  root._vp = state;

  const toggle = () => {
    if (video.paused) { state.userPaused = false; video.play().catch(() => {}); } else { state.userPaused = true; video.pause(); }
  };
  root.querySelector('.vp-play').addEventListener('click', toggle);
  video.addEventListener('click', toggle);
  video.addEventListener('play', () => root.classList.add('is-playing'));
  video.addEventListener('pause', () => root.classList.remove('is-playing'));
  video.addEventListener('timeupdate', () => { if (video.duration) seek.value = Math.round((video.currentTime / video.duration) * 1000); });
  seek.addEventListener('input', () => { if (video.duration) video.currentTime = (seek.value / 1000) * video.duration; });
  root.querySelectorAll('.vp-speed').forEach((btn) => btn.addEventListener('click', () => {
    video.playbackRate = Number(btn.dataset.speed);
    root.querySelectorAll('.vp-speed').forEach((b) => b.classList.toggle('is-active', b === btn));
  }));
  root.querySelector('.vp-full').addEventListener('click', () => (root.classList.contains('is-float') ? closeFloat() : openFloat(root)));
  observer.observe(root);
}

export function initVideoPlayers() {
  const players = [...document.querySelectorAll('[data-vp]')];
  if (!players.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const state = entry.target._vp;
      if (!state) return;
      if (entry.isIntersecting) { if (!state.userPaused) state.video.play().catch(() => {}); } else { state.video.pause(); state.userPaused = false; }
    });
  }, { threshold: 0.5 });
  players.forEach((root) => setup(root, observer));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeFloat(); });
}
