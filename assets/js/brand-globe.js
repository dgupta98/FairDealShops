/* ============================================================
   FAIRDEAL — Brand Cylinder (camera-roll style)
   3 horizontal rings of logos wrapping a vertical glass cylinder.
   Middle ring = flagship brands (larger). Spins steadily around
   the Y axis like a film reel. Drag to adjust speed.

   Click a chip to zoom: the cylinder pauses, the chip rotates to
   face the camera, scales up, and translates forward. Click outside
   (or press Escape) to release.
   ============================================================ */

class BrandCylinder {
  constructor(scene) {
    this.scene = scene;
    this.rotator = scene.querySelector('.brand-globe-rotator');
    this.items = Array.from(scene.querySelectorAll('.brand-globe-item'));
    if (!this.items.length || !this.rotator) return;

    // Ring plan: middle (major, source order 0..8), top (9..17), bottom (18..26)
    this.rings = [
      { startIdx: 9,  count: 9, y: -1, offset: Math.PI / 9 },  // top
      { startIdx: 0,  count: 9, y:  0, offset: 0 },             // middle (flagship)
      { startIdx: 18, count: 9, y:  1, offset: Math.PI / 9 },  // bottom
    ];

    this.rotY = 0;
    this.tiltX = -0.13;
    this.velY = 0.0022;
    this.baseVel = 0.0022;
    this.dragging = false;
    this.pendingDrag = null;
    this.lastPointer = null;

    // Hover state
    this.hoveredIdx = -1;
    this.hoverProgress = new Float32Array(this.items.length);

    // Zoom state — one chip in focus at a time
    this.zoomedIdx = -1;
    this.zoomProgress = 0;          // 0 → 1 ease toward zoomed
    this.targetRotY = null;         // rotY destination so chip faces camera

    // Per-chip ring geometry (filled in measure() → positionChips())
    this.chipGeom = new Array(this.items.length);

    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.size = 0;
    this.radius = 0;
    this.vSpacing = 0;

    this.measure = this.measure.bind(this);
    this.tick = this.tick.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onResize = () => { this.measure(); this.positionChips(); };

    this.measure();
    this.positionChips();

    window.addEventListener('resize', this.onResize, { passive: true });
    this.scene.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove, { passive: true });
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('pointercancel', this.onPointerUp);
    document.addEventListener('keydown', this.onKeyDown);

    this.items.forEach((el, idx) => {
      const activate = () => {
        if (this.dragging || this.zoomedIdx >= 0) return;
        this.hoveredIdx = idx;
      };
      const deactivate = () => {
        if (this.hoveredIdx === idx) this.hoveredIdx = -1;
      };
      el.addEventListener('pointerenter', activate);
      el.addEventListener('pointerleave', deactivate);
      el.addEventListener('focus', activate);
      el.addEventListener('blur', deactivate);
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleZoom(idx);
      });
    });

    if (this.reducedMotion) {
      this.velY = 0;
    }
    requestAnimationFrame(this.tick);
  }

  measure() {
    const rect = this.scene.getBoundingClientRect();
    this.size = Math.min(rect.width, rect.height);
    // Cylinder radius tuned to keep neighbouring chips on the same ring close
    // along the arc (chord ≈ 2R·sin(20°) for 9 chips). Tighter than the scene
    // can afford, so empty arc-space between chips stays small.
    this.radius = Math.min(rect.width * 0.25, rect.height * 0.42);
    this.vSpacing = rect.height * 0.22;
  }

  positionChips() {
    for (const ring of this.rings) {
      for (let i = 0; i < ring.count; i++) {
        const theta = (i / ring.count) * Math.PI * 2 + ring.offset;
        const idx = ring.startIdx + i;
        if (idx >= this.items.length) continue;
        this.chipGeom[idx] = {
          x: Math.sin(theta) * this.radius,
          y: ring.y * this.vSpacing,
          z: Math.cos(theta) * this.radius,
          yaw: theta,
        };
      }
    }
  }

  toggleZoom(idx) {
    if (this.zoomedIdx === idx) {
      this.exitZoom();
    } else {
      this.enterZoom(idx);
    }
  }

  enterZoom(idx) {
    const geom = this.chipGeom[idx];
    if (!geom) return;
    // Remove zoomed class from any previous target
    if (this.zoomedIdx >= 0) {
      this.items[this.zoomedIdx].classList.remove('is-zoomed-target');
    }
    this.zoomedIdx = idx;
    this.hoveredIdx = -1;
    this.velY = 0;
    // Pick shortest rotation path so the chip's yaw faces the camera.
    // World-Y rotation of a chip = rotY + yaw; we want this to be 0 (mod 2π).
    this.targetRotY = -geom.yaw;
    this.scene.classList.add('is-zoomed');
    this.items[idx].classList.add('is-zoomed-target');
  }

  exitZoom() {
    if (this.zoomedIdx < 0) return;
    this.items[this.zoomedIdx].classList.remove('is-zoomed-target');
    this.zoomedIdx = -1;
    this.targetRotY = null;
    this.scene.classList.remove('is-zoomed');
    // Resume spin
    this.velY = this.baseVel;
  }

  onKeyDown(e) {
    if (e.key === 'Escape' && this.zoomedIdx >= 0) {
      this.exitZoom();
    }
  }

  onPointerDown(e) {
    // If zoomed and click lands outside any chip, exit zoom.
    if (this.zoomedIdx >= 0 && !e.target.closest('.brand-globe-item')) {
      this.exitZoom();
      return;
    }
    if (e.target.closest('.brand-globe-item')) {
      this.pendingDrag = { x: e.clientX, y: e.clientY, pointerId: e.pointerId };
      return;
    }
    this.startDrag(e);
  }

  startDrag(e) {
    if (this.zoomedIdx >= 0) return;
    this.dragging = true;
    this.hoveredIdx = -1;
    this.lastPointer = { x: e.clientX, y: e.clientY };
    this.scene.classList.add('is-dragging');
    try { this.scene.setPointerCapture(e.pointerId); } catch (_) {}
  }

  onPointerMove(e) {
    if (!this.dragging) {
      if (this.pendingDrag) {
        const dx = e.clientX - this.pendingDrag.x;
        const dy = e.clientY - this.pendingDrag.y;
        if (dx * dx + dy * dy > 36) {
          this.startDrag({ clientX: this.pendingDrag.x, clientY: this.pendingDrag.y, pointerId: this.pendingDrag.pointerId });
        }
      }
      return;
    }
    const dx = e.clientX - this.lastPointer.x;
    this.lastPointer = { x: e.clientX, y: e.clientY };
    this.velY = dx * 0.005;
    this.rotY += this.velY;
  }

  onPointerUp() {
    this.dragging = false;
    this.pendingDrag = null;
    this.scene.classList.remove('is-dragging');
    if (this.zoomedIdx < 0 && Math.abs(this.velY) < this.baseVel) this.velY = this.baseVel;
  }

  // Normalize an angle delta to (-π, π] so easing takes the shortest path.
  shortestDelta(target, current) {
    const TAU = Math.PI * 2;
    let d = (target - current) % TAU;
    if (d > Math.PI)  d -= TAU;
    if (d < -Math.PI) d += TAU;
    return d;
  }

  tick() {
    // ----- Cylinder rotation -----
    if (this.zoomedIdx >= 0 && this.targetRotY !== null) {
      // Ease rotY to bring the zoomed chip to face the camera (shortest path).
      const delta = this.shortestDelta(this.targetRotY, this.rotY);
      this.rotY += delta * 0.10;
      this.velY = 0;
    } else if (!this.dragging) {
      if (this.hoveredIdx >= 0) {
        // Hover pauses the reel at its current angle — smooth ramp down.
        this.velY += (0 - this.velY) * 0.18;
      } else {
        // Settle back toward base spin speed when nothing is hovered.
        this.velY += (this.baseVel - this.velY) * 0.05;
      }
      this.rotY += this.velY;
    } else {
      this.rotY += this.velY;
    }

    // Cylinder transform (parent)
    this.rotator.style.transform =
      `rotateX(${this.tiltX.toFixed(4)}rad) rotateY(${this.rotY.toFixed(4)}rad)`;

    // ----- Zoom progress -----
    const zoomTarget = this.zoomedIdx >= 0 ? 1 : 0;
    const zoomEase = this.reducedMotion ? 1 : 0.12;
    this.zoomProgress += (zoomTarget - this.zoomProgress) * zoomEase;

    // ----- Per-chip transforms -----
    const easeFactor = this.reducedMotion ? 1 : 0.22;
    for (let i = 0; i < this.items.length; i++) {
      const geom = this.chipGeom[i];
      if (!geom) continue;

      const target = (i === this.hoveredIdx) ? 1 : 0;
      this.hoverProgress[i] += (target - this.hoverProgress[i]) * easeFactor;
      const p = this.hoverProgress[i];
      let popScale = 1 + p * 0.32;          // hover scales up to ~1.32x
      let zLift = p * 50;                   // pop ~50px toward camera on hover

      // Zoomed chip — strong scale + translateZ forward.
      if (i === this.zoomedIdx) {
        popScale = 1 + this.zoomProgress * 1.05;  // up to ~2.05x
        zLift = this.zoomProgress * 220;          // 220px forward
      }

      this.items[i].style.transform =
        `translate3d(${geom.x.toFixed(2)}px, ${geom.y.toFixed(2)}px, ${(geom.z + zLift).toFixed(2)}px) ` +
        `rotateY(${geom.yaw.toFixed(4)}rad) ` +
        `scale(${popScale.toFixed(3)})`;
    }

    requestAnimationFrame(this.tick);
  }
}

function init() {
  document.querySelectorAll('[data-brand-globe]').forEach(el => new BrandCylinder(el));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
