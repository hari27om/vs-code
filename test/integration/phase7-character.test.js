"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "..", "..", "companion", "character", "rig.js");
const source = fs.readFileSync(file, "utf8");

assert.match(source, /class CharacterRig/, "missing CharacterRig class");
assert.match(source, /new THREE\.Group\s*\(/, "missing root group");
assert.match(source, /new THREE\.CapsuleGeometry\s*\(/, "missing capsule-based body segments");
assert.match(source, /setPose\s*\(/, "missing pose function");

console.log("phase7-character.test.js: PASS");
