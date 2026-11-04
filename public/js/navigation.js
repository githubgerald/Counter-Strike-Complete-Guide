import { openBook } from './book.js';
import { reducedMotion } from './prefs.js';
const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menu-toggle');

function scrollToId(id, behavior = 'smooth') {
  const target = document.getElementById(id);
  if (target) target.scrollIntoView({ behavior, block: 'start' });
}

function closeMenu() {
  sidebar?.classList.remove('open');
  menuToggle?.setAttribute('aria-expanded', 'false');
}

export function initMenu() {
  menuToggle?.addEventListener('click', () => {
    const open = sidebar.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
  });
}

export function initNavGroups() {
  document.querySelectorAll('.nav-chevron').forEach((button) => {
    button.addEventListener('click', () => {
      const group = button.closest('.nav-group');
      const collapsed = group.classList.toggle('is-collapsed');
      button.setAttribute('aria-expanded', String(!collapsed));
    });
  });
}

export function initLinks() {
  // Section links, term links and the sidebar share one history behaviour.
  function go(id) {
    history.replaceState({ ...(history.state || {}), y: window.scrollY }, '', location.href);
    history.pushState({ id, y: 0 }, '', `#${encodeURIComponent(id)}`);
    scrollToId(id);
    closeMenu();
  }
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.defaultPrevented || event.button !== 0) return;
    // Terms: Ctrl/Cmd click, or any click on a term with no section, opens the dictionary book
    if (link.classList.contains('term') && link.dataset.dict && (event.ctrlKey || event.metaKey || link.dataset.nosection === '1')) {
      event.preventDefault();
      openBook(link.dataset.dict.slice('#term-'.length));
      return;
    }
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const id = decodeURIComponent(link.getAttribute('href').slice(1));
    if (!document.getElementById(id)) return;
    event.preventDefault();
    go(id);
  });
}

export function initHistory() {
  if (!('scrollRestoration' in history)) return;
  history.scrollRestoration = 'manual';
  history.replaceState({ ...(history.state || {}), id: location.hash.slice(1), y: window.scrollY }, '', location.href);

  let scrollTimer;
  window.addEventListener('scroll', () => {
    window.clearTimeout(scrollTimer);
    scrollTimer = window.setTimeout(() => {
      history.replaceState({ ...(history.state || {}), y: window.scrollY }, '', location.href);
    }, 130);
  }, { passive: true });

  window.addEventListener('popstate', (event) => {
    const state = event.state;
    if (typeof state?.y === 'number') window.scrollTo({ top: state.y, behavior: reducedMotion() ? 'auto' : 'smooth' });
    else if (location.hash) scrollToId(decodeURIComponent(location.hash.slice(1)));
    else window.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' });
    closeMenu();
  });

  document.getElementById('nav-back')?.addEventListener('click', () => history.back());
  document.getElementById('nav-forward')?.addEventListener('click', () => history.forward());
}
