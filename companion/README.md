# companion/

Owns everything the VS Code extension itself must NOT do (Section 18):
3D rendering, physics loop, character animation, web simulation, behavior
selection, spatial world, particles, lighting, overlay positioning.

## Status: Phase 2 — Companion (implemented)

- `package.json` — declares Electron as a real dependency (Section 59).
  Run `npm install` inside this folder once before starting the
  extension; the extension host does not manage this install for you.
- `window/main.js` — Electron main process. Creates a transparent,
  frameless, click-through, always-on-top (where supported), non-
  focusable `BrowserWindow` (Section 20) and speaks the HELLO/READY/
  CONFIG handshake (Section 50) plus PAUSE/RESUME/WINDOW_BOUNDS/SHUTDOWN
  (Section 51) over stdio.
- `renderer/index.html` — a static placeholder page, loaded by the
  window above, that only proves the transparent overlay is real. It
  has no 3D content on purpose (see Phase 4 below).
- `ipc/protocol.js` — the newline-delimited JSON wire format shared with
  `src/ipc/transport.ts` on the extension side. The framing logic here
  has an automated test (multi-message chunks, split messages, malformed
  lines) — see the project's dev notes; it is not just "looks right."

Still not implemented, in order:

- **Phase 3 (Full-screen tracking)** — `window/` follows VS Code's real
  bounds (move/resize/maximize/minimize/DPI/display changes). The
  WINDOW_BOUNDS message is already wired end-to-end, but nothing yet
  computes real VS Code window geometry to send.
- **Phase 4 (3D)** — `renderer/` gets a Three.js scene rendering a
  simple 3D test object (not Spider-Man yet — Section 68).
- **Phase 5 (Physics)** — `physics/` gets a real pendulum simulation.
- **Phase 6 (Web constraint)** — `web/` replaces the pendulum with a
  web-like constraint.
- **Phase 7 (Character)** — `character/` imports the real rigged model.
- **Phase 8 (Animation)** — `animation/` blends physics with clips.
- **Phase 9 (Autonomous behavior)** — `behavior/` gets anchor selection,
  randomness, and the state machine from Section 8.
- **Phase 10 (Polish)** — `debug/` gets the diagnostic overlay
  (Section 38), plus lighting/effects/recovery/performance work.

Do not add code to these folders out of order (Section 67 —
Development Order — "do not start by polishing Spider-Man's suit while
the overlay architecture is still unproven").
