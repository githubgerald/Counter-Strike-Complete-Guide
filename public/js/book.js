import { reducedMotion } from './prefs.js';
// Dictionary book: toggled by the round button, opens from the right.
// Pages are built to fit the book (no scrolling) and turn with a flipping leaf.
let book, cover, pageEl, numEl, prevBtn, nextBtn, fab, pages = [], current = 0, busy = false, lastSize = '';

// Fill a container with the entries for one page
function fill(container, index, focusTerm) {
  container.replaceChildren(...pages[index].map((entry) => {
    const copy = entry.cloneNode(true);
    if (focusTerm && copy.dataset.term === focusTerm) copy.classList.add('is-focus');
    return copy;
  }));
}

// Split the entries into pages that fit the visible page area, so nothing needs a scrollbar
function paginate() {
  const entries = [...document.querySelectorAll('#book-entries .book-entry')];
  pages = [];
  let group = [];
  pageEl.replaceChildren();
  entries.forEach((entry) => {
    pageEl.append(entry.cloneNode(true));
    if (pageEl.scrollHeight > pageEl.clientHeight + 1 && group.length) {
      pages.push(group);
      group = [];
      pageEl.replaceChildren(entry.cloneNode(true));
    }
    group.push(entry);
  });
  if (group.length) pages.push(group);
  pageEl.replaceChildren();
}

function updateNav(index) {
  numEl.textContent = `${index + 1} / ${pages.length}`;
  prevBtn.hidden = index === 0;
  nextBtn.hidden = index === pages.length - 1;
}

function render(index, focusTerm) {
  current = index;
  fill(pageEl, index, focusTerm);
  updateNav(index);
}

// A snapshot of a whole page (title and entries) to put on the flipping leaf
function snapshot(index) {
  const wrap = document.createElement('div');
  const title = document.createElement('p');
  title.className = 'book-title';
  title.textContent = 'Dictionary';
  const body = document.createElement('div');
  body.className = 'leaf-body';
  fill(body, index);
  wrap.append(title, body);
  return wrap;
}

function turn(direction) {
  const target = current + direction;
  if (busy || target < 0 || target >= pages.length) return;
  if (reducedMotion()) { render(target); return; }
  busy = true;
  const leaf = document.createElement('div');
  leaf.className = 'book-leaf';
  const front = document.createElement('div');
  front.className = 'leaf-face leaf-front';
  const back = document.createElement('div');
  back.className = 'leaf-face leaf-back';
  const persp = 'perspective(1800px)';
  let frames;
  if (direction > 0) {
    // Old page lifts off and folds over the spine, revealing the next page underneath
    front.append(snapshot(current));
    render(target);
    frames = [
      { transform: `${persp} rotateY(0deg)`, opacity: 1 },
      { transform: `${persp} rotateY(-180deg)`, opacity: 1, offset: 0.85 },
      { transform: `${persp} rotateY(-180deg)`, opacity: 0 },
    ];
  } else {
    // The previous page folds back over the spine and lands on top
    front.append(snapshot(target));
    updateNav(target);
    frames = [
      { transform: `${persp} rotateY(-180deg)`, opacity: 0 },
      { transform: `${persp} rotateY(-180deg)`, opacity: 1, offset: 0.15 },
      { transform: `${persp} rotateY(0deg)`, opacity: 1 },
    ];
  }
  leaf.append(front, back);
  cover.append(leaf);
  leaf.animate(frames, { duration: 700, easing: 'ease-in-out' }).onfinish = () => {
    if (direction < 0) render(target);
    leaf.remove();
    busy = false;
  };
}

export function openBook(termId) {
  if (!book) return;
  book.hidden = false;
  fab.setAttribute('aria-expanded', 'true');
  const size = `${pageEl.clientWidth}x${pageEl.clientHeight}`;
  if (size !== lastSize || !pages.length) { paginate(); lastSize = size; }
  const index = termId ? pages.findIndex((page) => page.some((e) => e.dataset.term === termId)) : current;
  render(Math.max(0, Math.min(index < 0 ? 0 : index, pages.length - 1)), termId);
  book.classList.remove('is-open');
  void book.offsetWidth; // restart the opening animation
  book.classList.add('is-open');
}

export function closeBook() {
  if (!book) return;
  book.hidden = true;
  fab.setAttribute('aria-expanded', 'false');
}

export function initBook() {
  book = document.getElementById('book');
  if (!book) return;
  cover = document.getElementById('book-cover');
  pageEl = document.getElementById('book-page');
  numEl = document.getElementById('book-num');
  prevBtn = document.getElementById('book-prev');
  nextBtn = document.getElementById('book-next');
  fab = document.getElementById('open-dictionary');
  prevBtn.addEventListener('click', () => turn(-1));
  nextBtn.addEventListener('click', () => turn(1));
  document.getElementById('book-close').addEventListener('click', closeBook);
  fab.addEventListener('click', () => (book.hidden ? openBook() : closeBook()));
  document.addEventListener('keydown', (e) => {
    if (book.hidden) return;
    if (e.key === 'Escape') closeBook();
    if (e.key === 'ArrowRight') turn(1);
    if (e.key === 'ArrowLeft') turn(-1);
  });
  window.addEventListener('resize', () => { lastSize = ''; });
}
