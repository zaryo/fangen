import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import puppeteer from "puppeteer";
import Browser from "./browser.js";
import deleteBrowserStreamingUrls from "./deleteBrowserStreamingUrls.js";
import { EXTENSION_PAGE, EXTENSION_PATH } from "./extension.js";
import getBrowserStreamingUrls from "./getBrowserStreamingUrls.js";

export default async function launchChromium() {
  const CHROMIUM_BINARY_PATH = process.env.CHROMIUM_BINARY;
  if (!CHROMIUM_BINARY_PATH)
    throw new Error("CHROMIUM_BINARY env var is required");
  const userDataDir = fs.mkdtempSync(
    path.join(os.tmpdir(), "fangen-chromium-"),
  );

  const browser = await puppeteer.launch({
    args: [
      "--enable-unsafe-extension-debugging",
      ...(process.env.CI ? ["--no-sandbox", "--disable-setuid-sandbox"] : []),
    ],
    executablePath: CHROMIUM_BINARY_PATH,
    headless: true,
    ignoreDefaultArgs: [
      "--disable-extensions",
      "--disable-component-extensions-with-background-pages",
    ],
    pipe: true,
    userDataDir,
  });

  const extensionId = await browser.installExtension(EXTENSION_PATH);

  const extensionPage = await browser.newPage();
  await extensionPage.goto(
    `chrome-extension://${extensionId}${EXTENSION_PAGE}`,
    {
      timeout: 1800,
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
      deleteBrowserStreamingUrls(Browser.CHROMIUM, extensionPage, tabId),
    getActiveTabId: () =>
      extensionPage.evaluate(async () => {
        const [activeTab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });
        return activeTab?.id ?? null;
      }),
    getBrowserStreamingUrls: (tabId) =>
      getBrowserStreamingUrls(Browser.CHROMIUM, extensionPage, tabId),
  };
}
