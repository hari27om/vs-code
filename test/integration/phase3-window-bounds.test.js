"use strict";

const assert = require("assert");
const { normalizeWindowBounds } = require("../../out/window/bounds");

const payload = normalizeWindowBounds(
  { x: 120, y: 40, width: 1400, height: 900 },
  { id: 7, scaleFactor: 1.25 },
  { isMinimized: false, isFullScreen: true }
);

assert.deepStrictEqual(payload, {
  x: 120,
  y: 40,
  width: 1400,
  height: 900,
  displayId: 7,
  dpiScale: 1.25,
  isMinimized: false,
  isFullScreen: true,
});

const fallback = normalizeWindowBounds(
  { x: 0, y: 0, width: 800, height: 600 },
  null,
  { isMinimized: true, isFullScreen: false }
);

assert.strictEqual(fallback.displayId, 0);
assert.strictEqual(fallback.dpiScale, 1);
assert.strictEqual(fallback.isMinimized, true);
assert.strictEqual(fallback.isFullScreen, false);

console.log("phase3-window-bounds.test.js: PASS");
