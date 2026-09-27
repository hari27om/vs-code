"use strict";

const assert = require("assert");
const { Pendulum } = require("../../companion/physics/pendulum.js");

const pendulum = new Pendulum({ gravity: 9.8, ropeLength: 4, damping: 0.99 });
const beforeAngle = pendulum.angle;
const beforeVelocity = pendulum.angularVelocity;
pendulum.update(0.016);

assert.ok(Number.isFinite(pendulum.angle), "angle should remain finite");
assert.ok(Number.isFinite(pendulum.angularVelocity), "angular velocity should remain finite");
assert.notStrictEqual(pendulum.angle, beforeAngle, "pendulum should move under gravity");
assert.ok(Math.abs(pendulum.angularVelocity) <= Math.abs(beforeVelocity) + 1, "angular velocity must remain bounded");

const state = pendulum.getState();
assert.ok(Number.isFinite(state.x), "x position should be finite");
assert.ok(Number.isFinite(state.y), "y position should be finite");
assert.ok(Math.abs(state.velocity) >= 0, "velocity should be non-negative scalar");

console.log("phase5-physics.test.js: PASS");
