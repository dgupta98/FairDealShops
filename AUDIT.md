# Fairdeal International — Senior UX / Web Design Audit

**Subject:** `Fairdeal Final v1.html` (single-file site, 1057 lines, ~3.1 MB)
**Stack:** Hand-authored HTML + inline `<style>` + vanilla `<script>`. Fraunces (display) + DM Sans (body) via Google Fonts. Sky-blue + ink + warm cream palette.
**Sections (in order):** Nav → Hero (5-slide auto-rotator) → Trust strip → Categories (9) → Why us (6) → How it works (5 steps) → Story → Testimonials (6) → Brands (~27 tiles) → Business / B2B → Locations (tabbed showroom finder + embedded Map) → Enquiry (form → WhatsApp deep-link) → Footer → WhatsApp FAB.

The work is well-conceived and the writing is genuinely strong (the brand voice — "the difference is the honesty, not just the price tag" — is rare in this category). The base structure is sound; the recommendations below are about polishing what's there.

---

## PART A — Technical Validation

### A1. Fonts (the most consequential finding)

| Check | Status | Detail |
|---|---|---|
| Google Fonts import present | ✅ | line 14 — `Fraunces:opsz,wght@9..144,400..700` + `DM Sans:opsz,wght@9..40,400..700` |
| Preconnect to `fonts.googleapis.com` & `fonts.gstatic.com` | ✅ | lines 12–13 |
| `display=swap` set | ✅ | avoids FOIT |
| Body uses `--font-body` (DM Sans) | ✅ | line 34 |
| H1–H3 use `--font-display` (Fraunces) | ✅ | line 41 |
| **`font-variation-settings: "SOFT" 30/50/60/80/100, "WONK" 0/1` referenced 11× in CSS** | ❌ **broken** | The Fraunces URL only requests **opsz** and **wght** axes. The **SOFT** and **WONK** axes are **never downloaded**, so every `font-variation-settings` declaration referencing them silently does nothing. That's most of the typographic personality the file is reaching for. |
| Weight load is over-provisioned | ⚠️ | 4 weights × 2 families × variable opsz = a lot of font CSS even though only 400/600/700 are heavily used. |

**Fix:** request the SOFT and WONK axes from Google Fonts (those are non-standard so you'll need to use Google's variable-font URL form, e.g. `family=Fraunces:opsz,SOFT,WONK,wght@9..144,30..100,0..1,400..700`). Once they actually load, the design will gain the warmth it's currently only *implying*.

### A2. Animation implementation

| Animation | Implementation | Verdict |
|---|---|---|
| Hero `rise` entry animation (h1, tag, CTAs, meta, visual) | CSS keyframe with staggered delays (0s / 0.1s / 0.2s / 0.3s / 0.15s for visual) | ✅ smooth, GPU-friendly (`opacity` + `transform`) |
| `.hero-badge-dot` `pulse` | 2s infinite | ✅ |
| Hero slider auto-rotate | `setInterval` 4 s, `opacity` cross-fade 0.9 s | ✅ but **no pause-on-hover, no pause-when-tab-hidden, no `prefers-reduced-motion` opt-out**, no manual-interaction pause |
| `.reveal` scroll-in | IntersectionObserver, threshold 0.12, adds `.visible` | ✅ — correctly **once-only** behaviourally (no removal on exit) |
| Hover transforms (cards: `translateY` + `scale`) | many places with `cubic-bezier(0.34,1.56,0.64,1)` (springy) | ⚠️ overused — when *every* card bounces, nothing feels special |
| Nav underline grow | `transform: scaleX(0→1)` from right-to-left then origin swap on hover | ✅ idiomatic |
| `prefers-reduced-motion` honoured | ❌ **not implemented anywhere** | accessibility & perf issue |
| `will-change` hints | not used | acceptable but missing on slider could cause jank on weak GPUs |

### A3. Semantics & structure

**Working well:**
- `<nav>`, `<header class="hero">`, `<section>` × 10, `<footer>` — clean landmark structure.
- `id` anchors match nav links (`#categories`, `#why`, `#how`, `#brands`, `#locations`, `#enquiry`).
- Form labels are properly associated via `for`/`id`.

**Issues found:**

1. **Heading hierarchy break.** The **Enquiry** section uses `<h3>Tell us what you need…</h3>` (line 904) as its primary heading — it should be `<h2>` to match the other section heads. Same drift in How-it-works step titles using `<h4>` and footer `<h4>` without a parent `<h3>` — defensible, but a screen-reader user navigating by headings will see a jump from h2→h4.

2. **No `<main>` landmark** — the body has nav + header + 10 sections + footer but no `<main>` wrapping the primary content. Add `<main>` around everything between `</nav>` and `<footer>`.

3. **Trust strip stats** are flat `<div>`s. The "500+ / 2,00,000+ / 10 Lakh+ / 6 Showrooms" group is a definition list — `<dl><dt>500+</dt><dd>Product range…</dd></dl>` — much better for screen readers and SEO snippets.

4. **No `<picture>` / responsive images** anywhere — all hero/category images are raw `<img src="data:image/jpeg;base64,…">`.

5. **Slider dots use inline `onclick="goSlide(n)"`** (lines 471–475) instead of delegated listeners; missing `aria-label="Go to slide 2"` and `aria-current="true"` on the active dot. The slider itself has no `role="region" aria-roledescription="carousel"` or live-region announcements.

6. **`<button class="form-submit" onclick="submitEnquiry()">`** — inline onclick is the only one in the form; not broken, but inconsistent with the rest of the JS which uses `addEventListener`.

7. **Nested `<span>` inside `<span>` for "25+"** is harmless (line 411) — fine, just noting.

### A4. Broken refs / missing assets

| Reference | Status |
|---|---|
| `privacy-policy.html` (footer, twice) | ❌ **404** — only `Fairdeal Final v1.html` exists in the project directory |
| `terms.html` (footer, twice) | ❌ **404** — same |
| Logo image | ✅ inline base64 JPEG (270×194 ICC-tagged) |
| Hero / category / brand images | ✅ all inline base64 (this is *why* the file is 3.1 MB) |
| `tel:`, `mailto:`, `wa.me/…`, `maps.google.com` embeds | ✅ all valid |
| Google Fonts URL | ✅ valid (but see A1 — missing axes) |

### A5. Orphan CSS (unused declarations)

These rulesets are defined but **no element in the markup uses them** — pure dead weight (~50 lines):

- **`.loc-grid`, `.loc-card`, `.loc-card:hover`, `.loc-pin`, `.loc-name`, `.loc-addr`, `.loc-hours`, `.loc-actions`, `.loc-btn`, `.loc-btn-call`, `.loc-btn-map`** plus their media-query breakpoints (lines **278–293**) — the showroom area renders via the `.sf-*` tab finder only.
- **`.cta-band`, `.cta-band::before/::after`, `.cta-inner`, `.cta-band h2`, `.cta-band p`, `.cta-actions`, `.cta-band .btn-primary`** (lines **324–332**) — no `.cta-band` exists in the HTML.
- **`--gold: #C49A5C`** is declared as a token (line 26) but **never referenced via `var(--gold)`**; one place uses the literal hex inline (line 676 testimonial avatar) — the token is effectively orphan.

### A6. Inline-style scatter

Inline `style="…"` attributes are sprinkled liberally on testi-avatars (5 different background hex values), `.kicker` overrides, `margin-top` overrides on h2s, sf-map-side, contact-value width, etc. — 20+ instances. Functionally fine; design-system-wise it dilutes the variable system.

### A7. Performance

| Issue | Impact |
|---|---|
| Entire site is one **3.1 MB HTML file** with ~45 inline base64 images | TTFB-bound page; browser can't cache images independently; no parallel image fetch; HTML compresses but base64 wastes ~33% over binary; mobile users on patchy networks pay for everything before first paint |
| No `loading="lazy"` on `<img>` (only the iframe has it) | All 45 images decode eagerly |
| No `decoding="async"`, no `fetchpriority`, no `<link rel="preload">` for the LCP hero image | LCP unnecessarily late |
| No font preload (`<link rel="preload" as="font" …>`) | first-render fallback flash |
| 5 large hero slides + 6 category images all loaded immediately | wasted bandwidth |
| Repeated inline SVG star (5×) per testimonial × 6 cards = **30 inline SVGs for stars alone** | bloat |
| Repeated WhatsApp + phone SVG paths inlined many times | bloat |
| Map iframe re-loads on every tab click (good: `loading=lazy`; bad: each tab triggers a fresh Google Maps fetch) | network-heavy on tab switching |

### A8. Accessibility (quick triage, not a full WCAG sweep)

- ✅ Skip target IDs exist on every section.
- ❌ **No "Skip to main content" link.**
- ❌ **No `<main>` landmark.**
- ❌ Slider lacks ARIA carousel pattern; auto-rotates with no pause control.
- ❌ Hover-only affordances: category cards reveal nothing extra on focus (`:hover` only, no `:focus-within` equivalent for keyboard users).
- ❌ Form has `required` but no `aria-required`, no `aria-describedby` for the help text/placeholder, no live error region; the only feedback is `alert("Please enter…")`.
- ⚠️ Sky-blue `#1FB5E5` on white passes AA for large text but **fails AA (4.5:1) for body text** — used on body links (`.footer ul a:hover`) — fine for hover state, but ensure no normal body copy renders in raw `--primary`.
- ⚠️ Testi avatars use color-only differentiation; no contrast guarantee for the letter inside.
- ⚠️ FAB at `right:1.2rem;bottom:1.2rem` overlaps the form submit on narrow viewports.

### A9. SEO / meta

- ✅ Title, meta description, OG title/description/type all present and well-written.
- ❌ No `<link rel="canonical">`.
- ❌ No Twitter Card meta.
- ❌ No `<meta name="theme-color">` (mobile browser UI tinting).
- ❌ **No JSON-LD structured data.** For a 6-location appliance retailer, `LocalBusiness` (or `Store`) schema with `address`, `geo`, `openingHours`, `telephone`, `sameAs`, plus one entry per branch, is the single highest-ROI SEO addition you can make.
- ❌ `og:image` missing (no social preview thumbnail will render when the URL is pasted in WhatsApp/Slack/Twitter).
- ⚠️ Keywords meta tag is included — ignored by Google but harmless.

---

## PART B — Design Quality Assessment

### B1. Typography hierarchy

**What's right:** Fraunces × DM Sans is a sophisticated, contemporary pairing — a clear signal of taste. The serif's italic primary-blue emphasis (`em` inside h1, hero h2, story h2) is a memorable mark.

**Where it falls down:**
- **The intended warmth never lands** because SOFT/WONK aren't loaded (see A1). Right now Fraunces is rendering in its default-axis state — closer to a Modern serif than the soft, friendly Old-Style it could be.
- **Body copy size is 16 px globally** but the muted body greys (`--text-muted #5B6478`, `--text-soft #8B95A1`) are used in paragraphs at 0.9–1.05 rem. The combination can read thin on retina screens.
- **Letter-spacing on headings is `-0.015em`** — fine for h1, slightly too tight for h3 at 1.1 rem.
- **Kickers** at 0.75 rem with 0.18 em tracking are tasteful but the colour (`--primary-dark`) on warm cream sections has just-enough contrast — not generous.
- **Trust strip numbers** are 1.6–2.5 rem clamp — could go bigger; brand authority numbers usually want to breathe more.
- **Step numbers** use 1.25 rem Fraunces 700 inside a 54 px circle — at that small display size the serif loses character; consider DM Sans 700 or up-size to 1.5 rem.

### B2. Color & contrast

- **Primary cyan `#1FB5E5`** is bright and modern but slightly *digital-cool* for a 6-decade family business. Pairing with the gold token (`--gold #C49A5C`) was clearly the intent — that pairing would soften the cyan and add heritage warmth. Yet **gold is essentially unused.** Right now the palette feels mono-blue.
- **Warm cream `#FAF7F2`** sections are doing the right job of cooling the brightness.
- The enquiry band's bright cyan background (`background: var(--primary)`) is visually loud. White card on cyan is fine, but the second band of cyan after the cyan-tinged categories/why areas means the lower third of the page is **dominated by one hue**.
- Footer ink `#0A1929` is solid; secondary text at `rgba(255,255,255,0.65)` is slightly low — try 0.72.

### B3. Spacing & rhythm

- `section { padding-block: clamp(4rem, 9vw, 7rem) }` — clean vertical rhythm.
- **Hero grid `1.15fr / 1fr` at gap `clamp(2rem, 5vw, 4rem)`** — good asymmetry.
- **Categories `repeat(3, 1fr) gap 1.25rem`** — tight; 1.5rem would breathe more.
- **Brands grid: 6 cols × 27 tiles = 4.5 rows + one orphan in row 5** — the trailing partial row is visually weak; consider 5 cols (5 × 5 + 2 trailing → still partial), or making the grid auto-fill to evenly distribute.
- **Showroom finder panel `min-height: 320 px`** — fixed pixel min on a fluid grid; replace with `min-height: clamp(280px, 35vw, 360px)`.

### B4. Visual cohesion & datedness

- **What feels current:** badge with pulsing dot, kicker + serif h2 pattern, soft drop-shadows, springy hover transitions, IntersectionObserver reveal, WhatsApp-green CTA, cream/cyan/ink triad.
- **What feels 2021-vintage:**
  - Cards everywhere — categories, why, testimonials, business, loc — all the same white rounded rectangle with subtle border + drop shadow on hover. There's no rhythmic variation between sections, so the page reads as **9 versions of the same card layout**.
  - "Why us" SVG icons in light-blue rounded squares is the most generic visual motif on the page right now (used by every B2B SaaS landing in 2020–2023).
  - The five-step "How it works" horizontal connector line with circular step numbers is also very 2020.
  - Hero slider with auto-rotating overlay captions in dark gradient is a classic; competent but unmemorable.
- **Visual hierarchy:** the section-head pattern (kicker → h2 → sub-paragraph) is repeated identically 10 times. Consistency is good; the homogeneity dulls the experience.

### B5. Component-by-component notes

| Section | Strength | Weakness |
|---|---|---|
| **Nav** | Clean glass-blur, scrolled state, mobile-call CTA | Logo image is a large base64 JPEG — should be SVG; nav-cta and mobile-call-btn duplicate the same SVG icon |
| **Hero** | Strong copy, well-staggered entry, balanced layout, since-1966 badge is tasteful | Slider has no pause control, no SOFT/WONK so h1 feels stiffer than intended, 5 slides may be 2 too many for one rotation |
| **Trust strip** | High-contrast, focused | Just 4 numbers in a row — could earn more attention with a subtle separator stroke and a tiny since-1966 line connecting them |
| **Categories** | Clear 3×3 grid, good photography slots | All 9 cards identical weight — no anchor card / no feature row |
| **Why us** | 6 strong reasons, well-written | 6 identical generic-SaaS icon cards; rupee glyph in a square breaks visual consistency with SVG icons |
| **How it works** | Clear 5-step ladder | Standard step-ladder template; connector line is a flat gradient |
| **Story** | Best section — dark, atmospheric, well-paragraphed quote | Image is acknowledged as a placeholder in HTML comments — needs a real Fairdeal showroom photo |
| **Testimonials** | Real names, real showroom attributions | 30 inline star SVGs; cards are identical; Google badge could be more elegant |
| **Brands** | 27 logos communicates scale | Logos are SVG-text-only fallbacks (not real wordmarks); trailing partial row; opacity 0.7 → 1 on hover makes the wall look "dim" at rest |
| **Business / B2B** | Clear value prop + client list | Trusted-by pills feel like form tags; client logos themselves would carry far more weight |
| **Locations** | Tabbed finder is genuinely useful; embeds work | Re-loading the iframe on each tab is costly; map area is purely functional, no surrounding chrome |
| **Enquiry** | Big bright band; WhatsApp-first form is on-brand for India market | Whole band is `--primary` saturated cyan; form lacks inline validation; success state is a `window.open` with no in-page confirmation |
| **Footer** | Complete | Lots of inline `style=""` on contact items; missing pages linked twice |
| **FAB** | Standard WhatsApp pattern | Can overlap form submit on small screens |

---

## PART C — Recommendations for Evolution

> **Constraint kept:** every recommendation is a refinement of what's already on the page. No section moves, splits, merges, or disappears. Copy stays intact. Layout grids stay intact.

### C1. P0 — Fix the silent bugs

These cost nothing to fix and unlock latent quality:

1. **Load Fraunces SOFT & WONK axes** so the existing `font-variation-settings` declarations actually do something. This single fix delivers the visual warmth the design is reaching for.
2. **Remove orphan CSS** (`.loc-*`, `.cta-band*`) or **wire the `.loc-grid` into the page** as a compact "all 6 locations at a glance" block below the showroom finder — repurposes the existing styles rather than deleting.
3. **Remove the unused `--gold` token, OR put it to work** (recommended: use gold for the *since-1966* badge, story quote bar, and category-card kicker hover — see C3).
4. **Create the missing `privacy-policy.html` and `terms.html`** (or remove the links until they exist).
5. **Add `<main>` landmark, "Skip to main content" link, and `prefers-reduced-motion` media query** that disables `animation` and `transition` on `.reveal`, slider, pulse, and hover transforms.
6. **Bump the Enquiry section heading to `<h2>`** for hierarchy.
7. **Add JSON-LD `LocalBusiness` schema** with one branch per showroom (huge SEO win, zero design impact).
8. **Add `og:image`, canonical, `theme-color`.**

### C2. Typography upgrades

- Once SOFT/WONK loads, set up a small *typographic personality scale* so the warmth is intentional, not ambient:
  - **Display h1/h2:** `SOFT 80, WONK 1, opsz 144` (currently set but not loading) — keeps the friendly bowl/terminal flare.
  - **Inline `em` accents inside h1/h2:** `SOFT 100, WONK 1, ital 1` — the italic-blue moments become genuinely distinctive.
  - **Numbers in trust strip / hero meta:** `SOFT 30, opsz 144` — keep numerals architectural rather than syrupy.
  - **Story quote:** `SOFT 100, WONK 1, ital 1` — maximally warm in the darkest section, perfect contrast.
- **Body line-height bump** from 1.55 → 1.6 in long-form paragraphs (story, business, enquiry copy) for breathing room.
- **Letter-spacing on h3** loosen from `-0.015em` to `-0.005em` (size-dependent letter-spacing is more correct typographically).
- **Trust strip numbers:** lift the upper clamp from 2.5 rem → 3rem and tighten line-height to 0.95 so the digits feel monumental.

### C3. Color & treatment upgrades

- **Activate gold as the heritage accent.** It needs to appear in 3–5 places to read as intentional:
  - Hero badge dot pulse — alternate the pulse between cyan and gold (subtle).
  - `since 1966` chip in hero-visual top-left — change "1966" digits to gold.
  - Story-quote left border — replace `--primary` with gold gradient.
  - Footer `Made in Kolkata · Serving families since 1966` — gold italic.
  - Kicker color in story section only — gold instead of cyan.
- **De-saturate the Enquiry band:** instead of full `--primary` cyan, use a `linear-gradient(135deg, var(--primary-darker), var(--ink) 70%)` with a single cyan accent (badge, focus rings). The white form card will pop harder against an ink ground.
- **Add a hairline gold underline** under the section-head kicker on dark sections only — small, repeated treatment to tie the heritage thread through.

### C4. Spacing upgrades

- **Categories gap** 1.25 rem → 1.5 rem; **brands grid** consider `repeat(auto-fit, minmax(140px, 1fr))` so partial rows visually center.
- **Hero-meta divider** above stats: `border-top: 1px solid var(--border)` becomes `border-image: linear-gradient(90deg, var(--gold), transparent) 1` — a 1-line change that adds character.
- **Increase footer section vertical padding** from 4rem/2rem to 5rem/2.5rem to match the rhythm of body sections.

### C5. Animation upgrades — *more polish, no perf cost*

- **Hero slider:**
  - Add a thin progress bar at the bottom of the active slide that drains over 4 s — instantly modern, gives a sense of pacing, makes the auto-rotate feel intentional rather than ambient.
  - Pause on `:hover` and on `document.visibilityState === 'hidden'`.
  - Reset interval on manual dot click.
- **Hero-visual:** add a slow `transform: scale(1.0 → 1.05)` *Ken Burns* on the active slide image (`animation: 6s ease-out`); restart on slide change. Costs nothing on GPU, dramatically more cinematic.
- **Trust strip numbers:** count-up animation when scrolled into view (`IntersectionObserver` already in the file; reuse). 500+ → counts from 0 → 500. Standard library-free implementation, ~20 lines of JS.
- **Category cards:** replace the springy bounce on hover with a quieter `translateY(-4px)` + a 1 px stroke colour transition + an *image* `transform: scale(1.04)` on the inner img only. Less toy, more editorial. Also add `:focus-within` to mirror hover for keyboard users.
- **Why-us cards:** replace the icon-on-tinted-square with a thin 1.5 px stroked circle + colored stroke on hover (the icon swap-fill is what dates it). Try `stroke-dashoffset` reveal on the icon path when card enters viewport — once-only animation.
- **How-it-works steps:** animate the connector line drawing left-to-right via `clip-path: inset(0 100% 0 0)` → `inset(0 0 0 0)` over 1.2 s when the section enters viewport. Steps then fade-in sequenced 120 ms apart. Cinematic, no library.
- **Brand wall:** subtle conveyor / marquee on small screens only (`@media (max-width: 600px)`), with `animation-play-state: paused` on hover/focus. Above 600 px keep the static grid.
- **Story section:** parallax-lite — translate the image up by 30 px as the user scrolls past, controlled by `transform: translate3d(0, calc(var(--scroll-pct) * -30px), 0)` via a small JS scroll handler. (No library; reduced-motion respected.)
- **Testimonials:** swap the static 3-column grid for the same grid + a left/right scroll-snap horizontal carousel on mobile (`scroll-snap-type: x mandatory` per card) — feels more native on touch.
- **Form submit:** before opening WhatsApp, show a 2-second in-page success toast (`role="status"`) — "Opening WhatsApp with your details…" — much more reassuring than just `window.open`.
- **FAB:** add a subtle 4 s gentle wobble after 10 s idle (`@keyframes wobble`) — only once per page-load — draws the eye without nagging.

### C6. Micro-interaction additions

- **Hover-revealed price-range chip** on category cards: small pill saying e.g. "from ₹14,900" appears bottom-right of image on hover. Adds commercial information without redesigning the card.
- **Tabs in showroom finder** — animated underline that slides between tabs instead of appearing instantly under the active one (`transform: translateX(...)` driven by tab index).
- **Form fields** — animated label float on focus (label translates from inside the field to above), plus inline checkmark on valid input. Single field treatment, no library.
- **Trust strip stat numbers** — gold underline that sweeps in beneath each number 200 ms after the count-up settles.

### C7. Performance refinements

These are technical-quality wins that *also* feel like polish (faster page = more premium):

- **Externalise base64 images** to actual files (`assets/brands/*.svg`, `assets/hero/*.webp`). Cuts the HTML payload by ~95 %.
- **Use real brand wordmark SVGs** for the brand wall (or licensed brand-asset PNGs at 2x). The current text-rendered SVG fallbacks are the single most-dated visual element on the page.
- **Add `loading="lazy" decoding="async"`** to all `<img>` except the LCP hero slide.
- **Add `<link rel="preload" as="image">`** for hero slide 1.
- **Use `<picture>` with WebP/AVIF + JPG fallback** for hero and category images.
- **Replace the 30 inline star SVGs** in testimonials with a single `<svg><symbol id="star">…</symbol></svg>` referenced via `<use href="#star"/>`.
- **Showroom map** — only load the iframe for the active tab; for inactive tabs swap to a static map image (`maps.googleapis.com/maps/api/staticmap`) until clicked.

### C8. SEO / structured-data deliverable (drop-in)

Add a single `<script type="application/ld+json">` block before `</head>` declaring `LocalBusiness` with `branchOf` for each of the 6 showrooms. Combined with the existing meta tags and the strong copy, this should noticeably lift local-pack visibility in Kolkata neighbourhood searches for "AC dealer Behala", "TV showroom Tollygunge", etc.

---

## Suggested implementation order

If you proceed to enhancement, I'd sequence it like this:

1. **Quick wins (≈ half a day):** SOFT/WONK axes, prefers-reduced-motion, `<main>` + skip link, h2 fix on enquiry, og:image, theme-color, canonical, remove orphan CSS, create the two policy pages.
2. **Heritage layer (≈ half a day):** activate `--gold` in the 5 places above, recolour the Enquiry band, gold accents on kickers/borders.
3. **Animation polish (≈ 1 day):** hero progress bar + pause-on-hover + Ken Burns, trust-strip count-up, how-it-works line draw-in, story parallax, form success toast.
4. **Performance pass (≈ 1 day):** externalise base64, real brand SVGs, `<picture>` + lazy/decoding, `<symbol>`-ised stars, static map fallback.
5. **JSON-LD + meta polish (≈ 2 hours):** LocalBusiness schema with all 6 branches.

That sequence keeps every change *additive* to the existing structure, content, and layout — exactly the constraint.

---

**TL;DR.** The site is well-designed and exceptionally well-written, but it's quietly under-delivering: the typographic personality it codes for isn't loading, the heritage gold accent is declared but never used, ~80 lines of CSS go to dead-letter classes, two footer pages don't exist, and the 3.1 MB inline-base64 payload is invisibly hurting first-load. None of that requires redesign — three or four focused passes will materially lift the work into the modern, dynamic feeling you're after, while keeping the content, voice, and layout you've already nailed.
