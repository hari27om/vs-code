import * as vscode from "vscode";

/**
 * Section 21 — Platform Strategy.
 *
 * The companion overlay is a LOCAL UI feature. It must never be launched
 * inside a remote extension host (Remote-SSH, Codespaces, containers) and
 * is not supported on VS Code for the Web. This module is the single
 * source of truth for that decision — nothing else should re-implement
 * this check.
 */

export type SupportLevel = "supported" | "experimental" | "unsupported";

export interface EnvironmentReport {
  isRemote: boolean;
  isWeb: boolean;
  platform: NodeJS.Platform | "web";
  supportLevel: SupportLevel;
  reason: string;
}

export function detectEnvironment(context: vscode.ExtensionContext): EnvironmentReport {
  // vscode.env.remoteName is set (e.g. "ssh-remote", "dev-container",
  // "codespaces") when the extension host is running remotely rather than
  // on the machine the UI is displayed on.
  const isRemote = typeof vscode.env.remoteName === "string" && vscode.env.remoteName.length > 0;

  // vscode.env.uiKind distinguishes the desktop client from the web client.
  const isWeb = vscode.env.uiKind === vscode.UIKind.Web;

  if (isWeb) {
    return {
      isRemote,
      isWeb,
      platform: "web",
      supportLevel: "unsupported",
      reason:
        "VS Code for the Web uses a browser-based extension host with no local companion process. Not supported (Section 21).",
    };
  }

  if (isRemote) {
    return {
      isRemote,
      isWeb,
      platform: process.platform,
      supportLevel: "unsupported",
      reason:
        "Extension host is remote (Remote-SSH / Codespaces / container). The overlay must run on the local UI side only (Section 21).",
    };
  }

  switch (process.platform) {
    case "win32":
    case "darwin":
      return {
        isRemote,
        isWeb,
        platform: process.platform,
        supportLevel: "supported",
        reason: "Desktop Windows/macOS is the v1 target platform.",
      };
    case "linux":
      return {
        isRemote,
        isWeb,
        platform: process.platform,
        supportLevel: "experimental",
        reason:
          "Linux window-management behavior varies by display server; Wayland does not support always-on-top windows. Treated as experimental (Section 21).",
      };
    default:
      return {
        isRemote,
        isWeb,
        platform: process.platform,
        supportLevel: "unsupported",
        reason: `Unrecognized platform "${process.platform}".`,
      };
  }
}
