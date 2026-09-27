import * as vscode from "vscode";
import { EditorActivityKind } from "../ipc/messages";

/**
 * Sections 17 & 24 — VS Code Event Adapter / Activity Signals.
 *
 * PHASE STATUS: NOT WIRED YET. Per the Development Order (Section 67),
 * activity signals feed the Behavior Brain (Section 26), which does not
 * exist until Phase 9. Sending signals to a companion that isn't running
 * (Phase 1) would have no effect, so this module currently exposes the
 * types and a disabled listener only, so the eventual wiring has a single,
 * obvious home (Rule 66 — Separate Concerns).
 *
 * When implemented, this must only ever emit the high-level kinds below —
 * never document text or workspace contents (Section 52 — Privacy Rule).
 */

export type ActivitySignalListener = (kind: EditorActivityKind) => void;

export class ActivitySignalAdapter implements vscode.Disposable {
  private readonly disposables: vscode.Disposable[] = [];
  private listener: ActivitySignalListener | null = null;
  private wired = false;

  setListener(listener: ActivitySignalListener): void {
    this.listener = listener;
  }

  /**
   * Intentionally not called from extension.ts yet. Left here, disabled,
   * so it is obvious where real vscode.workspace / vscode.window event
   * subscriptions (onDidSaveTextDocument, onDidChangeActiveTextEditor,
   * onDidChangeTextDocument for typing start/stop, debug session events,
   * diagnostics change) will be added once the companion exists to
   * receive them.
   */
  wire(): void {
    this.wired = true;
    const activeListener = this.listener;
    if (activeListener) {
      // Phase 2/3 TODO: subscribe to real VS Code events and forward
      // high-level kinds via this.listener, per Section 24's example:
      //   save event -> small probability -> Spider-Man performs a flourish
      // Do NOT let these signals control physics directly (Section 25).
    }
  }

  isWired(): boolean {
    return this.wired;
  }

  dispose(): void {
    this.disposables.forEach((d) => d.dispose());
    this.disposables.length = 0;
  }
}
