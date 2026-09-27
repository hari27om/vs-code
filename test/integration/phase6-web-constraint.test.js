"use strict";

const assert = require("assert");
const { WebConstraint } = require("../../companion/web/webConstraint.js");

const constraint = new WebConstraint({ anchor: { x: 0, y: 4, z: 0 }, length: 4.5, damping: 0.985 });
const initial = constraint.getState();

constraint.attach({ x: 0.6, y: 2.2, z: 0.5 });
constraint.update(0.016, { gravity: 9.8 });
const after = constraint.getState();

assert.ok(Number.isFinite(after.x), "web x should be finite");
assert.ok(Number.isFinite(after.y), "web y should be finite");
assert.ok(Number.isFinite(after.z), "web z should be finite");
assert.ok(after.length <= 4.5 + 0.2, "web length should remain near the tether length");
assert.notStrictEqual(after.x, initial.x, "web should respond to attached body motion");

const release = constraint.release({ x: 0.8, y: 0.5, z: 0.2 }, 1.2);
assert.ok(Number.isFinite(release.velocity), "release velocity should be finite");
assert.ok(release.velocity > 0, "release velocity should retain momentum");

console.log("phase6-web-constraint.test.js: PASS");
