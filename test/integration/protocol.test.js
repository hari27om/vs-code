"use strict";

/**
 * Section 60 — Testing Strategy ("simulation tests: run the physics [or
 * here, the IPC] without rendering").
 *
 * Exercises companion/ipc/protocol.js — the actual wire format used
 * between the extension and the companion — against three real failure
 * modes rather than just the happy path:
 *   1. Multiple messages arriving in a single stdin chunk.
 *   2. A single message split across two stdin chunks.
 *   3. A malformed line, which must be skipped, not crash the process
 *      (Section 34 — Recovery).
 *
 * Run with: node test/integration/protocol.test.js
 */

const assert = require("assert");
const path = require("path");
const { PassThrough } = require("stream");

const protocolPath = path.join(__dirname, "..", "..", "companion", "ipc", "protocol.js");

const fakeStdin = new PassThrough();
Object.defineProperty(process, "stdin", { value: fakeStdin, configurable: true });

const ipc = require(protocolPath);

const received = [];
ipc.listen((msg) => received.push(msg));

const helloMsg = ipc.encode("HELLO", {});
const readyMsg = ipc.encode("READY", { version: "1.0" });
fakeStdin.write(helloMsg + readyMsg);

const configMsg = ipc.encode("CONFIG", { clickThrough: true });
const splitPoint = Math.floor(configMsg.length / 2);
fakeStdin.write(configMsg.slice(0, splitPoint));
fakeStdin.write(configMsg.slice(splitPoint));

fakeStdin.write("this is not valid json\n");
fakeStdin.write(ipc.encode("SHUTDOWN", {}));

setTimeout(() => {
  const types = received.map((m) => m.type);
  assert.deepStrictEqual(
    types,
    ["HELLO", "READY", "CONFIG", "SHUTDOWN"],
    `expected 4 well-formed messages in order, got: ${JSON.stringify(types)}`
  );
  assert.strictEqual(received[1].payload.version, "1.0");
  assert.strictEqual(received[2].payload.clickThrough, true);
  console.log("protocol.test.js: PASS");
}, 50);
