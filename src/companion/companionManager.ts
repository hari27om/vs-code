import * as vscode from "vscode";
import * as path from "path";
import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import { EventEmitter } from "events";
import { EnvironmentReport } from "../platform/environment";
import { ChildProcessTransport } from "../ipc/transport";
import { SpidermanSettings } from "../config/settings";

/**
 * Sections 17-18 — the extension starts/stops the companion process and
 * exchanges IPC with it; it never renders the 3D world itself.
 * Section 48 — Failure Safety: detect crashes, allow automatic restart,
 * but stop retrying after repeated failures.
 * Section 50 — Companion Handshake: HELLO -> READY+VERSION -> CONFIG.
 *
 * PHASE STATUS: Phase 2 ("Companion") — implemented:
 *   - Spawns the real companion (Electron) process from companion/.
 *   - Performs the HELLO/READY/CONFIG handshake over stdio.
 *   - Sends PAUSE/RESUME/SHUTDOWN and forwards settings via CONFIG_CHANGED.
 *   - Crash detection with a capped automatic-restart loop.
 *
 * Explicitly NOT implemented here (later phases):
 *   - Real VS Code window bounds tracking (Phase 3) — WINDOW_BOUNDS
 *     messages are supported end-to-end but nothing yet computes real
 *     bounds to send.
 *   - Anything about what the companion renders (Phases 4+).
 */

export type CompanionStatus =
  | "unsupported_environment"
  | "stopped"
  | "starting"
  | "handshaking"
  | "running"
  | "crashed";

const HANDSHAKE_TIMEOUT_MS = 8000;
const MAX_RESTARTS = 3;
const RESTART_WINDOW_MS = 60_000;

export class CompanionManager extends EventEmitter implements vscode.Disposable {
  private status: CompanionStatus = "stopped";
  private child: ChildProcessWithoutNullStreams | null = null;
  private transport: ChildProcessTransport | null = null;
  private restartTimestamps: number[] = [];
  private explicitlyStopped = false;

  constructor(
    private readonly environment: EnvironmentReport,
    private readonly companionDir: string
  ) {
    super();
    if (this.environment.supportLevel === "unsupported") {
      this.status = "unsupported_environment";
    }
  }

  getStatus(): CompanionStatus {
    return this.status;
  }

  private setStatus(status: CompanionStatus): void {
    this.status = status;
    this.emit("statusChanged", status);
  }

  /**
   * Resolves the Electron binary shipped as a dependency of companion/
   * (Section 59 — a real, justified dependency: Electron is what gives us
   * a transparent/always-on-top window, per Section 20). Requires
   * `npm install` to have been run inside companion/ at least once.
   */
  private resolveElectronBinary(): string {
    const electronEntry = path.join(this.companionDir, "node_modules", "electron");
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const electronPath = require(electronEntry);
      if (typeof electronPath !== "string") {
        throw new Error("electron module did not export a binary path");
      }
      return electronPath;
    } catch (err) {
      throw new Error(
        `Could not resolve the Electron binary in ${electronEntry}. ` +
          `Run "npm install" inside the companion/ directory first. (${(err as Error).message})`
      );
    }
  }

  async start(settings?: SpidermanSettings): Promise<void> {
    if (this.environment.supportLevel === "unsupported") {
      throw new Error(`Companion cannot start: ${this.environment.reason}`);
    }
    if (this.status === "starting" || this.status === "handshaking" || this.status === "running") {
      return;
    }

    this.explicitlyStopped = false;
    this.setStatus("starting");

    const electronBinary = this.resolveElectronBinary();
    const mainScript = path.join(this.companionDir, "window", "main.js");

    const child = spawn(electronBinary, [mainScript], {
      cwd: this.companionDir,
      stdio: ["pipe", "pipe", "pipe"],
      windowsHide: false,
    }) as ChildProcessWithoutNullStreams;

    this.child = child;
    const transport = new ChildProcessTransport(child);
    this.transport = transport;

    transport.on("stderr", (chunk: string) => {
      console.log("[spiderman companion]", chunk.trim());
    });
    transport.on("protocolError", (line: string) => {
      console.log("[spiderman companion] malformed IPC line:", line);
    });

    child.on("exit", (code, signal) => this.onChildExit(code, signal));
    child.on("error", (err) => {
      console.log("[spiderman companion] process error:", err.message);
    });

    this.setStatus("handshaking");
    transport.send("HELLO", {});

    await transport.waitFor("READY", HANDSHAKE_TIMEOUT_MS);

    transport.send("CONFIG", {
      clickThrough: settings?.clickThrough ?? true,
      renderQuality: settings?.renderQuality ?? "medium",
      // Real bounds arrive in Phase 3; omitted here on purpose.
    });

    this.setStatus("running");
  }

  private onChildExit(code: number | null, signal: NodeJS.Signals | null): void {
    this.child = null;
    this.transport = null;

    if (this.explicitlyStopped) {
      this.setStatus("stopped");
      return;
    }

    this.setStatus("crashed");
    console.log(`[spiderman companion] exited (code=${code}, signal=${signal})`);

    const now = Date.now();
    this.restartTimestamps = this.restartTimestamps.filter(
      (t) => now - t < RESTART_WINDOW_MS
    );
    this.restartTimestamps.push(now);

    if (this.restartTimestamps.length > MAX_RESTARTS) {
      this.emit(
        "restartsExhausted",
        `Companion crashed ${this.restartTimestamps.length} times in the last ` +
          `${RESTART_WINDOW_MS / 1000}s. Automatic restart stopped (Section 48).`
      );
      return;
    }

    this.emit("crashed", { code, signal });
    // Caller (extension.ts) decides whether/when to call start() again;
    // this class only enforces the cap, per Section 48's "repeated
    // crashes must stop automatic restart loops."
  }

  async stop(): Promise<void> {
    this.explicitlyStopped = true;
    if (this.transport) {
      try {
        this.transport.send("SHUTDOWN", {});
      } catch {
        // process may already be gone; fall through to force-kill below.
      }
    }
    if (this.child) {
      const child = this.child;
      await new Promise<void>((resolve) => {
        const timer = setTimeout(() => {
          child.kill();
          resolve();
        }, 2000);
        child.once("exit", () => {
          clearTimeout(timer);
          resolve();
        });
      });
    }
    this.child = null;
    this.transport = null;
    this.setStatus("stopped");
  }

  pause(): void {
    if (this.status === "running" && this.transport) {
      this.transport.send("PAUSE", {});
    }
  }

  resume(): void {
    if (this.status === "running" && this.transport) {
      this.transport.send("RESUME", {});
    }
  }

  sendConfigChanged(settings: SpidermanSettings): void {
    if (this.status === "running" && this.transport) {
      this.transport.send("CONFIG_CHANGED", {
        clickThrough: settings.clickThrough,
        renderQuality: settings.renderQuality,
      });
    }
  }

  dispose(): void {
    this.explicitlyStopped = true;
    if (this.transport) {
      try {
        this.transport.send("SHUTDOWN", {});
      } catch {
        // ignore
      }
    }
    this.child?.kill();
    this.child = null;
    this.transport = null;
  }
}
