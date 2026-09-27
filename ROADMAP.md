# Spider-Man 3D VS Code Extension — Implementation Roadmap

This roadmap follows the product rules and development order in [PLAYBOOK.md](PLAYBOOK.md) exactly. No phase is skipped, and no feature is treated as complete before its gate is verified.

## 1. Project North Star

We are building a VS Code extension that hosts a local transparent companion overlay with a real-time 3D simulation. The experience must feel like Spider-Man is living inside the editor window, swinging through the full visible workspace with real physics and autonomous behavior.

The project must satisfy these five principles:

1. Real 3D
2. Real physics
3. Full VS Code playground
4. Autonomous behavior
5. Zero interference with coding

Everything else is secondary.

---

## 2. Delivery Rules

- Do not reorder the phases.
- Do not fake features with placeholders.
- Do not claim a phase is complete until it is verified.
- The extension must remain nondisruptive to the user’s coding work.
- The companion must fail safely and recover gracefully.
- The project must be safe for a real final-year industry deliverable.

---

## 3. Phase-by-Phase Plan

### Phase 1 — Skeleton
Goal: establish the VS Code extension foundation.

Tasks:
- extension activation and deactivation
- command registration
- configuration/settings wiring
- environment detection
- basic logging and status reporting
- project structure cleanup

Acceptance criteria:
- extension builds successfully
- commands are discoverable
- supported/unsupported platform states are correct
- project is structured for later phases

Verification:
- build passes
- extension activates without errors in VS Code
- command palette shows the required commands

---

### Phase 2 — Companion
Goal: launch a real local UI companion process and verify the IPC handshake.

Tasks:
- local companion process startup
- transparent overlay window
- HELLO / READY / CONFIG handshake
- pause/resume/shutdown flow
- crash detection and automatic restart control
- environment gating for unsupported platforms

Acceptance criteria:
- companion launches successfully on supported desktop environments
- IPC handshake works reliably
- companion can be paused/resumed/stopped
- crash recovery is bounded and safe

Verification:
- manual run in VS Code
- companion process starts and reports READY
- shutdown and restart paths work

---

### Phase 3 — Full-Screen Tracking
Goal: make the companion overlay follow VS Code’s window bounds and state.

Tasks:
- read VS Code window position and size
- handle resize, move, maximize, minimize, restore
- handle DPI/display changes
- send WINDOW_BOUNDS messages to companion
- keep the overlay aligned to the user-visible editor region

Acceptance criteria:
- companion tracks real VS Code movement and size
- overlay stays visually attached to editor window
- no permanent drift or mismatch

Verification:
- drag and resize VS Code
- verify overlay remains aligned
- test minimize/restore and multi-monitor changes

---

### Phase 4 — 3D Test Object
Goal: prove the transparent overlay renders real 3D depth before adding Spider-Man.

Tasks:
- integrate WebGL/Three.js in the companion renderer
- create a simple 3D test object
- add camera, lighting, depth, and perspective
- show a basic scene inside the transparent window
- validate FPS stability

Acceptance criteria:
- 3D object renders correctly
- window remains transparent and non-intrusive
- depth and perspective are clearly visible
- performance stays acceptable

Verification:
- visual check in companion window
- FPS remains stable under normal use
- overlay remains transparent and click-through

---

### Phase 5 — Physics
Goal: implement a real physics-driven pendulum/swing prototype.

Tasks:
- gravity
- velocity and acceleration
- damping
- angular motion
- fixed timestep physics loop
- debug overlay for velocity and position
- boundary stability

Acceptance criteria:
- object swings under gravity and momentum
- release velocity is preserved
- physics runs on a stable fixed timestep
- debug values are visible and meaningful

Verification:
- physics debug overlay confirms values
- object behaves consistently under repeated runs
- no runaway or disappearing state

---

### Phase 6 — Web Constraint System
Goal: replace the simple pendulum with a web-like constraint system.

Tasks:
- anchor generation in valid world space
- attach and release logic
- rope/web length and tension
- swing state transitions
- momentum retention after release
- safe recovery when anchor fails

Acceptance criteria:
- web attaches and swings
- release keeps momentum
- rapid reattachment works
- invalid anchors recover cleanly

Verification:
- test simple web swing sequence
- confirm release velocity remains non-zero
- check recovery under invalid anchor conditions

---

### Phase 7 — Character Integration
Goal: bring in the actual animated character model instead of a generic test object.

Tasks:
- import and configure a real-time character asset
- ensure asset compatibility with renderer
- add model transform and control system
- attach the character to the swing physics state
- expose named attachment points

Acceptance criteria:
- character is rendered inside the 3D world
- character is physically controlled by the swing system
- model orientation follows movement
- integration is asset-independent and not hardcoded

Verification:
- visual verification of the character in the scene
- motion is linked to physics, not a flat animation loop

---

### Phase 8 — Animation
Goal: blend physics state with character animation.

Tasks:
- idle state
- falling state
- swinging state
- release and flight state
- landing/recovery transitions
- animation blending for natural motion

Acceptance criteria:
- body motion matches physical state
- transitions feel natural, not snapped
- character remains readable in motion

Verification:
- observe animation in motion
- confirm blend states are not visually broken

---

### Phase 9 — Autonomous Behavior
Goal: make the character move intentionally without user input.

Tasks:
- anchor selection and scoring
- corner and screen-region targeting
- anti-repetition history
- probability-based action selection
- behavior mood states
- idle vs active movement variation

Acceptance criteria:
- Spider-Man moves across the full VS Code area
- behavior varies over time
- repeated sequences are avoided
- no obvious deterministic loop

Verification:
- run multiple sessions and compare trajectories
- ensure the character visits multiple regions without repetition

---

### Phase 10 — Polish
Goal: make the experience stable, performant, and production-ready enough for a final project demo.

Tasks:
- performance adaptation
- light/shadow tuning
- effect tuning
- debug overlays
- quality settings
- crash recovery and failure safety
- accessibility toggles
- final user-facing status and settings behavior

Acceptance criteria:
- the user can work normally while the companion remains visible
- the overlay does not prevent typing or editing
- the pet can be paused or disabled instantly
- the app remains stable over long sessions

Verification:
- extended test session
- performance and responsiveness checks
- disable/pause behavior under normal editor use

---

## 4. Exit Criteria for the Final MVP

The project is considered complete only when:

- extension activates on supported desktop environment
- companion launches locally
- window follows VS Code bounds
- real 3D object renders in the overlay
- swing physics works with gravity and momentum
- web attachment/release works
- character moves autonomously in the editor area
- user coding experience remains primary
- crash recovery works
- project builds and runs reliably

This is the real executable MVP definition aligned with the playbook.

---

## 5. What We Will Not Do

We will not:
- skip required phases
- claim a feature exists before it is implemented
- use fake 2D animation to imitate 3D
- create a feature that steals focus or blocks input
- ignore the IP / assets rule
- ship an unverified prototype as if it were final

---

## 6. Immediate Next Step

We begin with Phase 1 and Phase 2 only, with clear verification after each milestone.

The next task is to:
1. review the current code against Phase 1 requirements,
2. confirm the extension foundation is complete,
3. then start the next missing requirement in the companion and overlay path.
