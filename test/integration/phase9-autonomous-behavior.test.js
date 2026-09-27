"use strict";

const assert = require("assert");
const { BehaviorController } = require("../../companion/behavior/behaviorController.js");

const controller = new BehaviorController([0, 1, 2, 3], 6);
const anchor = controller.pickAnchor(0);
assert.ok(anchor >= 0 && anchor <= 3, "anchor choice should be valid");

controller.record(anchor, "swing");
controller.record(1, "release");
controller.record(2, "idle");
controller.record(3, "swing");
controller.record(0, "release");
controller.record(1, "idle");

const decision = controller.decideAction(0, 5000);
assert.ok(["swing", "release", "idle"].includes(decision.action), "decision should be a valid action");
assert.ok(decision.anchorIndex >= 0 && decision.anchorIndex <= 3, "decision anchor should remain in range");
assert.ok(["calm", "active", "playful"].includes(controller.currentMood), "mood should be one of the valid states");

console.log("phase9-autonomous-behavior.test.js: PASS");
