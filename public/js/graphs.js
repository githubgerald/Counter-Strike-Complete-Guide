import { reducedMotion } from './prefs.js';
// Draws the small charts defined in content/animations.js (type 'lines' or 'path').
const NS = 'http://www.w3.org/2000/svg';
const el = (name, attrs = {}, text) => {
  const node = document.createElementNS(NS, name);
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  if (text !== undefined) node.textContent = text;
  return node;
};

// Smooth curve through points (Catmull-Rom converted to cubic Bezier)
function smooth(points) {
  let d = `M${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const [p0, p1, p2, p3] = [points[i - 1] || points[i], points[i], points[i + 1], points[i + 2] || points[i + 1]];
    d += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`;
  }
  return d;
}

function drawLines(svg, g) {
  const W = 600, H = 280, L = 56, R = 24, T = 44, B = 46;       // chart size and margins
  const maxX = Math.max(...g.lines.flatMap((l) => l.points.map((p) => p[0])));
  const maxY = Math.max(...g.lines.flatMap((l) => l.points.map((p) => p[1])));
  const x = (v) => L + (v / maxX) * (W - L - R);
  const y = (v) => H - B - (v / maxY) * (H - B - T);
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  // Title, top middle
  svg.append(el('text', { x: W / 2, y: 22, class: 'g-title', 'text-anchor': 'middle' }, g.title || ''));
  // Axes and their labels
  svg.append(el('line', { x1: L, y1: H - B, x2: W - R, y2: H - B, class: 'g-axis' }), el('line', { x1: L, y1: T, x2: L, y2: H - B, class: 'g-axis' }));
  svg.append(el('text', { x: (L + W - R) / 2, y: H - 12, class: 'g-label', 'text-anchor': 'middle' }, g.xLabel || ''));
  svg.append(el('text', { x: 16, y: (T + H - B) / 2, class: 'g-label', 'text-anchor': 'middle', transform: `rotate(-90 16 ${(T + H - B) / 2})` }, g.yLabel || ''));
  // One straight line per entry in `lines`, plus its label in the top-right corner
  g.lines.forEach((line, i) => {
    const d = line.points.map((p, n) => `${n ? 'L' : 'M'}${x(p[0])},${y(p[1])}`).join(' ');
    svg.append(el('path', { d, class: `g-line g-line-${i}` }));
    svg.append(el('rect', { x: W - R - 150, y: T + 6 + i * 22, width: 14, height: 4, class: `g-key g-key-${i}` }));
    svg.append(el('text', { x: W - R - 130, y: T + 12 + i * 22, class: 'g-label' }, line.label));
  });
}

function drawPath(svg, g) {
  const W = 600, H = 220;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  g.segments.forEach((seg, i) => {
    svg.append(el('path', { d: smooth(seg.points), class: `g-line g-line-${i % 2}` }));
    const mid = seg.points[Math.floor(seg.points.length / 2)];
    svg.append(el('text', { x: mid[0], y: mid[1] - 14, class: 'g-key-text', 'text-anchor': 'middle' }, seg.key));
  });
  svg.append(el('text', { x: 40, y: H - 10, class: 'g-label' }, 'Start'), el('text', { x: W - 50, y: H - 10, class: 'g-label' }, 'Landing'));
}

function animate(svg) {
  if (reducedMotion()) return;
  svg.querySelectorAll('.g-line').forEach((path) => {
    const len = path.getTotalLength();
    path.style.strokeDasharray = `${len}`;
    path.style.strokeDashoffset = `${len}`;
    path.getBoundingClientRect();
    path.style.transition = 'stroke-dashoffset 1.4s ease';
    path.style.strokeDashoffset = '0';
  });
}

export function initGraphs() {
  document.querySelectorAll('[data-graph]').forEach((figure) => {
    let g;
    try { g = JSON.parse(figure.dataset.graph); } catch (_) { return; }
    const svg = el('svg', { class: 'graph-svg', role: 'img', 'aria-label': g.title || 'Chart' });
    (g.type === 'path' ? drawPath : drawLines)(svg, g);
    figure.prepend(svg);
    let done = false;
    new IntersectionObserver((entries, obs) => {
      if (entries.some((e) => e.isIntersecting) && !done) { done = true; animate(svg); obs.disconnect(); }
    }, { threshold: 0.4 }).observe(figure);
  });
}
