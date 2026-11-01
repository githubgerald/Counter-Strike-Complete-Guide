export function initScrollSpy() {
  const links = new Map([...document.querySelectorAll('.nav-link[data-section]')].map((link) => [link.dataset.section, link]));
  let active = null;
  const targets = document.querySelectorAll('.topic[id]');
  if (!('IntersectionObserver' in window) || targets.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
    if (!visible) return;
    const link = links.get(visible.target.id);
    if (!link || link === active) return;
    active?.classList.remove('active');
    link.classList.add('active');
    active = link;

    const group = link.closest('.nav-group');
    if (group?.classList.contains('is-collapsed')) {
      group.classList.remove('is-collapsed');
      group.querySelector('.nav-chevron')?.setAttribute('aria-expanded', 'true');
    }
  }, { rootMargin: '-12% 0px -76% 0px', threshold: [0, 0.1] });

  targets.forEach((target) => observer.observe(target));
}
