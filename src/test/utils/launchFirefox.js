import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import puppeteer from "puppeteer";
import Browser from "./browser.js";
import deleteBrowserStreamingUrls from "./deleteBrowserStreamingUrls.js";
import { EXTENSION_PAGE, EXTENSION_PATH } from "./extension.js";
import getBrowserStreamingUrls from "./getBrowserStreamingUrls.js";

async function pollExtensionUuid(addonId, timeout = 1800, userDataDir) {
  const prefsPath = path.join(userDataDir, "prefs.js");
  const start = Date.now();

  while (Date.now() - start < timeout) {
    try {
      const prefsContent = fs.readFileSync(prefsPath, "utf8");
      const uuidsLine = prefsContent
        .split("\n")
        .find((line) => line.includes("webextensions.uuids"));

      if (uuidsLine) {
        const rawValue = uuidsLine.match(
          /"extensions\.webextensions\.uuids", "(.+)"\);/,
        )[1];
        const extensionUuids = JSON.parse(rawValue.replace(/\\"/g, '"'));
        const uuid = extensionUuids[addonId];

        if (uuid) return uuid;
      }
    } catch {}

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error(`Timeout waiting for Firefox UUID for addon ${addonId}`);
}

export default async function launchFirefox() {
  const FIREFOX_BINARY_PATH = process.env.FIREFOX_BINARY;
  if (!FIREFOX_BINARY_PATH)
    throw new Error("FIREFOX_BINARY env var is required");

  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "fangen-firefox-"));

  const browser = await puppeteer.launch({
    browser: "firefox",
    executablePath: FIREFOX_BINARY_PATH,
    extraPrefsFirefox: {
      "xpinstall.signatures.required": false,
    },
    headless: true,
    protocol: "webDriverBiDi",
    timeout: 1800,
    userDataDir,
  });

  const addonId = await browser.installExtension(EXTENSION_PATH);
  const extensionUuid = await pollExtensionUuid(addonId, 1800, userDataDir);

  const extensionPage = await browser.newPage();
  await extensionPage.goto(
    `moz-extension://${extensionUuid}${EXTENSION_PAGE}`,
    {
      timeout: 1800,
      waitUntil: "commit",
    },
  );

  process.on("exit", () => {
    browser.close().catch(() => {});
    fs.rmSync(userDataDir, { recursive: true, force: true });
  });

  return {
    browser,
    close: async () => {
      await browser.close();
      fs.rmSync(userDataDir, { recursive: true, force: true });
    },
    deleteBrowserStreamingUrls: (tabId) =>
      deleteBrowserStreamingUrls(Browser.FIREFOX, extensionPage, tabId),
    getActiveTabId: () =>
      extensionPage.evaluate(async () => {
        const [activeTab] = await browser.tabs.query({
          active: true,
          currentWindow: true,
        });
        return activeTab?.id ?? null;
      }),
    getBrowserStreamingUrls: (tabId) =>
      getBrowserStreamingUrls(Browser.FIREFOX, extensionPage, tabId),
  };
}
