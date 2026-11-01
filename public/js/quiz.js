// Module flow: tick the techniques you tried (trust based), then answer the module quiz.
import { readProgress, markComplete, paintProgress } from './progress.js';

// Mark each question, show explanations, complete the module when every answer is right
function checkQuiz(box) {
  const questions = [...box.querySelectorAll('.quiz-question')];
  let correct = 0;
  let unanswered = 0;
  questions.forEach((q) => {
    const selected = q.querySelector('input[type="radio"]:checked');
    const ok = Boolean(selected) && selected.value === q.dataset.answer;
    if (!selected) unanswered += 1;
    if (ok) correct += 1;
    q.classList.toggle('correct', ok);
    q.classList.toggle('wrong', Boolean(selected) && !ok);
    const note = q.querySelector('.quiz-explain');
    note.textContent = q.dataset.explain;
    note.hidden = !selected;
  });
  const result = box.querySelector('.quiz-result');
  if (unanswered > 0) { result.textContent = `Answer all ${questions.length} questions first.`; return; }
  if (correct === questions.length) {
    const saved = markComplete(box.dataset.module);
    const done = box.querySelector('.practice-done');
    if (done && !saved) done.textContent = '✓ Completed for this session. Browser storage is unavailable.';
    return;
  }
  result.textContent = `${correct} of ${questions.length} correct. Read the explanations, try the techniques again, then retry.`;
}

export function initQuizzes() {
  const progress = readProgress();
  paintProgress(progress);
  document.querySelectorAll('.practice[data-module]').forEach((box) => {
    if (progress[box.dataset.module] === true) return;
    const required = Number(box.dataset.required) || 1;
    const ticks = [...box.querySelectorAll('.check-item input')];
    const start = box.querySelector('.practice-start');
    const count = box.querySelector('.practice-count');
    const update = () => {
      const n = ticks.filter((t) => t.checked).length;
      start.disabled = n < required;
      count.textContent = n >= required ? 'Ready for the quiz' : `${n} of ${required} ticked`;
    };
    ticks.forEach((t) => t.addEventListener('change', update));
    update();
    start.addEventListener('click', () => { box.querySelector('.quiz').hidden = false; start.hidden = true; });
    box.querySelector('.quiz-check').addEventListener('click', () => checkQuiz(box));
  });
}
