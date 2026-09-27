import * as vscode from "vscode";
import * as path from "path";
import { readSettings, onSettingsChanged } from "./config/settings";
import { detectEnvironment } from "./platform/environment";
import { CompanionManager } from "./companion/companionManager";
import { registerCommands } from "./commands/index";
import { ActivitySignalAdapter } from "./events/activitySignals";

/**
 * Section 49 — Extension Lifecycle.
 *
 *   extension activated
 *         v
 *   read configuration
 *         v
 *   check supported environment
 *         v
 *   start companion          <- Phase 2: implemented below.
 *         v
 *   handshake                 <- Phase 2: implemented in CompanionManager.
 *         v
 *   start event bridge        <- still Phase 3 (activity signals are
 *                                 defined but not wired — see
 *                                 events/activitySignals.ts).
 *
 * PHASE STATUS: Phase 2 ("Companion"). On activation, if the environment
 * is supported and spiderman.enabled is true, the extension now actually
 * spawns the companion process and performs the real handshake. Nothing
 * about window bounds tracking (Phase 3) or rendering (Phase 4+) lives
 * here.
 */

let companionManager: CompanionManager | undefined;
let activitySignals: ActivitySignalAdapter | undefined;

export function activate(context: vscode.ExtensionContext): void {
  const settings = readSettings();
  const environment = detectEnvironment(context);

  logInitialState(settings.enabled, environment);

  const companionDir = path.join(context.extensionPath, "companion");
  companionManager = new CompanionManager(environment, companionDir);
  context.subscriptions.push(companionManager);

  companionManager.on("crashed", () => {
    vscode.window.showWarningMessage(
      "Spider-Man companion crashed. Attempting to restart it."
    );
    companionManager?.start(readSettings()).catch((err) => {
      console.log("[spiderman] restart failed:", (err as Error).message);
    });
  });

  companionManager.on("restartsExhausted", (reason: string) => {
    vscode.window.showErrorMessage(
      `Spider-Man: ${reason} Run "Spider-Man: Restart Companion" to try again manually.`
    );
  });

  activitySignals = new ActivitySignalAdapter();
  context.subscriptions.push(activitySignals);

  registerCommands(context, companionManager);

  context.subscriptions.push(
    onSettingsChanged((updated) => {
      companionManager?.sendConfigChanged(updated);
    })
  );

  if (environment.supportLevel === "unsupported") {
    vscode.window.showWarningMessage(
      `Spider-Man: this environment is not supported yet — ${environment.reason}`
    );
  } else if (environment.supportLevel === "experimental") {
    vscode.window.showInformationMessage(
      `Spider-Man: running in experimental mode on this platform — ${environment.reason}`
    );
  }

  if (settings.enabled && environment.supportLevel !== "unsupported") {
    companionManager.start(settings).catch((err) => {
      vscode.window.showWarningMessage(
        `Spider-Man could not start automatically: ${(err as Error).message}`
      );
    });
  }
}

export function deactivate(): Thenable<void> | void {
  // Section 49 — deactivate: stop event bridge, tell companion to exit
  // (SHUTDOWN over IPC, Section 51), dispose resources.
  activitySignals?.dispose();
  return companionManager?.stop();
}

function logInitialState(
  enabled: boolean,
  environment: ReturnType<typeof detectEnvironment>
): void {
  console.log("[spiderman] activated", {
    enabled,
    supportLevel: environment.supportLevel,
    platform: environment.platform,
    isRemote: environment.isRemote,
    isWeb: environment.isWeb,
  });
}
