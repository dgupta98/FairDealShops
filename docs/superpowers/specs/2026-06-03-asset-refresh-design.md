# Fairdeal asset refresh — design spec

**Date:** 2026-06-03
**Status:** Approved
**Scope:** Replace placeholder logos, hero, category, and showroom images with real brand assets supplied by the client.

## Goals

1. Use real brand logos in place of monochrome SVG placeholders for the 21 brands the client supplied logos for.
2. Use real product photography for the hero slider and category grid in place of stock images.
3. Use a real Fairdeal showroom photo in the Story section in place of the placeholder illustration.
4. Replace the site logo (nav, footer, policy pages) with the client-supplied short logo.
5. Optimize the heavy 7–8 MB source PNGs to web-friendly WebP so first-paint stays fast.

## Non-goals

- No layout, copy, structure, or alt-text changes (alt text already keyword-rich from prior pass).
- No new brands added. No brands removed.
- No favicon / OG image changes (already in place).
- No sourcing replacements for the 6 brands without supplied logos (Crompton, Haier, Hindware, Midea, Mitsubishi Heavy, TCL) — they keep their current placeholder SVGs.
- The two spare images (`tv3.png`, `ac3.png`) are not used. Reason: 5-slide hero already covers all categories; more slides hurts engagement and adds payload.

## Inputs (in `website images/`)

- `fairdeal short logo.png` — site logo (nav + footer)
- `fairdeal full logo.png` — held in reserve, not wired up
- `brand logos/` — 23 logo files (21 used, 2 for brands not on site)
- 13 product PNGs (tv1-3, ac1-3, ref1, wm1, kitchen1, soundbar1, water purifier1, fan1, personal care1)
- `shop1.png` — showroom photo

## Outputs

### Site logo
- `assets/img/ui/logo-fairdeal.png` — copy of `fairdeal short logo.png`
- HTML refs in `Fairdeal v2.html`, `index.html`, `privacy-policy.html`, `terms.html` updated from `assets/img/ui/logo.svg` to `assets/img/ui/logo-fairdeal.png` in nav + footer locations.
- Favicons left as-is (the SVG favicon still works for browser tabs).

### Brand logos (21 replacements)

| Source file | → | `assets/brands/` target |
|---|---|---|
| `LG_logo_(2014).svg.png` | → | `lg.png` |
| `samsung_logo_PNG8.png` | → | `samsung.png` |
| `DAIKIN_logo.svg.png` | → | `daikin.png` |
| `Voltas_logo.svg.png` | → | `voltas.png` |
| `hitachi logo.png` | → | `hitachi.png` |
| `Godrej_Logo.svg.png` | → | `godrej.png` |
| `panasonic logo.webp` | → | `panasonic.webp` |
| `ogeneral logo.png` | → | `ogeneral.png` |
| `carrier logo.png` | → | `carrier.png` |
| `ifb logo.png` | → | `ifb.png` |
| `Philips_shield_(2013).svg.png` | → | `philips.png` |
| `bajaj logo.png` | → | `bajaj.png` |
| `prestige-logo.png` | → | `prestige.png` |
| `kutchina logo.jpg` | → | `kutchina.jpg` |
| `Faber logo.png` | → | `faber.png` |
| `kelvinator logo.png` | → | `kelvinator.png` |
| `bpl logo.png` | → | `bpl.png` |
| `symphony logo.jpg` | → | `symphony.jpg` |
| `venus logo.jpg` | → | `venus.jpg` |
| `Boat-logo.png` | → | `boat.png` |
| `pureit logo.png` | → | `pureit.png` |

The remaining 6 brand tiles (Crompton, Haier, Hindware, Midea, Mitsubishi Heavy, TCL) continue to use their current SVG placeholders.

### Hero images (5 slides, all optimized to WebP)

| Source | → | Output |
|---|---|---|
| `tv1.png` | → | `assets/img/hero/01-tvs.webp` |
| `ac1.png` | → | `assets/img/hero/02-acs.webp` |
| `ref1.png` | → | `assets/img/hero/03-fridges.webp` |
| `wm1.png` | → | `assets/img/hero/04-washing.webp` |
| `kitchen1.png` | → | `assets/img/hero/05-kitchen.webp` |

Also update head preload from `01-tvs.jpg` to `01-tvs.webp`.

### Category grid (9 cards, all optimized to WebP)

| Source | → | Output |
|---|---|---|
| `tv2.png` | → | `assets/img/lifestyle/cat-01-tvs.webp` |
| `soundbar1.png` | → | `assets/img/lifestyle/cat-02-audio.webp` |
| `ac2.png` | → | `assets/img/lifestyle/cat-03-acs.webp` |
| `ref1.png` | → | `assets/img/lifestyle/cat-04-fridges.webp` |
| `wm1.png` | → | `assets/img/lifestyle/cat-05-washing.webp` |
| `kitchen1.png` | → | `assets/img/lifestyle/cat-06-kitchen.webp` |
| `water purifier1.png` | → | `assets/img/lifestyle/cat-07-water.webp` |
| `fan1.png` | → | `assets/img/lifestyle/cat-08-fans.webp` |
| `personal care1.png` | → | `assets/img/lifestyle/cat-09-personal.webp` |

### Story section
- `shop1.png` → `assets/img/lifestyle/story-showroom.webp`
- HTML img src updated from `story.svg` to `story-showroom.webp`.

## Image optimization parameters

- **Format:** WebP, quality 82.
- **Max width:** 1600 px (hero), 1200 px (category cards, story).
- **Tool:** macOS `sips` for resize + `cwebp` if available, else `sips -s format webp` fallback.
- **Target per-file:** 150–300 KB.

## HTML changes summary

Files edited:
- `Fairdeal v2.html` and `index.html` (mirror each other after edits)
  - Logo `<img src>` in nav (~line 350) and footer (~line 1100): `logo.svg` → `logo-fairdeal.png`
  - Hero slider 5 `<img src>` swaps
  - Category grid 9 `<img src>` swaps
  - Brand wall 21 `<img src>` swaps (extensions only — file basenames already match)
  - Story `<img src>`: `story.svg` → `story-showroom.webp`
  - `<link rel="preload">` head update: `01-tvs.jpg` → `01-tvs.webp`
  - Increment cache-bust `?v=3` → `?v=4` on CSS links
- `privacy-policy.html` and `terms.html` — logo `<img src>` swap only

Files unchanged:
- All CSS, JS, structured-data JSON-LD, sitemap, robots, manifest.

## Risks & verification

- WebP support: every browser shipped since 2020 supports it. Skip JPG fallback.
- Image dimensions vary (some PNGs are tall portraits, some landscape). After conversion, spot-check that no card's image looks cropped or letterboxed badly. If a card looks wrong, swap to a different source variant.
- After all swaps: run `find assets -type f` listing and `grep` for any remaining `.svg` brand references that weren't replaced, confirm the 6 placeholders are the only ones.

## Deliverable

A single working preview at `localhost:8765/index.html` with real logos, real product photos, and a real showroom photo — fast on first paint (< 1.2 MB above-the-fold) — with no broken image references.
