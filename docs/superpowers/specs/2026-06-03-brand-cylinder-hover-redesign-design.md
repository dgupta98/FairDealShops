# Brand cylinder hover redesign

**Status:** Approved design, ready for implementation
**Date:** 2026-06-03
**Scope:** `assets/js/brand-globe.js`, `assets/css/sections.css`, `Fairdeal v2.html` brand section markup

## Problem

The current hover treatment on the brand cylinder has three defects:

1. **Perceived lag.** Hovering a chip eases the cylinder rotation toward zero via a 0.06 lerp factor inside the rAF tick. The reel visibly decelerates over ~1 second every time the cursor crosses a chip. Users read this as the page "stuttering."
2. **Pop doesn't read.** The hovered chip keeps its `rotateY(theta)` and so still faces tangent to the cylinder — chips on the far side, sides, or quarter-turns aren't actually facing the camera when they pop. The translateZ lift happens, but the chip isn't square to the viewer, so the highlight reads weakly.
3. **Heavy paint stack.** Hover triggers simultaneous changes to background, filter (5 stacked `drop-shadow` layers), and a `background-position` shimmer keyframe on the rim pseudo. Combined with the cylinder still re-rendering 27 chips per frame, the GPU has too much to do in too few milliseconds.

## Goals

- Smooth: no decelerating motion, no fighting transitions
- Crisp: single clean highlight, no busy gradient shifts
- Genuine pop: chip squarely faces the viewer when lifted

## Non-goals

- Changing the chip count, ring layout, or major-vs-secondary sizing
- Changing the cylinder geometry, drag behavior, or layout
- Adding sound, parallax, or tilt-on-cursor effects

---

## Architecture

The hover system has three units:

### Unit 1 — Per-chip state (JS)

`BrandCylinder` gains two new fields:

- `hoverProgress: Float32Array(27)` — current animation progress for each chip, 0 = idle, 1 = fully popped
- `hoveredIdx: number` — single index (0–26) currently hovered, or `-1`

Replaces the existing `hoverCount` integer. Only one chip can be in hover state at a time.

### Unit 2 — Per-frame transform composer (JS)

`positionChips()` no longer writes a static `--base-transform` to CSS. Instead it caches `{x, y, z, chipYaw}` on each chip's DOM node (via dataset or a JS-side array).

`tick()` rewrites every chip's transform each frame:

```
for each chip i:
  target          = (i === hoveredIdx) ? 1 : 0
  hoverProgress[i] += (target - hoverProgress[i]) * 0.18
  p               = hoverProgress[i]
  liftZ           = p * 90
  popScale        = 1 + p * 0.42
  counterYaw      = p * (-rotY - chipYaw)
  chip.style.transform =
    `translate3d(${x}px, ${y}px, ${z}px) rotateY(${chipYaw + counterYaw}rad) translateZ(${liftZ}px) scale(${popScale})`
```

The counter-rotation term, weighted by `p`, smoothly interpolates the chip from "rotating with the ring" (p=0) to "facing the camera squarely" (p=1) as the lift animates in.

The cylinder spin itself is unchanged: `velY = baseVel` always (no pause-on-hover). The lerp toward zero is removed.

### Unit 3 — Highlight visuals (CSS + DOM)

Each chip's markup grows one sibling element inside the anchor:

```html
<a class="brand-globe-item" aria-label="LG">
  <span class="brand-globe-halo" aria-hidden="true"></span>
  <img src="…" alt=""/>
</a>
```

The halo sits at `z-index: -1`, sized ~180% of the chip's bounding box (overflows the hex naturally), with a radial cyan gradient and `filter: blur(14px)`. It defaults to `opacity: 0; transform: scale(0.6)`. On `.brand-globe-item:hover`/`:focus-visible` it transitions to `opacity: 1; transform: scale(1)` over 280ms ease-out.

The chip rim glow simplifies to **one** `drop-shadow(0 0 14px rgba(34, 211, 238, 0.85))` on hover, transitioned 280ms ease-out. The `::before` masked gradient rim stays but only its opacity changes on hover (0.55 → 1.0). No more shimmer animation, no background swap, no spring overshoot.

---

## Interface contract between units

| From | To | What |
|------|-----|------|
| pointer/focus events | `hoveredIdx` (Unit 1) | Which chip is currently active |
| `hoveredIdx` (Unit 1) | `tick()` (Unit 2) | Read each frame to compute targets |
| `tick()` (Unit 2) | chip DOM | Writes inline `transform` per frame |
| CSS `:hover`/`:focus-visible` | halo + rim pseudo (Unit 3) | Drives opacity + halo scale transitions |

Units 2 and 3 operate on independent properties (transform vs filter/opacity) so they never conflict.

---

## Event handlers

Replaces the existing per-item enter/leave/focus/blur listeners that drove `hoverCount++`/`hoverCount--`:

```js
items.forEach((el, idx) => {
  const activate = () => { if (!this.dragging) this.hoveredIdx = idx; };
  const deactivate = () => { if (this.hoveredIdx === idx) this.hoveredIdx = -1; };
  el.addEventListener('pointerenter', activate);
  el.addEventListener('pointerleave', deactivate);
  el.addEventListener('focus', activate);
  el.addEventListener('blur', deactivate);
});
```

When drag starts (`startDrag()`), set `hoveredIdx = -1`. When drag ends (`onPointerUp`), leave it -1; hover resumes naturally on next `pointerenter`.

---

## Reduced motion

When `prefers-reduced-motion: reduce` is detected:
- Cylinder remains stopped (existing behavior — `velY = 0`)
- `hoverProgress` snaps to target instantly (factor 1.0 instead of 0.18) — pop still happens, no easing tween
- Halo opacity transition shortened to 1ms via the existing global CSS rule that already applies

---

## Edge cases

| Case | Handling |
|------|----------|
| Pointer between two overlapping popped chips | Only the most recent `pointerenter` wins; older chip's `pointerleave` clears its slot via the `if (hoveredIdx === idx)` guard |
| Tap on touch device | Existing `pendingDrag` threshold means a tap < 6px doesn't start drag; the chip's link fires normally. `pointerenter` on touch may or may not fire depending on platform — we don't depend on it |
| Keyboard tab through chips | `focus` fires `activate`, `blur` fires `deactivate`. `:focus-visible` CSS handles the highlight |
| Drag with stylus while finger over chip | `dragging = true` → suppresses hover; chip eases back to 0 |
| Halo overlapping neighbor chip | `pointer-events: none` on `.brand-globe-halo` so it doesn't block hit-testing |

---

## Files touched

| File | Change |
|------|--------|
| `assets/js/brand-globe.js` | Replace `hoverCount` with `hoveredIdx` + `hoverProgress`. Move transform composition from `positionChips` into `tick`. Remove pause-on-hover lerp. New event handlers. |
| `assets/css/sections.css` | Remove `transition: transform`, `@keyframes brand-rim-shimmer`, spring overshoot, hover background swap, 5-stack drop-shadow, `padding` change on `::before`. Add `.brand-globe-halo` styles. Simplify hover to single drop-shadow + halo opacity. |
| `Fairdeal v2.html` | Add `<span class="brand-globe-halo" aria-hidden="true"></span>` as first child inside each of the 27 `.brand-globe-item` anchors. Bump CSS+JS cache markers v=15 → v=16. |
| `index.html` | Re-sync from `Fairdeal v2.html` via `cp`. |

---

## Verification

Manual checks after implementation:

1. Cylinder rotates at full speed while pointer hovers any chip — no deceleration visible.
2. Hovered chip squarely faces the viewer regardless of where it is on the ring (front, side, quarter-turn).
3. Cursor leaves chip → chip eases back to ring position within ~250ms with no jitter.
4. Tab through chips with keyboard → focused chip pops, blur returns it.
5. Drag the cylinder while pointer crosses chips → no popping during drag; resumes on release.
6. macOS Safari + Chrome + Firefox: no paint jank visible in DevTools performance recording.
7. `prefers-reduced-motion: reduce`: chip pop is instant (no easing), cylinder remains still.

---

## Out of scope (future work)

- Brand-name label revealed near the chip on hover (would require additional DOM and positioning)
- Cylinder slow-spin variant for sections in deep scroll viewports
- Spinning the reel via scroll position
