"use strict";

/**
 * Sections 50-51 — Companion Handshake & IPC Rules.
 *
 * Wire format: one JSON object per line (newline-delimited JSON) over the
 * companion process's stdin (incoming, from the extension) and stdout
 * (outgoing, to the extension). This is deliberately the simplest
 * transport that works identically on Windows/macOS/Linux without extra
 * dependencies (Section 59 — Dependency Rules).
 *
 * The message shape here MUST stay in sync with src/ipc/messages.ts on
 * the extension side. Both sides use:
 *   { version: string, type: string, timestamp: number, payload: any }
 *
 * IMPORTANT: stdout is also Electron's own console. To keep the channel
 * "small and purposeful" (Section 51) and parseable, only this module
 * writes to stdout. Use logToStderr() for anything diagnostic instead.
 */

const PROTOCOL_VERSION = "1.0";

function encode(type, payload) {
  const message = {
    version: PROTOCOL_VERSION,
    type,
    timestamp: Date.now(),
    payload: payload === undefined ? null : payload,
  };
  return JSON.stringify(message) + "\n";
}

function send(type, payload) {
  process.stdout.write(encode(type, payload));
}

function logToStderr(...args) {
  process.stderr.write("[companion] " + args.map(String).join(" ") + "\n");
}

/**
 * Attaches a line-buffered JSON parser to stdin and calls onMessage for
 * each well-formed message. Malformed lines are logged to stderr and
 * skipped rather than crashing the process (Section 34 — Recovery).
 */
function listen(onMessage) {
  let buffer = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (chunk) => {
    buffer += chunk;
    let newlineIndex;
    while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, newlineIndex).trim();
      buffer = buffer.slice(newlineIndex + 1);
      if (!line) continue;
      try {
        const message = JSON.parse(line);
        onMessage(message);
      } catch (err) {
        logToStderr("received malformed IPC line, ignoring:", line);
      }
    }
  });
}

module.exports = { PROTOCOL_VERSION, encode, send, listen, logToStderr };
