import * as vscode from "vscode";

/**
 * Typed view over the `spiderman.*` settings defined in package.json.
 * This is the ONLY place that should call vscode.workspace.getConfiguration
 * for the "spiderman" section — keep config reads centralized (Rule 66:
 * Separate Concerns).
 */
export interface SpidermanSettings {
  enabled: boolean;
  physicsEnabled: boolean;
  swingSpeed: number;
  activityReactions: boolean;
  renderQuality: "low" | "medium" | "high";
  maxParticles: number;
  shadows: boolean;
  soundEnabled: boolean;
  interactive: boolean;
  clickThrough: boolean;
  maxCharacterSize: number;
  showWebs: boolean;
  debugPhysics: boolean;
}

const SECTION = "spiderman";

export function readSettings(): SpidermanSettings {
  const cfg = vscode.workspace.getConfiguration(SECTION);

  return {
    enabled: cfg.get<boolean>("enabled", true),
    physicsEnabled: cfg.get<boolean>("physics.enabled", true),
    swingSpeed: cfg.get<number>("swingSpeed", 1.0),
    activityReactions: cfg.get<boolean>("activityReactions", true),
    renderQuality: cfg.get<"low" | "medium" | "high">("renderQuality", "medium"),
    maxParticles: cfg.get<number>("maxParticles", 100),
    shadows: cfg.get<boolean>("shadows", true),
    soundEnabled: cfg.get<boolean>("sound.enabled", false),
    interactive: cfg.get<boolean>("interactive", false),
    clickThrough: cfg.get<boolean>("clickThrough", true),
    maxCharacterSize: cfg.get<number>("maxCharacterSize", 1.0),
    showWebs: cfg.get<boolean>("showWebs", true),
    debugPhysics: cfg.get<boolean>("debugPhysics", false),
  };
}

/**
 * Fires whenever any `spiderman.*` setting changes. Callers should re-read
 * settings via readSettings() rather than caching individual values.
 */
export function onSettingsChanged(
  listener: (settings: SpidermanSettings) => void
): vscode.Disposable {
  return vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration(SECTION)) {
      listener(readSettings());
    }
  });
}
