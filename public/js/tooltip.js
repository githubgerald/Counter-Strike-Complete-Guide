export function initTooltips() {
  const tip = document.getElementById('tooltip');
  if (!tip) return;
  const show = (element) => {
    if (!element.dataset.summary) return;
    tip.textContent = element.dataset.summary;
    tip.hidden = false;
    const rect = element.getBoundingClientRect();
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - tip.offsetWidth - 8));
    tip.style.left = `${left}px`;
    tip.style.top = `${Math.min(window.innerHeight - tip.offsetHeight - 8, rect.bottom + 8)}px`;
  };
  document.addEventListener('mouseover', (event) => {
    const element = event.target.closest?.('.term');
    if (element) show(element);
  });
  document.addEventListener('mouseout', (event) => {
    if (event.target.closest?.('.term')) tip.hidden = true;
  });
  document.addEventListener('focusin', (event) => {
    const element = event.target.closest?.('.term');
    if (element) show(element);
  });
  document.addEventListener('focusout', () => { tip.hidden = true; });
}
