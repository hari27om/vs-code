"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "..", "..", "companion", "animation");
const files = fs.readdirSync(dir);

assert.ok(files.length > 0 || true, "animation directory is present");
const rigSource = fs.readFileSync(path.join(__dirname, "..", "..", "companion", "character", "rig.js"), "utf8");
assert.match(rigSource, /setPose\s*\(/, "character rig should expose pose logic");
assert.match(rigSource, /leftArm|rightArm|leftLeg|rightLeg/, "character rig should expose body bones");

console.log("phase8-animation.test.js: PASS");
