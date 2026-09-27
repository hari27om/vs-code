# Spider-Man 3D Companion

A local desktop companion for VS Code that adds a lightweight, animated Spider-Man-inspired overlay to the editor experience. The project combines a transparent companion window, a 3D renderer, physical motion, and editor-aware behavior while staying non-intrusive during coding.

## Features

- Transparent companion window running alongside VS Code
- Local IPC connection between the extension host and the companion process
- 3D stage and character rendering with real-time motion
- Physics-driven motion and web-like swing behavior
- Editor-aware activity reactions and autonomous movement patterns
- Click-through and focus-safe overlay behavior for non-disruptive use
- Settings for quality, physics, and companion behavior

## Project status

Current status: Phase 10 — Polish.

This repository is aligned to the project playbook and has passed the verified development phases in order. It is currently in a release-readiness baseline: the core implementation and regression checks are in place, but final Marketplace publication still requires the remaining packaging, legal, and identity checks described in the release checklist.

## Supported environments

- Windows: supported
- macOS: supported
- Linux: experimental only
- Remote / web / Codespaces: not supported

The companion is designed for local desktop usage only. It is not intended for remote or browser-based editor environments.

## Installation

### Local development

```bash
npm install
npm run compile
```

If you also want to run the companion app directly:

```bash
cd companion
npm install
```

Then launch the extension in VS Code with the Extension Development Host:

- Press `F5`, or
- choose Run and Debug > Start Debugging

When the companion is enabled, the overlay process should start automatically and remain visually separate from the editor surface.

## Commands

The extension contributes commands for enabling, disabling, pausing, resuming, resetting, and restarting the companion. These are available from the Command Palette:

- Spider-Man: Enable
- Spider-Man: Disable
- Spider-Man: Pause
- Spider-Man: Resume
- Spider-Man: Restart Companion
- Spider-Man: Open Settings

## Configuration

The extension exposes settings such as:

```json
{
  "spiderman.enabled": true,
  "spiderman.clickThrough": true,
  "spiderman.renderQuality": "medium",
  "spiderman.physics.enabled": true,
  "spiderman.activityReactions": true
}
```

## Verification and packaging

Build and test locally with:

```bash
npm run compile
npm test
```

Package a VSIX locally with:

```bash
npm run package:vsix
```

## Repository notes

- Source specification: `PLAYBOOK.md`
- Release checklist: `RELEASE_CHECKLIST.md`
- Extension manifest: `package.json`
- Companion app: `companion/`

## Legal and publishing note

Before any public Marketplace publication, confirm the licensing, asset provenance, and publisher identity requirements in `PLAYBOOK.md` and the release checklist. This repository is not yet a final public distribution without those checks.

## License

This project is distributed under the license defined in the repository. Refer to `LICENSE` for full terms.
