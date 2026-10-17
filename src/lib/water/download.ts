/** Where TinyKite Water's desktop builds are published. */
export const WATER_RELEASES_API = "https://api.github.com/repos/tinykite-co/apps/releases";

/** Every published build, shown when no installer for the visitor's desktop can be found. */
export const WATER_RELEASES_PAGE = "https://github.com/tinykite-co/apps/releases";

export type DesktopPlatform = "mac" | "windows";

/** The button text for each desktop. */
export const DOWNLOAD_LABELS: Record<DesktopPlatform, string> = {
  mac: "Download for macOS",
  windows: "Download for Windows",
};

/** The installer file types each desktop can open. */
const INSTALLER_EXTENSIONS: Record<DesktopPlatform, readonly string[]> = {
  mac: [".dmg"],
  windows: [".exe", ".msi"],
};

export interface ReleaseAsset {
  name: string;
  browser_download_url: string;
}

export interface Release {
  draft: boolean;
  prerelease: boolean;
  assets: readonly ReleaseAsset[];
}

/** Reads the visitor's desktop from the user agent; anything not Windows is offered the Mac build. */
export function detectPlatform(userAgent: string): DesktopPlatform {
  return userAgent.includes("Win") ? "windows" : "mac";
}

/**
 * The newest published installer for a desktop, or null when none exists.
 *
 * Builds for each desktop are released separately, so the latest release can
 * hold only another desktop's installer; walking the list (newest first, as
 * the releases API returns it) finds the newest one this visitor can run.
 */
export function newestInstallerUrl(releases: readonly Release[], platform: DesktopPlatform): string | null {
  for (const release of releases) {
    if (release.draft || release.prerelease) continue;
    const installer = release.assets.find((asset) => isInstallerFor(asset.name, platform));
    if (installer) return installer.browser_download_url;
  }
  return null;
}

function isInstallerFor(fileName: string, platform: DesktopPlatform): boolean {
  return INSTALLER_EXTENSIONS[platform].some((extension) => fileName.endsWith(extension));
}
