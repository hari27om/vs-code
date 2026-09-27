"use strict";

/**
 * Section 18 — What the Companion Renderer Does.
 * Section 20 — Overlay Window Rules.
 * Section 50 — Companion Handshake.
 *
 * PHASE STATUS: Phase 2 ("Companion") only.
 *   - Real transparent, frameless, click-through, always-on-top window. [done]
 *   - Real HELLO / READY / CONFIG handshake over stdio. [done]
 *   - PAUSE / RESUME / WINDOW_BOUNDS / SHUTDOWN message handling. [done]
 *
 * Explicitly NOT in this file (later phases, per Section 67):
 *   - Following VS Code's actual window bounds automatically (Phase 3 —
 *     the extension doesn't track real bounds yet either; this file only
 *     applies bounds it is TOLD about via WINDOW_BOUNDS).
 *   - Any 3D rendering / Three.js (Phase 4).
 *   - Physics, webs, character, behavior (Phases 5-9).
 * The renderer/index.html loaded here is a static placeholder page that
 * says as much, so nothing here overclaims what's implemented.
 */

const path = require("path");
const { app, BrowserWindow } = require("electron");
const ipc = require("../ipc/protocol");

let mainWindow = null;
let handshakeComplete = false;
let currentClickThrough = true;

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    x: 0,
    y: 0,
    transparent: true,
    frame: false,
    hasShadow: false,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    show: false,
    backgroundColor: "#00000000",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  // Section 20 — avoid stealing focus.
  win.setFocusable(false);

  // Section 21 — Electron documents that always-on-top is not supported
  // under Wayland. Calling it is still safe (no throw); we just can't
  // guarantee the visual result there, so we log rather than assume.
  try {
    win.setAlwaysOnTop(true, "screen-saver");
    if (process.platform === "linux" && process.env.XDG_SESSION_TYPE === "wayland") {
      ipc.logToStderr(
        "running under Wayland: always-on-top is not supported by Electron here (Section 21)."
      );
    }
  } catch (err) {
    ipc.logToStderr("setAlwaysOnTop failed:", err.message);
  }

  // Rule 23 — default is click-through.
  win.setIgnoreMouseEvents(true, { forward: true });

  win.loadFile(path.join(__dirname, "..", "renderer", "index.html"));

  win.on("closed", () => {
    mainWindow = null;
  });

  return win;
}

function applyConfig(payload) {
  if (!mainWindow) return;
  const clickThrough = payload && typeof payload.clickThrough === "boolean" ? payload.clickThrough : true;
  currentClickThrough = clickThrough;
  mainWindow.setIgnoreMouseEvents(clickThrough, { forward: true });
  if (payload && payload.bounds) {
    applyBounds(payload.bounds);
  }
  if (!mainWindow.isVisible()) {
    mainWindow.showInactive(); // show without taking focus
  }
}

function applyBounds(bounds) {
  if (!mainWindow || !bounds) return;
  const { x, y, width, height } = bounds;
  if (
    typeof x === "number" &&
    typeof y === "number" &&
    typeof width === "number" &&
    typeof height === "number"
  ) {
    mainWindow.setBounds({ x, y, width, height });
  }
}

function handleMessage(message) {
  if (!message || typeof message.type !== "string") return;

  switch (message.type) {
    case "HELLO":
      ipc.send("READY", { version: app.getVersion() || "0.0.1" });
      break;

    case "CONFIG":
      applyConfig(message.payload);
      handshakeComplete = true;
      break;

    case "WINDOW_BOUNDS":
      applyBounds(message.payload);
      break;

    case "PAUSE":
      if (mainWindow) mainWindow.hide();
      break;

    case "RESUME":
      if (mainWindow && handshakeComplete) mainWindow.showInactive();
      break;

    case "CONFIG_CHANGED":
      applyConfig(message.payload);
      break;

    case "SHUTDOWN":
      app.quit();
      break;

    default:
      ipc.logToStderr("unhandled message type:", message.type);
  }
}

app.whenReady().then(() => {
  mainWindow = createWindow();
  ipc.listen(handleMessage);
  // The companion does not speak first beyond this point — Section 50's
  // handshake starts with the EXTENSION sending HELLO.
});

app.on("window-all-closed", () => {
  // Section 20 — disappear when VS Code closes / extension disables us.
  // Do NOT call app.quit() automatically on non-macOS the way a normal
  // app would skip quitting on macOS: this process has no purpose
  // without its window, on any platform.
  app.quit();
});

process.on("uncaughtException", (err) => {
  // Section 34 — Recovery System: prefer a clean exit (so the extension's
  // crash-detection/restart logic in src/companion/companionManager.ts
  // can do its job) over an undefined hung state.
  ipc.logToStderr("uncaught exception, exiting:", err && err.stack ? err.stack : err);
  app.exit(1);
});
