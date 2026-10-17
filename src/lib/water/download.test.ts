import { test } from "node:test";
import assert from "node:assert/strict";
import { detectPlatform, newestInstallerUrl, type Release } from "./download.ts";

function release(names: string[], overrides: Partial<Release> = {}): Release {
  return {
    draft: false,
    prerelease: false,
    assets: names.map((name) => ({ name, browser_download_url: `https://example.test/${name}` })),
    ...overrides,
  };
}

// The shape the releases API returned on 2026-10-17: the latest release has only Windows installers.
const windowsLatestThenMac = [
  release(["TinyKite.Water_0.1.0_x64-setup.exe", "TinyKite.Water_0.1.0_x64_en-US.msi"]),
  release(["TinyKite.Water_0.1.0_aarch64.dmg"]),
];

test("a Mac visitor gets the newest Mac build even when the latest release is Windows-only", () => {
  assert.equal(newestInstallerUrl(windowsLatestThenMac, "mac"), "https://example.test/TinyKite.Water_0.1.0_aarch64.dmg");
});

test("a Windows visitor gets the first Windows installer of the latest release", () => {
  assert.equal(newestInstallerUrl(windowsLatestThenMac, "windows"), "https://example.test/TinyKite.Water_0.1.0_x64-setup.exe");
});

test("the newest release with a matching installer wins over older ones", () => {
  const releases = [release(["new.dmg"]), release(["old.dmg"])];
  assert.equal(newestInstallerUrl(releases, "mac"), "https://example.test/new.dmg");
});

test("drafts and prereleases are never offered", () => {
  const releases = [release(["draft.dmg"], { draft: true }), release(["beta.dmg"], { prerelease: true }), release(["stable.dmg"])];
  assert.equal(newestInstallerUrl(releases, "mac"), "https://example.test/stable.dmg");
});

test("no installer for the desktop gives null, so the page can fall back to the releases list", () => {
  assert.equal(newestInstallerUrl([release(["notes.txt"])], "mac"), null);
  assert.equal(newestInstallerUrl([], "windows"), null);
});

test("Windows user agents are Windows; everything else is offered the Mac build", () => {
  assert.equal(detectPlatform("Mozilla/5.0 (Windows NT 10.0; Win64; x64)"), "windows");
  assert.equal(detectPlatform("Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5)"), "mac");
  assert.equal(detectPlatform(""), "mac");
});
