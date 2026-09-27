class WebConstraint {
  constructor({ anchor = { x: 0, y: 0, z: 0 }, length = 4, damping = 0.99 } = {}) {
    this.anchor = { ...anchor };
    this.length = length;
    this.damping = damping;
    this.body = { x: 0, y: -length, z: 0 };
    this.attached = false;
    this.velocity = 0;
  }

  attach(position) {
    this.attached = true;
    this.body = { ...position };
    return this.getState();
  }

  update(dt, { gravity = 9.8 } = {}) {
    if (!this.attached) {
      this.body.y -= gravity * (dt || 0.016) * 0.55;
      this.velocity = Math.max(0, this.velocity * this.damping + gravity * (dt || 0.016));
      return this.getState();
    }

    const dx = this.body.x - this.anchor.x;
    const dy = this.body.y - this.anchor.y;
    const dz = this.body.z - this.anchor.z;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1e-6;
    const diff = dist - this.length;
    const pull = diff / dist;

    this.body.x -= dx * pull * 0.12;
    this.body.y -= dy * pull * 0.12;
    this.body.z -= dz * pull * 0.12;

    const tension = Math.min(Math.abs(diff), 1.6);
    this.velocity = Math.max(0, this.velocity * this.damping + tension * 0.3);

    return this.getState();
  }

  release(position, velocity) {
    this.attached = false;
    this.body = { ...position };
    this.velocity = Math.max(0, Number.isFinite(velocity) ? velocity : 0);
    return { velocity: this.velocity, body: { ...this.body } };
  }

  getState() {
    const dx = this.body.x - this.anchor.x;
    const dy = this.body.y - this.anchor.y;
    const dz = this.body.z - this.anchor.z;
    const length = Math.sqrt(dx * dx + dy * dy + dz * dz);

    return {
      x: this.body.x,
      y: this.body.y,
      z: this.body.z,
      length,
      attached: this.attached,
      velocity: this.velocity,
    };
  }
}

if (typeof module !== "undefined") {
  module.exports = { WebConstraint };
}
