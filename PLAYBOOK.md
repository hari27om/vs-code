# Spider-Man 3D VS Code Extension

## Build Playbook & Product Rules — v1.0

### 1. Product Definition

We are building a **VS Code extension that brings a persistent autonomous 3D Spider-Man companion into the user's coding environment**.

The intended experience is:

> Open VS Code.
> Start coding.
> Spider-Man lives in the VS Code window and independently swings through the entire screen using real-time 3D physics.

Spider-Man is not a button, sidebar widget, animated GIF, video, screen decoration, or fixed looping animation.

He is a **3D interactive simulation running alongside VS Code and controlled by the extension**.

The experience must feel like a small physical world has been placed over the user's IDE.

---

# 2. Non-Negotiable Product Rules

These rules override convenience during development.

## Rule 1 — It must be genuinely 3D

The character must be rendered as a real 3D model.

No 2D sprite pretending to be 3D.

No pre-rendered video.

No GIF.

No flat PNG animation.

The renderer must have:

* perspective
* depth
* camera
* lighting
* shadows where practical
* character rotation
* 3D movement
* animation blending
* real spatial relationships

The user's perception should change depending on Spider-Man's depth in the scene.

---

## Rule 2 — The entire VS Code window is the playground

Spider-Man must be capable of travelling across the **full visible VS Code window**.

The intended play area includes:

* top-left
* top-center
* top-right
* middle-left
* center
* middle-right
* bottom-left
* bottom-center
* bottom-right

He must not be permanently trapped in a sidebar, panel, toolbar, or small pet box.

The overlay should cover the complete VS Code client area that we can safely and reliably track.

The four corners are first-class destinations.

---

## Rule 3 — Spider-Man moves autonomously

The user does not need to control Spider-Man.

Once enabled:

1. Spider-Man chooses behavior.
2. Spider-Man chooses trajectories.
3. Spider-Man chooses web anchors.
4. Spider-Man swings.
5. Spider-Man releases.
6. Spider-Man flies through the air.
7. Spider-Man chooses another anchor.
8. Spider-Man continues.

The user should be able to sit for an hour and observe behavior without seeing the exact same sequence repeated.

---

## Rule 4 — Swinging must use physics

The animation path must not be a collection of manually authored curves.

The simulation must account for:

* gravity
* velocity
* acceleration
* momentum
* angular velocity
* rope/web length
* web tension
* damping
* release velocity
* collision boundaries
* character orientation
* target selection

The result should emerge from physics plus behavior decisions.

A physics engine such as Rapier can provide the underlying 3D constraint/joint system, but we may implement custom swing logic if it gives us more controlled cinematic behavior.

---

## Rule 5 — Webs are part of the simulation

A web is not merely a visual line.

The lifecycle is:

**shoot → attach → tension → swing → release → ballistic motion → next web**

The web anchor has a position in 3D space.

Spider-Man's movement must respond to the connection between his body and the anchor.

A visible web should generally correspond to a real simulated connection.

---

## Rule 6 — Momentum survives release

When Spider-Man releases a web, he must not instantly stop.

He retains his current velocity.

Example:

```text
Anchor
  ●
   \
    \
     🕷️ → → →

release

     🕷️ → → → →
```

This is essential to making the character feel physically believable.

---

## Rule 7 — The character must continuously vary behavior

The behavior controller must avoid deterministic loops.

Spider-Man should vary:

* direction
* swing duration
* anchor location
* release timing
* speed
* depth
* approach angle
* body pose
* idle duration
* number of swings before landing
* corner selection
* probability of performing a trick

A seeded random system may be used for debugging.

Production behavior should feel random but intentional.

---

# 3. Product Personality

Spider-Man is a **companion**, not the main application.

The user's code always wins.

Spider-Man exists to add life and personality to the coding environment.

Therefore:

### He may be noticeable.

### He must never become unusable.

### He must never hijack the editor.

### He must never permanently block code.

### He must never steal keyboard focus unless explicitly interacted with.

### He must not interrupt typing.

The desired emotional result is:

> "He is alive."

Not:

> "This extension keeps getting in my way."

---

# 4. Screen Behavior

## Full-screen movement

Spider-Man gets a safe 3D volume mapped to the visible VS Code window.

Conceptually:

```text
                 TOP
     ┌────────────────────────────┐
     │ ●                       ●  │
     │                            │
     │                            │
LEFT │          3D WORLD          │ RIGHT
     │                            │
     │                            │
     │ ●                       ●  │
     └────────────────────────────┘
                BOTTOM
```

The four corners should be valid anchor/trajectory regions.

We do not force him to visit every corner in order.

---

# 5. Safe-Zone System

The screen is divided conceptually into:

### Primary motion space

Where Spider-Man spends most of his time.

### Secondary motion space

Edges and corners.

### Avoidance space

Areas where the user is actively reading or interacting heavily.

The avoidance system must never completely eliminate the user's requested full-screen behavior.

Instead, it biases movement away from the most important content.

This is a soft preference, not a hard cage.

---

# 6. Z-Depth Rules

Spider-Man must have meaningful depth.

The simulation should represent at least three intuitive depth ranges:

```text
FAR
   small
   slower visual movement
   reduced screen dominance

MID
   normal size
   normal movement

NEAR
   larger
   stronger perspective
   visually closer to the user
```

Depth changes should affect:

* apparent size
* perspective
* motion
* blur where appropriate
* lighting
* web presentation
* character orientation

We must not fake depth simply by scaling a 2D asset.

---

# 7. Physics World

The physics system should use a consistent coordinate system.

Recommended conceptual model:

```text
X = horizontal
Y = vertical
Z = depth
```

World properties:

```text
gravity
air_damping
web_damping
max_velocity
max_angular_velocity
character_mass
web_length_min
web_length_max
```

These must be configuration values rather than magic numbers scattered through the codebase.

---

# 8. Swing Model

The minimum swing state machine is:

```text
IDLE
  ↓
SEARCH_ANCHOR
  ↓
AIM_WEB
  ↓
FIRE_WEB
  ↓
ATTACH_WEB
  ↓
BUILD_TENSION
  ↓
SWING
  ↓
RELEASE
  ↓
BALLISTIC_FLIGHT
  ↓
SEARCH_ANCHOR
```

Optional states:

```text
LAND
HANG
CLIMB
WALL_RUN
AIR_TRICK
RECOVER
```

Every state must have:

* entry conditions
* update behavior
* timeout/failsafe
* exit conditions
* interruption behavior

---

# 9. Anchor Selection

Anchors should be generated within the available 3D play space.

An anchor candidate should have a score based on:

```text
distance
direction
current momentum
screen coverage
corner diversity
depth
recently used penalty
trajectory quality
```

Recent anchors receive a penalty so Spider-Man does not repeatedly use the same point.

We should maintain memory such as:

```text
recentAnchors[]
recentTrajectories[]
recentCorners[]
```

This prevents obvious repetition.

---

# 10. Four-Corner Behavior

Corners are not hard checkpoints.

They are behavioral regions.

The controller should occasionally produce trajectories such as:

```text
TOP-LEFT → BOTTOM-RIGHT
BOTTOM-RIGHT → TOP-RIGHT
TOP-RIGHT → CENTER
CENTER → BOTTOM-LEFT
BOTTOM-LEFT → TOP-LEFT
```

But a different session may produce:

```text
TOP-RIGHT → LEFT EDGE → CENTER → BOTTOM-RIGHT
```

The behavior system must never require a fixed A → B → C → D loop.

---

# 11. Character Animation System

Physics controls movement.

Animation controls body motion.

These are separate systems.

The animation system should support at least:

```text
idle
walk
run
jump
fall
swing
hang
release
airborne
land
crouch
climb
flip
backflip
frontflip
look
celebrate
recover
```

The animation controller blends clips according to the physical state.

Example:

```text
physics velocity
      ↓
movement classifier
      ↓
animation blend
      ↓
3D character
```

---

# 12. Character Orientation

Spider-Man must generally face the direction of travel.

During a swing:

* torso follows velocity
* legs react to swing direction
* body rotates naturally
* hands remain compatible with web attachment
* release transitions preserve momentum

Artificial snapping between directions is prohibited unless used intentionally for a special move.

---

# 13. Web Rendering

Webs should visually communicate their physical relationship.

Minimum requirements:

* origin point
* anchor point
* visible connection
* attachment state
* release state

Preferred implementation:

```text
3D curve
+
rope/web material
+
small motion/tension variation
```

The web should not look perfectly static when tension changes.

---

# 14. Camera

The camera must make the world feel three-dimensional without becoming distracting.

The camera should remain mostly stable.

Spider-Man moves through the world.

We do not want aggressive camera-follow behavior that makes the entire VS Code screen appear to move.

Preferred model:

```text
stable camera
+
perspective
+
3D character motion
+
depth
```

Optional subtle camera response can be added later.

---

# 15. Rendering Requirements

Target renderer:

**WebGL-based 3D rendering**, preferably using Three.js.

Three.js supports glTF loading and animation systems suitable for a rigged character pipeline.

Recommended pipeline:

```text
GLB / glTF
   ↓
GLTFLoader
   ↓
scene
   ↓
character rig
   ↓
AnimationMixer
   ↓
physics transform
   ↓
renderer
```

We should prefer modern, optimized assets over extremely high-poly cinematic assets.

---

# 16. Architecture

The project is officially defined as:

```text
VS Code Extension
        │
        ├── Extension Controller
        │
        ├── VS Code Event Adapter
        │
        ├── Configuration Manager
        │
        ├── Companion Process Manager
        │
        └── IPC Bridge
                  │
                  ▼
          3D Companion Renderer
                  │
                  ├── Three.js
                  ├── Physics
                  ├── Character
                  ├── Web System
                  ├── Behavior AI
                  ├── Collision
                  └── Renderer
```

This separation is mandatory.

---

# 17. What the VS Code Extension Does

The extension is responsible for:

* startup
* shutdown
* commands
* settings
* lifecycle
* detecting editor activity
* detecting document changes
* detecting saves
* detecting errors/build signals where practical
* starting the companion process
* stopping the companion process
* sending events to the renderer
* receiving renderer state
* diagnostics
* logging
* user preferences

VS Code exposes commands, configuration, event APIs and related extension capabilities for this integration.

---

# 18. What the Companion Renderer Does

The companion owns:

* 3D rendering
* physics loop
* character animation
* web simulation
* behavior selection
* spatial world
* particles
* lighting
* sound, if enabled
* overlay positioning
* transparent window rendering

The extension should not attempt to render the 3D world itself.

---

# 19. Why We Are Not Building It as a Normal Webview

VS Code webviews are powerful, but they live inside supported VS Code UI surfaces such as editor panels and sidebar/panel views. They are not a documented mechanism for injecting arbitrary HTML elements into the workbench DOM. VS Code explicitly prevents extensions from directly accessing the workbench DOM.

Therefore:

**A normal webview is not the final rendering architecture.**

A webview may still be used for:

* settings
* help
* preview
* diagnostics
* onboarding
* pet controls

But not as the primary full-screen Spider-Man renderer.

---

# 20. Overlay Window Rules

The 3D renderer should run as a transparent companion window.

The overlay should:

* follow the VS Code window
* resize with VS Code
* remain visually attached to VS Code
* avoid stealing focus
* optionally ignore mouse events
* disappear when the extension is disabled
* disappear when VS Code closes
* recover if the companion crashes

Electron provides transparent/always-on-top window primitives suitable for a companion renderer. Current Electron documentation also notes that always-on-top is not supported on Wayland.

Therefore platform support must be explicit.

---

# 21. Platform Strategy

## v1 target

Desktop VS Code:

* Windows
* macOS

## Linux

Support should initially be considered experimental because desktop window-management behavior varies by display server, and Electron documents an always-on-top limitation under Wayland.

## VS Code for the Web

Not part of the first version.

VS Code for the Web uses a browser-based extension host with different runtime capabilities, so it cannot be treated as equivalent to desktop VS Code for this project.

## Remote / SSH / Codespaces / Containers

The overlay must always be treated as a **local UI feature**.

The renderer must not accidentally launch on a remote server.

VS Code's remote-extension architecture makes this distinction important because Node-based extension code can otherwise execute in a remote extension host.

Therefore the extension architecture should prefer the local UI side.

---

# 22. Window Tracking

The companion must know:

```text
VS Code window position
VS Code window size
display/monitor
DPI/scaling
visibility state
minimized state
fullscreen state
```

Tracking must tolerate:

* moving VS Code
* resizing VS Code
* maximizing VS Code
* monitor changes
* DPI changes
* sleep/wake
* display reconnect
* VS Code restart

Window tracking is a dedicated subsystem.

Do not scatter OS-specific window code throughout the renderer.

---

# 23. Input Rules

Default mode:

**Click-through.**

Spider-Man should not intercept clicks intended for VS Code.

Optional future mode:

**Interactive mode.**

In interactive mode the user may click Spider-Man.

Possible interactions:

```text
click
double click
right click
drag
```

Interactive mode must be explicitly enabled.

The normal coding experience must remain uninterrupted.

---

# 24. VS Code Activity Signals

The extension may use coding activity as subtle behavioral input.

Examples:

```text
typing started
typing stopped
file saved
editor changed
debugging started
debugging stopped
test run
build activity
diagnostic change
workspace opened
workspace closed
```

These signals must not directly control every animation.

They should influence behavior probabilistically.

Example:

```text
save event
      ↓
small probability
      ↓
Spider-Man performs a flourish
```

Not:

```text
every save = same animation
```

---

# 25. Coding Activity Must Never Control Physics Directly

Bad:

```text
keypress → force Spider-Man
keypress → teleport Spider-Man
keypress → change velocity
```

Better:

```text
editor activity
      ↓
behavior mood
      ↓
behavior probability
      ↓
physics action
```

Physics remains independent.

---

# 26. Behavior Brain

The behavior controller should operate at a higher level than physics.

Conceptually:

```text
                BEHAVIOR BRAIN
                      │
       ┌──────────────┼──────────────┐
       ↓              ↓              ↓
    target          action         mood
       │              │              │
       └──────────────┼──────────────┘
                      ↓
                  PHYSICS
                      ↓
                  CHARACTER
```

Possible moods:

```text
calm
active
playful
resting
excited
recovering
```

Mood changes should be subtle.

We are not building a chatbot.

---

# 27. Anti-Repetition System

A rolling history should track previous behavior.

Example:

```text
lastCorner
lastAnchor
lastDirection
lastAction
lastTrick
lastDepth
lastDuration
```

Apply penalties to recently repeated values.

This is one of the most important systems in the entire product.

The extension should feel random without looking random.

---

# 28. Idle Behavior

Spider-Man must not swing at maximum intensity forever.

Natural variation includes:

```text
long swing
short swing
brief hang
wall cling
landing
looking around
slow movement
quick movement
```

There should be quiet moments.

The character is a pet.

A pet that never stops moving becomes visual noise.

---

# 29. Performance Rules

The user's coding performance has priority over the pet.

Absolute priorities:

```text
VS Code responsiveness
    >
input latency
    >
rendering quality
    >
effects
```

The pet must automatically reduce rendering complexity when necessary.

Potential adaptive controls:

```text
FPS target
shadow quality
particle count
animation quality
web detail
post-processing
render resolution
```

---

# 30. CPU/GPU Budget

The renderer should have a measurable resource budget.

We should instrument:

```text
FPS
frame time
CPU usage
GPU usage where measurable
memory
physics step time
draw calls
active particles
```

A performance regression is considered a product bug.

We do not optimize only after release.

---

# 31. Rendering Loop

The renderer should separate:

```text
render tick
physics tick
behavior tick
IPC tick
```

Example conceptual rates:

```text
render       ≈ display rate
physics      fixed timestep
behavior     slower
IPC          event-driven / throttled
```

Physics must not depend on unpredictable frame timing.

---

# 32. Fixed Physics Timestep

Physics should use a fixed simulation timestep.

We must not base physical integration directly on arbitrary render-frame duration without safeguards.

Conceptually:

```text
accumulator
     ↓
fixed physics steps
     ↓
interpolated render state
```

This makes the swing simulation stable across different frame rates.

---

# 33. Collision Rules

Spider-Man must have collision boundaries around the virtual world.

The world boundary prevents:

```text
escaping forever
falling into negative infinity
getting permanently stuck off-screen
```

When he approaches a boundary:

* steer
* attach
* recover
* bounce where appropriate
* select a new target

He should never disappear due to a physics bug and remain missing indefinitely.

---

# 34. Recovery System

Every autonomous action requires a recovery path.

Examples:

```text
web failed to attach
        ↓
recover

anchor invalid
        ↓
choose another

character stuck
        ↓
reset local physics

renderer loses focus
        ↓
continue

companion crashes
        ↓
extension detects failure
        ↓
restart safely
```

A pet that can permanently get stuck is not production ready.

---

# 35. Save/Reload Behavior

The extension should remember user settings.

It does not need to persist every physics frame.

Persistent state should include:

```text
enabled
volume
quality
interaction mode
speed preference
preferred behavior
first-run state
```

Webview state APIs exist for webview-specific persistence, but the main pet state should live in the extension configuration/state layer rather than depending on a continuously visible webview.

---

# 36. Commands

The extension should provide a small command surface.

Initial commands:

```text
Spider-Man: Enable
Spider-Man: Disable
Spider-Man: Pause
Spider-Man: Resume
Spider-Man: Toggle Click-Through
Spider-Man: Reset
Spider-Man: Open Settings
Spider-Man: Restart Companion
Spider-Man: Debug Physics
```

Commands should be discoverable through the Command Palette. VS Code's extension model supports contributed commands and command registration directly.

---

# 37. Settings

Recommended settings:

```text
spiderman.enabled
spiderman.physics.enabled
spiderman.swingSpeed
spiderman.activityReactions
spiderman.renderQuality
spiderman.maxParticles
spiderman.shadows
spiderman.sound.enabled
spiderman.interactive
spiderman.clickThrough
spiderman.maxCharacterSize
spiderman.showWebs
spiderman.debugPhysics
```

Do not expose dozens of physics constants to normal users.

Advanced physics controls belong in developer/debug mode.

---

# 38. Debug Mode

Debug mode is mandatory during development.

It should be able to display:

```text
FPS
physics FPS
velocity vector
current state
current anchor
rope length
rope tension
position XYZ
velocity XYZ
target XYZ
current mood
last action
```

Optional overlays:

```text
anchor point
trajectory prediction
collision boundaries
safe zones
screen zones
physics body
web constraint
```

The same system should help us diagnose bugs without changing production behavior.

---

# 39. Developer Tools

The project must have a diagnostic mode capable of:

```text
pause physics
step one physics frame
teleport character
spawn anchor
force swing
force release
force land
reset character
set velocity
set gravity
```

These are developer controls only.

They are invaluable for tuning realistic movement.

---

# 40. 3D Asset Rules

The character asset must be:

* properly rigged
* animation-ready
* optimized
* compatible with the chosen renderer
* physically proportioned consistently
* authored for real-time use

We should store the original asset separately from runtime-optimized assets.

The runtime build should contain only what is needed.

---

# 41. Spider-Man IP Rule

There are two product modes:

### Private prototype

We can use a Spider-Man asset for personal/local experimentation, subject to the asset's own license.

### Public release / Marketplace

We must not assume that using Marvel's character, logo, suit artwork, sounds, or other protected assets is automatically permitted.

For public distribution, use properly licensed Spider-Man assets or replace the character with an original character unless the required rights are secured.

The architecture must therefore allow the character asset to be replaced without rewriting the physics engine.

---

# 42. Asset Independence

The physics system must never contain Spider-Man-specific assumptions.

Bad:

```text
if spiderMan:
    ...
```

Good:

```text
characterController:
    mass
    skeleton
    animationSet
    attachmentPoints
    movementProfile
```

This allows us to later support another character without rebuilding the simulation.

---

# 43. Web Attachment Points

The character rig should expose named attachment points such as:

```text
left_hand
right_hand
left_wrist
right_wrist
```

The web system references these points.

This prevents hardcoded vertex coordinates.

---

# 44. Lighting

Lighting should enhance depth but remain inexpensive.

Suggested baseline:

```text
ambient light
directional/key light
subtle fill
soft shadow if available
```

We should avoid heavy post-processing in the first build.

---

# 45. Effects

Effects are secondary.

Possible effects:

```text
web particles
small dust on landing
subtle motion blur
web impact particles
tiny spark/impact effect
```

Rules:

Effects must never be required for the core experience.

If performance drops, effects are removed first.

---

# 46. Audio

Audio is optional.

The core product must work silently.

Potential sounds:

```text
web shot
web attach
web release
swing whoosh
landing
small movement
```

Audio must be:

* low volume
* configurable
* non-repetitive
* never surprising
* disabled by default if necessary during early testing

No sound should play every time the same event occurs.

---

# 47. Accessibility

The pet must have an immediate disable mechanism.

Minimum:

```text
toggle off
pause
reduce visual effects
mute
```

The user must never need to close VS Code to stop Spider-Man.

---

# 48. Failure Safety

If the companion process crashes:

1. VS Code must remain fully usable.
2. The extension must detect the failure.
3. The user should receive a simple status indication.
4. Automatic restart may be attempted.
5. Repeated crashes must stop automatic restart loops.

The pet must fail independently from VS Code.

---

# 49. Extension Lifecycle

On activation:

```text
extension activated
      ↓
read configuration
      ↓
check supported environment
      ↓
start companion
      ↓
handshake
      ↓
start event bridge
```

On deactivate:

```text
stop event bridge
      ↓
tell companion to exit
      ↓
dispose resources
```

VS Code's extension lifecycle is based around `activate` and `deactivate`, and activation should be kept appropriately lazy/contextual.

---

# 50. Companion Handshake

The extension and renderer should not assume the other side is ready.

Handshake:

```text
EXTENSION
   │
   │ HELLO
   ▼
COMPANION
   │
   │ READY + VERSION
   ▼
EXTENSION
   │
   │ CONFIG
   ▼
COMPANION
```

Messages should have:

```text
version
type
timestamp
payload
```

---

# 51. IPC Rules

IPC messages should be small and purposeful.

Good:

```text
EDITOR_ACTIVITY
SAVE
PAUSE
RESUME
CONFIG_CHANGED
WINDOW_BOUNDS
SHUTDOWN
```

Bad:

```text
send editor state every frame
send entire workspace
send entire document
```

The 3D renderer does not need the user's source code.

---

# 52. Privacy Rule

The pet does not need to read source-code contents.

The extension should prefer activity signals over source-code collection.

Examples of acceptable high-level signals:

```text
user is typing
user saved a file
active editor changed
diagnostic count changed
debug session started
```

Do not transmit workspace source contents to the companion unless a future feature explicitly requires it.

The renderer needs a coding environment signal, not the user's code.

---

# 53. No Network Dependency

The core pet must run locally.

The normal experience should work without an Internet connection after installation.

The runtime should not depend on:

* cloud AI
* external image hosts
* remote asset URLs
* external web APIs

This makes the pet predictable and improves privacy and startup reliability.

---

# 54. No AI Required for MVP

We do not need an LLM to make Spider-Man look intelligent.

The first version should use deterministic software systems:

```text
finite state machine
+
weighted behavior selection
+
physics
+
randomness
+
history
```

AI can be considered later for higher-level personality, but it is not part of the MVP.

---

# 55. MVP Definition

MVP means:

### Environment

Desktop VS Code.

### Renderer

Real-time 3D renderer.

### Character

One 3D Spider-Man model.

### Physics

Real gravity + web constraint + velocity + release momentum.

### Movement

Autonomous full-screen swinging.

### Screen coverage

All four corners and entire playable VS Code window.

### Overlay

Transparent companion window.

### Behavior

Randomized non-repeating swing behavior.

### Controls

Enable / disable / pause / resume.

### Performance

Stable enough that normal coding remains responsive.

### Recovery

No permanent stuck/crashed state.

Nothing beyond this is required for the first playable build.

---

# 56. Version 1 Features

After MVP:

```text
save reaction
typing activity reaction
landing behavior
hanging
wall climbing
air tricks
better anchor selection
better collision
sound
settings UI
performance adaptation
multiple behavior personalities
```

---

# 57. Version 2 Possibilities

Only after the core experience is excellent:

```text
multiple suits
character customization
weather/lighting
day/night
city environment
web impact points
interactive pet mode
desktop-wide mode
additional characters
achievements
coding streak reactions
```

These are explicitly out of scope until the basic swing experience works.

---

# 58. Project Structure

Recommended structure:

```text
spiderman-vscode/
│
├── package.json
├── README.md
├── LICENSE
├── tsconfig.json
├── .vscode/
│
├── src/
│   ├── extension.ts
│   ├── commands/
│   ├── config/
│   ├── events/
│   ├── companion/
│   ├── ipc/
│   └── platform/
│
├── companion/
│   ├── renderer/
│   ├── physics/
│   ├── character/
│   ├── animation/
│   ├── web/
│   ├── behavior/
│   ├── world/
│   ├── window/
│   └── debug/
│
├── assets/
│   ├── character/
│   ├── animations/
│   ├── textures/
│   ├── audio/
│   └── effects/
│
├── test/
│   ├── extension/
│   ├── physics/
│   ├── behavior/
│   └── integration/
│
└── scripts/
```

The exact build tooling may change, but this separation must remain.

---

# 59. Dependency Rules

Keep dependencies minimal.

Every dependency must answer:

> What problem does this solve that we cannot reasonably solve ourselves?

Preferred categories:

```text
VS Code API
Three.js
physics engine if justified
GLTF tooling
platform-specific window integration
```

Do not add packages simply because they are convenient.

---

# 60. Testing Strategy

The project requires four levels of tests.

## Unit tests

Physics/math/state transitions.

## Simulation tests

Run the physics without rendering.

Examples:

```text
swing remains stable
release preserves velocity
anchor attachment works
invalid anchor recovers
boundary collision recovers
```

## Integration tests

Test:

```text
VS Code
↕
extension
↕
companion
```

## Manual visual tests

Necessary for:

* character motion
* realism
* web appearance
* overlay position
* depth
* animation quality

Physics can be unit-tested.

"Looks like Spider-Man is actually swinging" cannot be fully unit-tested.

---

# 61. Acceptance Tests

The following scenarios must pass before MVP is considered complete.

### Test A — Startup

Open VS Code.

Spider-Man appears without VS Code becoming unusable.

### Test B — Full-screen movement

Spider-Man can reach all four corners.

### Test C — Swing

A web attaches and Spider-Man swings under gravity.

### Test D — Release

Spider-Man releases and retains momentum.

### Test E — Reattach

Spider-Man successfully selects and attaches another anchor.

### Test F — Depth

Spider-Man moves through visible 3D depth.

### Test G — Randomness

Two sessions do not produce the same exact sequence.

### Test H — Resize

Resize VS Code.

Overlay follows.

### Test I — Move

Move VS Code.

Overlay follows.

### Test J — Minimize

Minimize VS Code.

Pet behavior pauses or hides safely.

### Test K — Restore

Restore VS Code.

Pet resumes correctly.

### Test L — Disable

Disable Spider-Man.

Overlay disappears.

### Test M — Crash

Terminate companion.

VS Code continues normally.

### Test N — Performance

Extended coding session does not make VS Code meaningfully sluggish.

---

# 62. Definition of "Real Physics"

We will not call it "real physics" merely because it looks smooth.

The MVP must contain measurable physical variables.

At minimum:

```text
position
velocity
acceleration
gravity
rope length
anchor position
tension
release velocity
```

A test/debug overlay must be capable of showing these values.

If Spider-Man's path is simply:

```text
lerp(start, end, t)
```

that is not sufficient for the final swing system.

---

# 63. Randomness Rules

Randomness must be:

### bounded

Never choose impossible destinations.

### weighted

Interesting actions should occur more often than bizarre ones.

### history-aware

Avoid immediate repetition.

### physically valid

Randomness may choose a destination or action, but physics determines the resulting motion.

---

# 64. Realism Rules

Never prioritize realism above usability.

For example:

Real life might let Spider-Man swing far outside the visible window.

Our simulation should bring him back into the usable area.

The goal is:

**physically believable + visually entertaining + safe for coding.**

Not:

**perfect real-world simulation at all costs.**

---

# 65. User Focus Rule

Spider-Man must never:

* open windows unexpectedly
* steal keyboard focus
* interrupt typing
* move the cursor
* click VS Code controls
* modify files
* execute code
* inspect source content unnecessarily

The extension exists to entertain the user while they work.

---

# 66. Architecture Rule: Separate Concerns

Never put everything in one `extension.ts`.

The following systems must remain separate:

```text
VS Code integration
Window management
IPC
Physics
Behavior
Rendering
Character
Animation
Webs
Configuration
Debugging
```

This is necessary because the project will become significantly more complex after the first prototype.

---

# 67. Development Order

We build in this order:

## Phase 1 — Skeleton

Create the VS Code extension.

Get activation, commands and settings working.

## Phase 2 — Companion

Launch the local renderer.

Create a transparent window.

Make the extension communicate with it.

## Phase 3 — Full-screen tracking

Make the companion follow VS Code's bounds.

Solve resizing, moving, maximizing and minimizing.

## Phase 4 — 3D

Render a simple 3D test object.

Do not start with Spider-Man.

Prove:

```text
transparent window
+
3D renderer
+
depth
+
FPS
```

## Phase 5 — Physics

Add a simple 3D pendulum.

Prove real swinging.

## Phase 6 — Web constraint

Replace the simple pendulum with a web-like constraint.

## Phase 7 — Character

Import the real 3D character.

## Phase 8 — Animation

Blend physics with character animation.

## Phase 9 — Autonomous behavior

Add anchor selection, randomness and behavior states.

## Phase 10 — Polish

Lighting, web effects, recovery, settings, performance.

This order is important.

Do not start by polishing Spider-Man's suit while the overlay architecture is still unproven.

---

# 68. First Technical Milestone

Before we touch the final Spider-Man model, the first successful prototype should look like this:

```text
VS Code
┌──────────────────────────────────────────────┐
│                                              │
│              ● web anchor                    │
│               \                              │
│                \                             │
│                 ●  ← 3D test sphere          │
│                 ↓                             │
│            physics swing                     │
│                                              │
└──────────────────────────────────────────────┘
```

If we cannot reliably achieve this, we do not proceed to the character.

---

# 69. Second Technical Milestone

A basic 3D humanoid placeholder must:

* attach to a web
* swing
* release
* retain momentum
* attach again
* move between corners
* respect screen boundaries

Only then do we integrate the final character.

---

# 70. Third Technical Milestone

The complete first playable build:

```text
VS Code
+
transparent overlay
+
3D Spider-Man
+
real swing physics
+
web attachment
+
full-screen movement
+
all four corners
+
autonomous random behavior
```

At this point we have the actual product rather than a technology demo.

---

# 71. Quality Bar

We do not ship because:

> "It works."

We ship MVP when:

> "It feels alive."

The user should watch the character and not immediately think:

> "That is a repeating animation."

They should think:

> "He is actually swinging around in there."

That perception is the primary quality metric.

---

# 72. Final Product Principle

The entire project can be reduced to five rules:

```text
REAL 3D
+
REAL PHYSICS
+
FULL VS CODE PLAYGROUND
+
AUTONOMOUS BEHAVIOR
+
ZERO INTERFERENCE WITH CODING
```

Everything else is secondary.

If a future feature conflicts with those five principles, the feature loses.

---

# 73. Project North Star

The final experience should feel like this:

> You open VS Code.
>
> Spider-Man is already there.
>
> You start writing code.
>
> He shoots a web into the upper-right of the 3D space.
>
> He swings across the editor with real momentum.
>
> He releases.
>
> He travels toward the lower-left.
>
> He rotates in the air.
>
> Another web fires.
>
> He catches it.
>
> He swings upward toward the top-left corner.
>
> You continue working.
>
> Spider-Man continues living his own little life.
>
> Your code remains the priority.

**That is the product we are building.**
