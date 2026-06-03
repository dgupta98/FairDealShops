# Fairdeal Refinement — Design Spec

**Date:** 2026-06-02
**Source:** `AUDIT.md` (full audit of `Fairdeal Final v1.html`)
**Output target:** `Fairdeal v2.html` + `assets/` tree, preserving v1 as reference.

## Goal

Evolve `Fairdeal Final v1.html` into a visually compelling, modern, performant v2 — preserving every word of copy, every section, the overall layout, and the brand intent. No restructure. No content edits. The bar: keep the soul, raise the polish.

## Decisions (locked during brainstorming)

| Topic | Decision |
|---|---|
| Scope | Full audit sweep — every recommendation in `AUDIT.md` |
| File structure | Split into HTML + CSS modules + JS modules + asset tree |
| Assets | Unsplash for hero/lifestyle, real brand SVGs for the brand wall, lucide-style SVG icons |
| Output | New `Fairdeal v2.html` (v1 untouched as reference) |
| Gold accent | Moderate — 5 intentional placements |
| Enquiry section | Dark ink-cyan gradient with dual radial glows |
| Animation level | Cinematic — Ken Burns, parallax, count-up, cursor glow, staggered reveals |
| Brand wall | Tiered — 6 flagship + 19 secondary, hierarchy not flatness |

## Architecture

```
fairdeal/
├── Fairdeal Final v1.html        (untouched reference)
├── Fairdeal v2.html              (new — ~600 lines, no inline images)
├── assets/
│   ├── css/
│   │   ├── tokens.css            (CSS vars: colour, type, space, motion, shadow)
│   │   ├── base.css              (reset, typography, utilities)
│   │   ├── components.css        (buttons, badges, cards, form fields)
│   │   └── sections.css          (per-section styles)
│   ├── js/
│   │   ├── nav.js                (mobile toggle, scroll-state)
│   │   ├── hero-slider.js        (auto-rotate, pause, progress, Ken Burns, crossfade)
│   │   ├── reveal.js             (IntersectionObserver, staggered)
│   │   ├── showroom-finder.js    (tabs + map swap)
│   │   ├── enquiry.js            (WhatsApp deep-link)
│   │   └── motion.js             (parallax, count-up, cursor glow, reduced-motion gate)
│   ├── img/
│   │   ├── hero/                 (4 Unsplash slides, WebP, 1600w + 800w)
│   │   ├── lifestyle/            (story + category Unsplash, WebP)
│   │   └── ui/                   (icons, decorative)
│   └── brands/
│       └── *.svg                 (25 real brand SVGs)
├── privacy-policy.html           (new — minimal)
└── terms.html                    (new — minimal)
```

**Loading model:** CSS via `<link rel="stylesheet">` in head (tokens → base → components → sections). JS via `<script type="module" defer>` per module.

**Page-weight target:** under 800 KB on first paint (down from 3.1 MB).

## Design System

### Typography fix (silent bug from v1)

`Fraunces` uses `font-variation-settings: "opsz", "SOFT", "WONK"` in 11 places, but the Google Fonts URL only loads `opsz,wght`. SOFT and WONK are ignored. Fix the URL:

```
family=Fraunces:opsz,wght,SOFT,WONK@9..144,300..900,0..100,0..1
```

Existing settings then activate. No markup change needed.

### Tokens (`tokens.css`)

```css
:root {
  /* Brand */
  --primary: #1FB5E5;
  --primary-deep: #0A6E8E;
  --ink: #0A1929;
  --gold: #C49A5C;
  --warm: #FAF7F2;
  --warm-2: #F4F0E8;
  --line: #E5E9F0;

  /* Type scale (fluid clamp) */
  --t-display: clamp(2.5rem, 1.5rem + 4vw, 5rem);
  --t-h1: clamp(2rem, 1.3rem + 2.6vw, 3.5rem);
  --t-h2: clamp(1.5rem, 1.1rem + 1.6vw, 2.4rem);
  --t-h3: 1.25rem;
  --t-body: 1rem;
  --t-small: 0.875rem;

  /* Space (4px base) */
  --s-1: 0.25rem; --s-2: 0.5rem;  --s-3: 0.75rem;
  --s-4: 1rem;    --s-6: 1.5rem;  --s-8: 2rem;
  --s-12: 3rem;   --s-16: 4rem;   --s-24: 6rem;

  /* Motion */
  --ease-out-soft:  cubic-bezier(0.22, 1, 0.36, 1);
  --ease-out-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --t-fast: 180ms;
  --t-base: 320ms;
  --t-slow: 600ms;

  /* Shadow */
  --shadow-1: 0 1px 2px rgba(10,25,41,0.04), 0 2px 6px rgba(10,25,41,0.06);
  --shadow-2: 0 4px 12px rgba(10,25,41,0.08), 0 12px 28px -8px rgba(10,25,41,0.12);
  --shadow-3: 0 12px 28px -16px rgba(10,25,41,0.2), 0 24px 48px -20px rgba(10,25,41,0.18);
  --shadow-cyan: 0 12px 28px -12px rgba(31,181,229,0.45);
}
```

### Gold placements (5 spots — moderate level)

1. "Our story" kicker label
2. "Since 1966" chip — digits go gold
3. Story-section pull-quote bar (3 px left border)
4. Hero-meta divider (horizontal rule)
5. Footer italic tagline

### Cleanups

- Drop orphan CSS: `.loc-*` block (v1 ~lines 278–293), `.cta-band*` (~lines 324–332). ~50 lines deleted.
- Replace every hex literal with token reference.
- Replace repeated inline `box-shadow:...` with utility classes (`.shadow-1/2/3`).
- Move to 4 px space scale; no more ad-hoc `1.25rem` / `1.75rem`.

## Section-by-section refinement

All 14 sections preserved. No reorder, no copy edits.

1. **Nav** — backdrop blur (`backdrop-filter: blur(12px)`) once scrolled past 80 px, hairline `--line` border-bottom fades in. Mobile drawer fades+slides instead of instant show.

2. **Hero slider (5 slides — TVs, ACs, Fridges, Washing, Kitchen)** — Ken Burns 8 s slow zoom per slide; 4 px gold progress bar under meta block fills over 4 s and resets on slide change; pause-on-hover; respects `prefers-reduced-motion`; crossfade between slides (no hard swap).

3. **Trust strip** — count-up animation on stats when entering viewport (1966 → 6 → 25+ → 1M+). Hairline gold dividers between stats.

4. **Categories grid (9 tiles — TVs, Audio, ACs, Fridges, Washing, Kitchen, Water Purifiers, Fans/Geysers/Coolers, Personal Care)** — `translateY(-4px)` + `--shadow-cyan` on hover; thin gold underline on label reveals. Replace base64 imagery with `assets/img/lifestyle/cat-*.webp`.

5. **Why us (4 cards)** — numbered markers (01 / 02 / 03 / 04) in Fraunces italic gold. Stagger-reveal on scroll. Lucide-style line icons replace heavy filled glyphs.

6. **How it works (3 steps)** — horizontal connecting line behind steps on desktop, gold-tinted. Active step dot pulses once on reveal.

7. **Story section** — Ken Burns on lifestyle image; gold quote-bar (3 px left border) on pull-quote; image parallaxes at 0.7× scroll speed inside its frame. "Since 1966" chip gains gold digits.

8. **Testimonials (3 cards)** — Fraunces italic opening-quote glyph (large, gold, low-opacity, top-left of each card). Cards stagger-reveal with 120 ms sibling delay.

9. **Brand wall (tiered)** — flagship row of 6 large tiles (160 × 100 px, full-colour SVG, cursor-follow gold radial glow on hover, lift). Secondary row of 21 smaller tiles (100 × 60 px, monochrome SVG, regain colour on hover). All 27 brands from v1 kept. Flagship six (chosen for recognition + breadth of categories represented): LG, Samsung, Daikin, Voltas, Hitachi, Godrej. Remaining 21 (Bajaj, BPL, IFB, Philips, Panasonic, TCL, Carrier, Haier, Kelvinator, Kutchina, Faber, O General, Hindware, Venus, Midea, Mitsubishi Heavy, Prestige, boAt, Symphony, Crompton, Pureit) sit in the secondary row.

10. **Business / B2B** — subtle gold-to-transparent radial top-left, ink-deepening to bottom-right. CTA button gains `--shadow-cyan` glow.

11. **Locations (6 tabbed maps)** — animated gold underline slides between active tabs in 240 ms. Address card gains hairline gold left-border.

12. **Enquiry** — full repaint:
    - Background: `linear-gradient(135deg, #0A6E8E 0%, #0A1929 70%)`
    - Top-left radial: cyan glow (`rgba(31,181,229,0.18)`)
    - Bottom-right radial: gold glow (`rgba(196,154,92,0.18)`)
    - "Get in touch" kicker → gold
    - Form card stays white, gains `--shadow-3` to float dramatically
    - WhatsApp green CTA unchanged (brand requirement)

13. **Footer** — link weight reduced; italic tagline goes gold ("Made in Kolkata · Serving families since 1966"); thin gold-fade hairline above copyright row.

14. **WhatsApp FAB** — unchanged WhatsApp green. 2 s pulse ring on first load only (one cycle, then settles). Respects `prefers-reduced-motion`.

## Motion system

Single `prefers-reduced-motion: reduce` gate. If user opts out, everything degrades to static cross-fade or no transition.

### `motion.js` structure

```js
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const motion = {
  kenBurns,      // .ken-burns elements
  parallax,      // [data-parallax="0.7"] elements
  countUp,       // [data-count-to="1966"] elements
  cursorGlow,    // .cursor-glow containers
  revealStagger, // [data-reveal] elements with sibling delay
};
if (!reducedMotion) Object.values(motion).forEach(fn => fn());
```

### Ken Burns

```css
.ken-burns img {
  animation: kb 8s var(--ease-out-soft) both;
}
@keyframes kb {
  from { transform: scale(1.08) translate(-1%, -1%); }
  to   { transform: scale(1.00) translate( 0%,  0%); }
}
```

Restarts per slide change via class toggle + forced reflow.

### Hero progress bar

```css
.hero-progress { width: 0; transition: width 4s linear; background: var(--gold); }
.hero-progress.run { width: 100%; }
.hero:hover .hero-progress { transition: none; }
```

Pause-on-hover halts both progress and slide rotation.

### Parallax (story image only)

`requestAnimationFrame` driven, `IntersectionObserver` gated (only updates when in viewport):

```js
function parallax() {
  const els = document.querySelectorAll('[data-parallax]');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => e.target.classList.toggle('in-view', e.isIntersecting));
  });
  els.forEach(el => io.observe(el));
  (function tick() {
    els.forEach(el => {
      if (!el.classList.contains('in-view')) return;
      const rate = +el.dataset.parallax;
      const offset = (window.scrollY - el.offsetTop) * (1 - rate);
      el.style.transform = `translate3d(0, ${offset}px, 0)`;
    });
    requestAnimationFrame(tick);
  })();
}
```

### Count-up

```js
function countUp() {
  document.querySelectorAll('[data-count-to]').forEach(el => {
    const target = +el.dataset.countTo;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      requestAnimationFrame(function step(t) {
        const p = Math.min(1, (t - start) / 1200);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.floor(eased * target).toLocaleString();
        if (p < 1) requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    io.observe(el);
  });
}
```

### Cursor-follow gold glow (flagship brand tiles)

CSS variable driven, JS throttles `pointermove` to ~16 ms:

```css
.brand-tile.flagship {
  background:
    radial-gradient(180px circle at var(--mx, 50%) var(--my, 50%),
                    rgba(196,154,92,0.18), transparent 60%),
    var(--warm);
}
```

### Staggered reveals (replaces v1 `.fade-in`)

```css
[data-reveal] { opacity: 0; transform: translateY(24px);
                transition: opacity var(--t-slow) var(--ease-out-soft),
                            transform var(--t-slow) var(--ease-out-soft); }
[data-reveal].in { opacity: 1; transform: none; }
```

Sibling lists use `--reveal-delay: calc(var(--i) * 80ms)` set via JS on observe.

### Performance budget

- Only `transform` and `opacity` animated (no layout-trigger properties).
- `will-change` applied on intersect, removed on `transitionend`.
- Target: sustained 60 fps on mid-tier mobile.

## Implementation order (12 passes)

Each pass leaves v2 in a renderable state. Never half-broken.

1. **Skeleton** — copy v1 → v2; strip base64 → placeholder `<img>` tags with width/height; lift inline `<style>` into single `styles.css`. Validates layout survived the move.
2. **Asset pipeline** — download 5 hero + 6 category + 1 story Unsplash photos, convert to WebP at 1600w + 800w with `srcset`. Fetch 25 brand SVGs (simpleicons + brand kits). Wire into v2.
3. **Fraunces axes fix** — update Google Fonts URL; SOFT/WONK activate. One-line change, big payoff.
4. **Tokens + CSS split** — extract `tokens.css`, `base.css`, `components.css`, `sections.css`. Replace hex literals with vars. Delete orphan `.loc-*` and `.cta-band*` blocks.
5. **JS modules split** — break inline `<script>` into 5 modules; load as `<script type="module" defer>`. Behaviour parity.
6. **Hero slider upgrade** — Ken Burns + crossfade + progress bar + pause-on-hover + reduced-motion gate.
7. **Enquiry repaint** — dark ink-cyan gradient + dual radials + gold kicker + deeper card shadow.
8. **Brand wall tiering** — split flagship (6) + secondary (19) rows; cursor-follow gold glow on flagship; monochrome→colour hover on secondary.
9. **Motion system rollout** — `motion.js` with parallax, count-up, staggered reveals, cursor glow. Apply `data-*` attributes section by section.
10. **Gold accent placements** — story kicker, "1966" chip digits, story quote-bar, hero meta divider, footer italic.
11. **Polish sweep** — nav backdrop blur; category lift+shadow; why-us numbered markers + lucide icons; how-it-works connector line; testimonial italic glyph; footer hairline; FAB pulse-once.
12. **Policy pages + final QA** — minimal `privacy-policy.html` and `terms.html` reusing footer + nav. Lighthouse pass, mobile pass, `prefers-reduced-motion` pass.

## Done criteria

- All 14 sections render with all v1 content intact (every word of copy, every showroom, every brand)
- Total transfer under 800 KB on first paint (down from 3.1 MB)
- Lighthouse mobile performance ≥ 90, accessibility ≥ 95
- All animations respect `prefers-reduced-motion`
- No console errors, no broken anchors
- Both policy pages reachable from footer
- All Fraunces axes (opsz, wght, SOFT, WONK) actually loaded and active

## Constraints (non-negotiable)

- **No content edits** — copy, section order, brand list, showroom data, phone numbers, WhatsApp number all preserved verbatim.
- **No layout restructure** — same 14 sections in the same order.
- **No new pages beyond policy pages** — no blog, no product detail, no separate brand pages.
- **No build tooling** — plain HTML/CSS/JS modules. No bundler, no framework.
- **WhatsApp green CTA colour preserved** — brand requirement, not styled away.
