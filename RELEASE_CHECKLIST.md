# Release checklist for publishable VS Code extension

This checklist is aligned to the project rules in `PLAYBOOK.md` and the verified phase sequence in the repo.

## 1. Marketplace metadata
- Replace `publisher` placeholder in `package.json`.
- Add real extension icon asset.
- Add repository, homepage, and bugs URLs.
- Set categories and keywords appropriately.
- Confirm `displayName` matches the final public branding.
- Ensure `description` is concise and accurate.

## 2. Public-facing docs
- Rewrite `README.md` for end users, not internal milestone notes.
- Add installation steps.
- Add platform support matrix.
- Add troubleshooting section.
- Add screenshots and usage examples.
- Keep internal development notes in `PLAYBOOK.md` and companion docs.

## 3. Supported environments
- Keep Windows/macOS as the supported desktop targets.
- Keep Linux experimental only.
- Keep remote/web unsupported.
- Ensure user-facing warnings explain the restriction clearly.

## 4. Production quality
- Add linting and formatting tools.
- Add CI pipeline for compile + tests + packaging.
- Add a packaging command for VSIX validation.
- Stabilize startup and crash recovery logic.
- Check that the overlay never steals focus.
- Confirm the app remains non-disruptive during coding.

## 5. Legal and asset review
- Reconfirm IP and licensing rules from `PLAYBOOK.md`.
- Ensure all assets and code are appropriately licensed or original.
- Confirm final distribution is acceptable before Marketplace publication.

## 6. Final publish gate
- Version bump to a release candidate.
- Build the VSIX locally.
- Install and test the VSIX from a clean environment.
- Validate supported desktop platforms.
- Publish only after the packaging and legal gates pass.
