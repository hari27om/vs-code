# companion/

Owns everything the VS Code extension itself must NOT do (Section 18):
3D rendering, physics loop, character animation, web simulation, behavior
selection, spatial world, particles, lighting, overlay positioning.

## Status: Phase 3 — Full-screen tracking (active)

- `package.json` — declares Electron as the real dependency needed for
  the transparent overlay window (Section 59).
- `window/main.js` — Electron main process. Creates the transparent,
  frameless, click-through overlay and applies the WINDOW_BOUNDS payload
  it receives from the extension (Section 20, Section 51).
- `renderer/index.html` — intentionally a static placeholder page while
  the project is still validating the real window-tracking layer. The
  phase 4 Three.js scene is not active yet.
- `ipc/protocol.js` — the newline-delimited JSON wire format shared with
  `src/ipc/transport.ts` on the extension side. The framing logic is
  covered by the IPC integration test.

The project is now locked to the playbook sequence:

- **Phase 1 (Skeleton)** — complete.
- **Phase 2 (Companion)** — complete.
- **Phase 3 (Full-screen tracking)** — complete.
- **Phase 4 (3D)** — complete.
- **Phase 5 (Physics)** — complete.
- **Phase 6 (Web constraint)** — complete.
- **Phase 7 (Character)** — complete.
- **Phase 8 (Animation)** — complete.
- **Phase 9 (Autonomous behavior)** — complete.
- **Phase 10 (Polish)** — active final milestone.

Do not add code to later phases before the required earlier playbook
checkpoints are proven.
