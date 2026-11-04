import { setting, SETTINGS_EVENT } from './prefs.js';

// ============================================================================
// CLIP PLAYER
// Autoplays (muted) while on screen and pauses off screen. Controls: play/pause,
// timeline, speed buttons (0.1x to 2x) and an expanded view that dims the page.
// ============================================================================
const canAutoplay = () => setting('autoplay') !== 'off' && setting('saver') !== 'on';
let overlay = null;   // the dark full-page layer that holds the expanded player
let expanded = null;  // { root, box } while a clip is expanded

// ---- Expanded view: the player box moves to the overlay so it centres on screen ----
function closeExpanded() {
  if (!expanded) return;
  const { root, box } = expanded;
  const video = box.querySelector('video');
  const wasPlaying = !video.paused;
  root.append(box);              // put the player back in the page
  root.style.height = '';
  root.classList.remove('is-float');
  overlay.hidden = true;
  document.body.classList.remove('modal-open');
  expanded = null;
  if (wasPlaying) video.play().catch(() => {}); // moving a video in the page pauses it
}

function openExpanded(root) {
  closeExpanded();
  const box = root.querySelector('.vp-box');
  const video = box.querySelector('video');
  const wasPlaying = !video.paused;
  root.style.height = `${box.offsetHeight}px`; // keep the space in the page while the player is away
  root.classList.add('is-float');
  overlay.append(box);
  overlay.hidden = false;
  document.body.classList.add('modal-open');
  expanded = { root, box };
  if (wasPlaying) video.play().catch(() => {});
}

// ---- One player ----
function setup(root, observer) {
  const video = root.querySelector('video');
  const seek = root.querySelector('.vp-seek');
  const state = { video, userPaused: false };
  let scrubbing = false;
  let frame = 0;
  state.visible = false;
  state.userStarted = false;
  video.preload = setting('saver') === 'on' ? 'none' : 'auto'; // data saver: do not download until played
  root._vp = state;

  // Always silent
  video.muted = true;
  video.defaultMuted = true;
  video.volume = 0;
  video.addEventListener('volumechange', () => { if (!video.muted) video.muted = true; });

  const toggle = () => {
    if (video.paused) { state.userPaused = false; state.userStarted = true; video.play().catch(() => {}); } else { state.userPaused = true; state.userStarted = false; video.pause(); }
  };
  root.querySelector('.vp-play').addEventListener('click', toggle);
  video.addEventListener('click', toggle);

  // Smooth timeline while playing
  const tick = () => {
    if (!scrubbing && video.duration) seek.value = Math.round((video.currentTime / video.duration) * 1000);
    frame = requestAnimationFrame(tick);
  };
  video.addEventListener('play', () => { root.classList.add('is-playing'); cancelAnimationFrame(frame); tick(); });
  video.addEventListener('pause', () => { root.classList.remove('is-playing'); cancelAnimationFrame(frame); });
  seek.addEventListener('pointerdown', () => { scrubbing = true; });
  seek.addEventListener('pointerup', () => { scrubbing = false; });
  seek.addEventListener('change', () => { scrubbing = false; });
  seek.addEventListener('input', () => { if (video.duration) video.currentTime = (seek.value / 1000) * video.duration; });

  root.querySelectorAll('.vp-speed').forEach((btn) => btn.addEventListener('click', () => {
    video.playbackRate = Number(btn.dataset.speed);
    root.querySelectorAll('.vp-speed').forEach((b) => b.classList.toggle('is-active', b === btn));
  }));
  root.querySelector('.vp-full').addEventListener('click', () => (expanded && expanded.root === root ? closeExpanded() : openExpanded(root)));
  observer.observe(root);
}

export function initVideoPlayers() {
  const players = [...document.querySelectorAll('[data-vp]')];
  if (!players.length) return;

  overlay = document.createElement('div');
  overlay.className = 'vp-overlay';
  overlay.hidden = true;
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeExpanded(); });
  document.body.append(overlay);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeExpanded(); });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const state = entry.target._vp;
      if (!state) return;
      state.visible = entry.isIntersecting;
      if (entry.target.classList.contains('is-float')) return; // expanded clips keep playing
      if (entry.isIntersecting) { if (canAutoplay() && !state.userPaused) state.video.play().catch(() => {}); } else { state.video.pause(); state.userPaused = false; state.userStarted = false; }
    });
  }, { threshold: 0.5 });
  players.forEach((root) => setup(root, observer));

  // React to the Performance settings straight away
  document.addEventListener(SETTINGS_EVENT, () => {
    players.forEach((root) => {
      const state = root._vp;
      state.video.preload = setting('saver') === 'on' ? 'none' : 'auto';
      if (!canAutoplay()) { if (!state.userStarted) state.video.pause(); } else if (state.visible && !state.userPaused) state.video.play().catch(() => {});
    });
  });
}
