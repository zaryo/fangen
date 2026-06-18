import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import puppeteer from "puppeteer";
import Browser from "./browser.js";
import { EXTENSION_PAGE, EXTENSION_PATH, LOG_LEVEL } from "./extension.js";
import getBrowserServiceWorkerLogs from "./getBrowserServiceLogs.js";
import setExtensionLogLevel from "./setExtensionLogLevel.js";

export default async function launchChromium() {
  const CHROMIUM_BINARY_PATH = process.env.CHROMIUM_BINARY;
  if (!CHROMIUM_BINARY_PATH)
    throw new Error("CHROMIUM_BINARY env var is required");
  const userDataDir = fs.mkdtempSync(
    path.join(os.tmpdir(), "fangen-chromium-"),
  );

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: CHROMIUM_BINARY_PATH,
    userDataDir,
    pipe: true,
    ignoreDefaultArgs: [
      "--disable-extensions",
      "--disable-component-extensions-with-background-pages",
    ],
    args: ["--enable-unsafe-extension-debugging"],
  });

  const extensionId = await browser.installExtension(EXTENSION_PATH);

  const extensionPage = await browser.newPage();
  await extensionPage.goto(
    `chrome-extension://${extensionId}${EXTENSION_PAGE}`,
    { timeout: 1800 },
  );

  await setExtensionLogLevel(Browser.Chromium, extensionPage, LOG_LEVEL);

  process.on("exit", () => {
    browser.close().catch(() => {});
    fs.rmSync(userDataDir, { recursive: true, force: true });
  });

  return {
    browser,
    getServiceWorkerLogs: () =>
      getBrowserServiceWorkerLogs(Browser.Chromium, extensionPage),
    close: async () => {
      await browser.close();
      fs.rmSync(userDataDir, { recursive: true, force: true });
    },
  };
}
