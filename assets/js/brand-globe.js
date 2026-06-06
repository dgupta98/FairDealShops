/* ============================================================
   FAIRDEAL — Brand Cylinder (camera-roll style)
   3 horizontal rings of logos wrapping a vertical glass cylinder.
   Middle ring = flagship brands (larger). Spins steadily around
   the Y axis like a film reel. Drag to adjust speed.
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
    this.onResize = () => { this.measure(); this.positionChips(); };

    this.measure();
    this.positionChips();

    window.addEventListener('resize', this.onResize, { passive: true });
    this.scene.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove, { passive: true });
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('pointercancel', this.onPointerUp);

    this.items.forEach((el, idx) => {
      const activate = () => {
        if (this.dragging) return;
        this.hoveredIdx = idx;
      };
      const deactivate = () => {
        if (this.hoveredIdx === idx) this.hoveredIdx = -1;
      };
      el.addEventListener('pointerenter', activate);
      el.addEventListener('pointerleave', deactivate);
      el.addEventListener('focus', activate);
      el.addEventListener('blur', deactivate);
    });

    if (this.reducedMotion) {
      this.velY = 0;
    }
    requestAnimationFrame(this.tick);
  }

  measure() {
    const rect = this.scene.getBoundingClientRect();
    // Drive every dimension (chip size, earth size, radius, vSpacing) from a
    // single `size` so the whole composition scales together across viewports.
    this.size = Math.min(rect.width, rect.height);
    this.scene.style.setProperty('--scene-size', `${this.size}px`);
    this.radius = this.size * 0.60;
    this.vSpacing = this.size * 0.30;
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

  onPointerDown(e) {
    if (e.target.closest('.brand-globe-item')) {
      this.pendingDrag = { x: e.clientX, y: e.clientY, pointerId: e.pointerId };
      return;
    }
    this.startDrag(e);
  }

  startDrag(e) {
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
    if (Math.abs(this.velY) < this.baseVel) this.velY = this.baseVel;
  }

  tick() {
    if (!this.dragging) {
      if (this.hoveredIdx >= 0) {
        // Hover pauses the reel at its current angle — smooth ramp down.
        this.velY += (0 - this.velY) * 0.18;
      } else {
        // Settle back toward base spin speed when nothing is hovered.
        this.velY += (this.baseVel - this.velY) * 0.05;
      }
    }
    this.rotY += this.velY;

    this.rotator.style.transform =
      `rotateX(${this.tiltX.toFixed(4)}rad) rotateY(${this.rotY.toFixed(4)}rad)`;

    const easeFactor = this.reducedMotion ? 1 : 0.22;
    for (let i = 0; i < this.items.length; i++) {
      const geom = this.chipGeom[i];
      if (!geom) continue;

      const target = (i === this.hoveredIdx) ? 1 : 0;
      this.hoverProgress[i] += (target - this.hoverProgress[i]) * easeFactor;
      const p = this.hoverProgress[i];
      const popScale = 1 + p * 0.32;
      const zLift = p * 50;

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
