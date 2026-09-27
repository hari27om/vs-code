"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(
  path.join(__dirname, "..", "..", "companion", "renderer", "index.html"),
  "utf8"
);

assert.match(html, /Phase 4 3D test object/i, "missing Phase 4 3D test object title");
assert.match(html, /new THREE\.Scene\s*\(/, "missing Three.js scene");
assert.match(html, /new THREE\.PerspectiveCamera\s*\(/, "missing perspective camera");
assert.match(html, /new THREE\.WebGLRenderer\s*\(/, "missing WebGL renderer");
assert.match(html, /new THREE\.AmbientLight\s*\(/, "missing ambient light");

console.log("phase4-3d-scene.test.js: PASS");
