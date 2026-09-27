# Spider-Man 3D VS Code Extension

A VS Code extension that brings a persistent, autonomous 3D Spider-Man
companion into the editor — swinging through the window using real-time
physics. Full product spec: see `PLAYBOOK.md` (v1.0) in this repo.

## Current status: Phase 2 — Companion (per Section 67, Development Order)

This is still **infrastructure, not a working pet**. What exists right
now:

- ✅ VS Code extension activates/deactivates cleanly (Phase 1).
- ✅ All 9 commands from Section 36 are registered and discoverable via
  the Command Palette. Enable/Disable/Pause/Resume/Toggle Click-Through/
  Restart Companion now genuinely talk to the companion process. Reset
  and Debug Physics remain explicit stubs (no physics system exists
  until Phase 5).
- ✅ All settings from Section 37 are declared, readable, and live
  setting changes are forwarded to the companion over IPC.
- ✅ Environment detection (Section 21): desktop Windows/macOS
  (supported), Linux (experimental — Wayland has no always-on-top),
  remote/Codespaces/Web (unsupported, companion refuses to start).
- ✅ **A real companion process** (`companion/`): an Electron app the
  extension spawns, performs the HELLO → READY → CONFIG handshake with
  (Section 50), and can PAUSE / RESUME / SHUTDOWN over stdio IPC
  (Section 51). Crash detection with a capped auto-restart is
  implemented (Section 48).
- ✅ **A real transparent overlay window**: frameless, click-through by
  default, always-on-top where the OS/compositor supports it,
  non-focusable — loading a placeholder page that only proves the
  window itself works (Section 20).
- ❌ No window-bounds tracking yet (Phase 3) — the overlay does not yet
  follow VS Code's position/size. ❌ No 3D rendering, physics,
  character, or behavior AI (Phases 4–10).

**Nothing in this repo pretends to do more than this.** Every stub says
so explicitly (in code comments and in-app messages) rather than faking
functionality — see `companion/README.md`, `test/README.md`.

## Development order (do not reorder — Section 67)

1. **Skeleton** — this repo, right now.
2. **Companion** — launch a local transparent overlay window; extension
   <-> companion IPC handshake.
3. **Full-screen tracking** — overlay follows VS Code move/resize/
   maximize/minimize/DPI/display changes.
4. **3D** — Three.js renders a simple test object (not Spider-Man) to
   prove transparent window + 3D + depth + FPS (Section 68).
5. **Physics** — a real pendulum: gravity, velocity, momentum.
6. **Web constraint** — replace the pendulum with a web-like joint.
7. **Character** — import the real rigged 3D model.
8. **Animation** — blend physics state with animation clips.
9. **Autonomous behavior** — anchor selection, randomness, anti-
   repetition, mood (Section 26).
10. **Polish** — lighting, effects, recovery, settings UI, performance
    adaptation.

## Running Phase 2

The extension host and the companion are two separate npm projects —
install both:

```bash
npm install                 # extension host (root)
npm run compile
cd companion && npm install # companion (Electron app)
cd ..
```

Then press `F5` in VS Code (or Run → Start Debugging) to launch the
Extension Development Host. If `spiderman.enabled` is true (the
default), the companion starts automatically on activation and you
should see a small red placeholder badge appear near the top-left of
your screen — that's the transparent overlay window proving itself,
not the pet. You can also drive it manually via the Command Palette:
`Spider-Man: Enable`, `Disable`, `Pause`, `Resume`, `Toggle
Click-Through`, `Restart Companion`.

Note: the companion window does not follow VS Code's position/size yet
(that's Phase 3), so it will stay wherever it opened.

## The five non-negotiable rules (Section 72)

```
REAL 3D + REAL PHYSICS + FULL VS CODE PLAYGROUND
+ AUTONOMOUS BEHAVIOR + ZERO INTERFERENCE WITH CODING
```

If a future change conflicts with these, the change loses — not the
rules.

## Before public release

Read `PLAYBOOK.md` Section 41 (Spider-Man IP Rule) before distributing
this extension anywhere public. Using Marvel's character/suit/logo
assets is fine for private prototyping under the asset's own license,
but is not automatically permitted for Marketplace release.
