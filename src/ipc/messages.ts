/**
 * Sections 50-51 — Companion Handshake & IPC Rules.
 *
 * This file defines the MESSAGE SHAPES ONLY. The actual transport
 * (child_process / IPC channel to the companion renderer) is built in
 * Phase 2 ("Companion") of the Development Order (Section 67) and lives
 * in src/companion + companion/window. Do not add transport logic here.
 *
 * IPC messages must stay small and purposeful (Section 51): no full
 * document contents, no per-frame source code, no entire workspace state.
 */

export type IpcMessageType =
  | "HELLO"
  | "READY"
  | "CONFIG"
  | "CONFIG_CHANGED"
  | "EDITOR_ACTIVITY"
  | "SAVE"
  | "WINDOW_BOUNDS"
  | "PAUSE"
  | "RESUME"
  | "SHUTDOWN";

export interface IpcMessage<TPayload = unknown> {
  version: string;
  type: IpcMessageType;
  timestamp: number;
  payload: TPayload;
}

/** Section 24 — high-level activity signals only, never source content. */
export type EditorActivityKind =
  | "typing_started"
  | "typing_stopped"
  | "file_saved"
  | "editor_changed"
  | "debugging_started"
  | "debugging_stopped"
  | "test_run"
  | "build_activity"
  | "diagnostic_change"
  | "workspace_opened"
  | "workspace_closed";

export interface EditorActivityPayload {
  kind: EditorActivityKind;
}

/** Section 22 — window tracking payload sent to the companion. */
export interface WindowBoundsPayload {
  x: number;
  y: number;
  width: number;
  height: number;
  displayId: string | number;
  dpiScale: number;
  isMinimized: boolean;
  isFullScreen: boolean;
}

export interface HandshakeReadyPayload {
  version: string;
}
