# test/

Section 60 defines four test levels for this project:

- `extension/`   — integration tests: VS Code <-> extension <-> companion.
- `physics/`     — unit tests (math/state transitions) and simulation
                   tests that run physics headless (no rendering):
                   swing stability, release preserves velocity, anchor
                   attach/recover, boundary collision recovery.
- `behavior/`    — anchor scoring, anti-repetition, mood transitions.
- `integration/` — end-to-end extension lifecycle and IPC handshake.

Manual visual tests (character motion realism, web appearance, overlay
position, depth, animation quality) cannot be fully automated (Section
60) and are tracked separately against the Acceptance Tests in
Section 61 of the playbook.

## Status (Phase 2)

- `integration/protocol.test.js` — real, runnable test for the IPC wire
  protocol shared by `companion/ipc/protocol.js` and
  `src/ipc/transport.ts`: multi-message chunks, a message split across
  chunks, and malformed-line resilience. Run via `npm test`.
- Everything else is still empty — there is no physics or behavior
  system to test until Phase 5+ (Section 67). The companion's actual
  window (transparent, click-through, handshake) is currently verified
  manually: run "Run Extension" (`.vscode/launch.json`) and confirm the
  placeholder badge appears.
