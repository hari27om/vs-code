"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const readme = fs.readFileSync(path.join(__dirname, "..", "..", "README.md"), "utf8");
assert.match(readme, /Phase 10|Polish/i, "project README should declare the current Phase 10 polish milestone");

const companionReadme = fs.readFileSync(path.join(__dirname, "..", "..", "companion", "README.md"), "utf8");
assert.match(companionReadme, /Phase 10|Polish/i, "companion README should declare the current Phase 10 polish milestone");

console.log("phase10-polish.test.js: PASS");
