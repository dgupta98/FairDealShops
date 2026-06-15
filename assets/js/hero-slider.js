// Hero slider — auto-rotate every 4 s with Ken Burns + gold progress bar.
// Pauses on hover. Respects prefers-reduced-motion.
const SLIDE_MS = 4000;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const slides = document.querySelectorAll('.hero-slide');
const dots = document.querySelectorAll('.slider-dot');
const visual = document.getElementById('heroVisual');

let idx = 0;
let timer = null;
let progressEl = null;

if (visual && slides.length) {
  progressEl = document.createElement('div');
  progressEl.className = 'hero-progress';
  visual.appendChild(progressEl);
}

function restartProgress() {
  if (!progressEl || reducedMotion) return;
  progressEl.classList.remove('run');
  // Force reflow so the next class addition restarts the transition.
  void progressEl.offsetWidth;
  progressEl.classList.add('run');
}

function restartKenBurns() {
  if (reducedMotion) return;
  const img = slides[idx]?.querySelector('img');
  if (!img) return;
  img.style.animation = 'none';
  void img.offsetWidth;
  img.style.animation = '';
}

function go(n) {
  slides[idx].classList.remove('active');
  dots[idx]?.classList.remove('active');
  idx = (n + slides.length) % slides.length;
  slides[idx].classList.add('active');
  dots[idx]?.classList.add('active');
  restartKenBurns();
  restartProgress();
}

function start() {
  stop();
  timer = setInterval(() => go(idx + 1), SLIDE_MS);
  restartProgress();
}
function stop() {
  if (timer) { clearInterval(timer); timer = null; }
  if (progressEl) progressEl.classList.remove('run');
}

window.goSlide = (n) => { go(n); start(); };

const hasHover = matchMedia('(hover: hover)').matches;

if (slides.length) {
  start();
  if (visual && !reducedMotion && hasHover) {
    visual.addEventListener('pointerenter', stop);
    visual.addEventListener('pointerleave', start);
  }
}

if (visual && slides.length > 1) {
  const SWIPE_THRESHOLD = 40;
  let startX = 0;
  let startY = 0;
  let tracking = false;

  visual.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    tracking = true;
    stop();
  }, { passive: true });

  visual.addEventListener('touchend', (e) => {
    if (!tracking) return;
    tracking = false;
    const t = e.changedTouches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
      go(idx + (dx < 0 ? 1 : -1));
    }
    start();
  });

  visual.addEventListener('touchcancel', () => {
    tracking = false;
    start();
  });
}
