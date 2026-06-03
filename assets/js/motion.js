// Motion enhancements: parallax, count-up, cursor-follow gold glow.
// All effects are gated by prefers-reduced-motion and IntersectionObserver
// so off-screen elements never run animations.

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Parallax on scroll (data-parallax="0.7") ---------- */
// Speed coefficient < 1 = element scrolls slower than page (recedes).
function initParallax() {
  if (reducedMotion) return;
  const items = document.querySelectorAll('[data-parallax]');
  if (!items.length) return;

  const update = () => {
    const vh = window.innerHeight;
    items.forEach((el) => {
      const speed = parseFloat(el.dataset.parallax) || 0.5;
      const rect = el.getBoundingClientRect();
      // Translate range: shift element by up to ±40px around viewport centre.
      const centerOffset = (rect.top + rect.height / 2) - vh / 2;
      const shift = -centerOffset * (1 - speed) * 0.15;
      el.style.transform = `translate3d(0, ${shift.toFixed(1)}px, 0)`;
    });
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { update(); ticking = false; });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
}

/* ---------- Count-up on first visibility ---------- */
// Format helpers preserve the original Indian numbering / units in copy.
const FORMATTERS = {
  indian: (n) => n.toLocaleString('en-IN'),
  plain: (n) => String(Math.round(n)),
};

function animateCount(el) {
  const target = parseFloat(el.dataset.countTo);
  if (!Number.isFinite(target)) return;
  const fmt = FORMATTERS[el.dataset.countFormat] || FORMATTERS.plain;
  const duration = 1400;
  const start = performance.now();

  function frame(now) {
    const t = Math.min(1, (now - start) / duration);
    // ease-out cubic
    const eased = 1 - Math.pow(1 - t, 3);
    const value = Math.round(target * eased);
    el.textContent = fmt(value);
    if (t < 1) requestAnimationFrame(frame);
    else el.textContent = fmt(target);
  }
  requestAnimationFrame(frame);
}

function initCountUp() {
  const els = document.querySelectorAll('[data-count-to]');
  if (!els.length) return;

  if (reducedMotion) {
    // Skip animation, just render the final value formatted correctly.
    els.forEach((el) => {
      const target = parseFloat(el.dataset.countTo);
      const fmt = FORMATTERS[el.dataset.countFormat] || FORMATTERS.plain;
      if (Number.isFinite(target)) el.textContent = fmt(target);
    });
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        animateCount(e.target);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.4 });
  els.forEach((el) => io.observe(el));
}

/* ---------- Cursor-follow gold glow on flagship brand tiles ---------- */
// CSS reads --mx / --my from the tile's style and renders a radial gradient.
function initCursorGlow() {
  if (reducedMotion) return;
  const tiles = document.querySelectorAll('[data-glow]');
  tiles.forEach((tile) => {
    tile.addEventListener('pointermove', (ev) => {
      const r = tile.getBoundingClientRect();
      const x = ((ev.clientX - r.left) / r.width) * 100;
      const y = ((ev.clientY - r.top) / r.height) * 100;
      tile.style.setProperty('--mx', x + '%');
      tile.style.setProperty('--my', y + '%');
    });
  });
}

/* ---------- Staggered reveal delays ---------- */
// reveal.js handles the .visible toggle; here we just sequence siblings.
function initStaggers() {
  if (reducedMotion) return;
  document.querySelectorAll('[data-reveal-stagger]').forEach((parent) => {
    const step = parseInt(parent.dataset.revealStagger, 10) || 80;
    parent.querySelectorAll(':scope > .reveal').forEach((child, i) => {
      child.style.transitionDelay = (i * step) + 'ms';
    });
  });
}

initParallax();
initCountUp();
initCursorGlow();
initStaggers();
