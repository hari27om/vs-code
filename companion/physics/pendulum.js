class Pendulum {
  constructor({ gravity = 9.8, ropeLength = 4, damping = 0.995, angle = Math.PI / 3, angularVelocity = 0.0 } = {}) {
    this.gravity = gravity;
    this.ropeLength = ropeLength;
    this.damping = damping;
    this.angle = angle;
    this.angularVelocity = angularVelocity;
    this.lastTime = 0;
  }

  update(dt) {
    const safeDt = Number.isFinite(dt) && dt > 0 ? Math.min(dt, 0.05) : 0.016;
    const angularAcceleration = -(this.gravity / this.ropeLength) * Math.sin(this.angle);
    this.angularVelocity += angularAcceleration * safeDt;
    this.angularVelocity *= this.damping;
    this.angle += this.angularVelocity * safeDt;

    return this.getState();
  }

  getState() {
    const x = this.ropeLength * Math.sin(this.angle);
    const y = -this.ropeLength * Math.cos(this.angle);
    const velocity = Math.abs(this.angularVelocity * this.ropeLength);

    return {
      x,
      y,
      angle: this.angle,
      angularVelocity: this.angularVelocity,
      velocity,
    };
  }
}

if (typeof module !== "undefined") {
  module.exports = { Pendulum };
}
