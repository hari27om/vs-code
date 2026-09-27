import * as vscode from "vscode";
import * as path from "path";
import { readSettings, onSettingsChanged } from "./config/settings";
import { detectEnvironment } from "./platform/environment";
import { CompanionManager } from "./companion/companionManager";
import { registerCommands } from "./commands/index";
import { ActivitySignalAdapter } from "./events/activitySignals";
import { WindowBoundsPayload } from "./ipc/messages";
import { normalizeWindowBounds } from "./window/bounds";

let electron: any = null;

function resolveElectronModule(extensionPath: string): any {
  try {
    return require(path.join(extensionPath, "companion", "node_modules", "electron"));
  } catch {
    return null;
  }
}

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
 * PHASE STATUS: Phase 3 ("Full-screen tracking"). The extension now
 * reads the active VS Code window bounds and forwards them to the
 * companion. This is the required gate before any 3D work (Phase 4).
 */

let companionManager: CompanionManager | undefined;
let activitySignals: ActivitySignalAdapter | undefined;

function getWindowBounds(): WindowBoundsPayload | null {
  try {
    const currentWindow =
      electron?.BrowserWindow?.getFocusedWindow?.() ??
      electron?.remote?.getCurrentWindow?.() ??
      null;

    if (currentWindow && typeof currentWindow.getBounds === "function") {
      const bounds = currentWindow.getBounds();
      const display =
        (electron?.screen && typeof electron.screen.getDisplayNearestPoint === "function"
          ? electron.screen.getDisplayNearestPoint({ x: bounds.x, y: bounds.y })
          : null) ??
        (electron?.screen && typeof electron.screen.getPrimaryDisplay === "function"
          ? electron.screen.getPrimaryDisplay()
          : null) ??
        null;

      return normalizeWindowBounds(
        bounds,
        display,
        {
          isMinimized:
            typeof currentWindow.isMinimized === "function" ? currentWindow.isMinimized() : false,
          isFullScreen:
            typeof currentWindow.isFullScreen === "function" ? currentWindow.isFullScreen() : false,
        }
      );
    }
  } catch {
    // fallback
  }

  return normalizeWindowBounds(
    { x: 100, y: 100, width: 1000, height: 750 },
    null,
    { isMinimized: false, isFullScreen: false }
  );
}

function startWindowBoundsTracking(): vscode.Disposable {
  const sendCurrentBounds = () => {
    if (!companionManager) {
      return;
    }

    const bounds = getWindowBounds();
    if (bounds) {
      companionManager.sendWindowBounds(bounds);
    }
  };

  sendCurrentBounds();

  const windowStateListener = vscode.window.onDidChangeWindowState(() => {
    sendCurrentBounds();
  });

  const intervalId = setInterval(() => {
    if (companionManager?.getStatus() === "running") {
      sendCurrentBounds();
    }
  }, 1000);

  return {
    dispose: () => {
      clearInterval(intervalId);
      windowStateListener.dispose();
    },
  };
}

export function activate(context: vscode.ExtensionContext): void {
  electron = resolveElectronModule(context.extensionPath);

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

  context.subscriptions.push(startWindowBoundsTracking());

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
