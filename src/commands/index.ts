import * as vscode from "vscode";
import { CompanionManager } from "../companion/companionManager";
import { readSettings } from "../config/settings";

/**
 * Section 36 — Commands.
 *
 * PHASE STATUS: Phase 2. Enable/Disable/Pause/Resume/Toggle Click-Through
 * now genuinely talk to the companion process over IPC. Reset and Debug
 * Physics remain explicit stubs because there is no physics system yet
 * (Phase 5+) — they say so rather than pretending to do something.
 */
export function registerCommands(
  context: vscode.ExtensionContext,
  companion: CompanionManager
): void {
  const notImplemented = (feature: string, phase: string) => () => {
    vscode.window.showInformationMessage(
      `Spider-Man: "${feature}" is not implemented yet (${phase}).`
    );
  };

  const commands: Array<[string, (...args: unknown[]) => unknown]> = [
    [
      "spiderman.enable",
      async () => {
        try {
          await companion.start(readSettings());
          vscode.window.showInformationMessage("Spider-Man: enabled.");
        } catch (err) {
          vscode.window.showWarningMessage(
            `Spider-Man could not be enabled here: ${(err as Error).message}`
          );
        }
      },
    ],
    [
      "spiderman.disable",
      async () => {
        await companion.stop();
        vscode.window.showInformationMessage("Spider-Man: disabled.");
      },
    ],
    [
      "spiderman.pause",
      () => {
        companion.pause();
      },
    ],
    [
      "spiderman.resume",
      () => {
        companion.resume();
      },
    ],
    [
      "spiderman.toggleClickThrough",
      async () => {
        const cfg = vscode.workspace.getConfiguration("spiderman");
        const current = cfg.get<boolean>("clickThrough", true);
        await cfg.update("clickThrough", !current, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage(
          `Spider-Man: click-through ${!current ? "enabled" : "disabled"}.`
        );
        // onSettingsChanged (wired in extension.ts) forwards this to the
        // companion as CONFIG_CHANGED automatically.
      },
    ],
    ["spiderman.reset", notImplemented("Reset", "Phase 5+ — Physics")],
    [
      "spiderman.openSettings",
      async () => {
        await vscode.commands.executeCommand(
          "workbench.action.openSettings",
          "spiderman"
        );
      },
    ],
    [
      "spiderman.restartCompanion",
      async () => {
        await companion.stop();
        try {
          await companion.start(readSettings());
          vscode.window.showInformationMessage("Spider-Man companion restarted.");
        } catch (err) {
          vscode.window.showWarningMessage(
            `Spider-Man companion restart failed: ${(err as Error).message}`
          );
        }
      },
    ],
    [
      "spiderman.debugPhysics",
      () => {
        const settings = readSettings();
        vscode.window.showInformationMessage(
          settings.debugPhysics
            ? "Debug physics overlay requested, but the physics system does not exist until Phase 5."
            : "Enable spiderman.debugPhysics in settings first, then run this command. (Physics arrives in Phase 5.)"
        );
      },
    ],
  ];

  for (const [id, handler] of commands) {
    context.subscriptions.push(vscode.commands.registerCommand(id, handler));
  }
}
